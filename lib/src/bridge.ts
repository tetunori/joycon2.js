// Robust bridge for p5 usage: ensure `window.JoyCon2` is a constructor function
// or provide a proxy constructor that queues calls until the real constructor appears.
(() => {
  const PROBE_INTERVAL = 200; // ms
  const PROBE_TIMEOUT = 10_000; // ms

  function findConstructor() {
    const names = [
      'Joycon2', // common
      'JoyCon2',
    ];

    for (const name of names) {
      const val = (window as any)[name];
      if (!val) continue;
      if (typeof val === 'function') return val;
      if (typeof val === 'object') {
        // try common property shapes inside a bundle object
        const props = ['Joycon2', 'JoyCon2'];
        for (const p of props) {
          if (typeof (val as any)[p] === 'function') return (val as any)[p];
        }
        // if the object itself exposes named exports (e.g., JoyCon2Device), try to find any function value
        for (const k of Object.keys(val)) {
          try {
            if (typeof (val as any)[k] === 'function') return (val as any)[k];
          } catch (e) {
            // ignore
          }
        }
      }
    }
    return null;
  }

  // Keep a list of proxy instances so we can bind them when real ctor appears
  const proxyInstances = new Set<any>();

  function createProxyCtor() {
    function ProxyCtor(this: any, ...ctorArgs: any[]) {
      if (!(this instanceof (ProxyCtor as any))) throw new Error('JoyCon2 must be called with new');
      // store ctor args so we can instantiate real instance later
      this.__ctorArgs = ctorArgs;
      this.__real = null;
      this.__queue = [];

      // enqueue a generic task: {type, args, resolve?, reject?}
      const enqueueTask = (type: string, args: any[], maybeResolve?: any, maybeReject?: any) => {
        const task: any = { type, args };
        if (maybeResolve) {
          task.resolve = maybeResolve;
          task.reject = maybeReject;
        }
        this.__queue.push(task);
        if (type === 'connect' && maybeResolve) {
          // return the promise only for connect
          return new Promise((resolve, reject) => {
            task.resolve = resolve;
            task.reject = reject;
          });
        }
      };

      // proxy methods
      this.connect = (...args: any[]) => {
        if (this.__real && typeof this.__real.connect === 'function') return this.__real.connect(...args);
        return enqueueTask('connect', args, null, null);
      };

      this.disconnect = (...args: any[]) => {
        if (this.__real && typeof this.__real.disconnect === 'function') return this.__real.disconnect(...args);
        return enqueueTask('disconnect', args);
      };

      this.onUpdate = (cb: any) => {
        if (this.__real && typeof this.__real.onUpdate === 'function') return this.__real.onUpdate(cb);
        return enqueueTask('onUpdate', [cb]);
      };

      Object.defineProperty(this, 'gJoyCon2Data', {
        get: () => (this.__real ? this.__real.gJoyCon2Data : null),
        configurable: true,
      });

      Object.defineProperty(this, 'buttonUp', {
        get: () => (this.__real ? !!(this.__real.gJoyCon2Data && this.__real.gJoyCon2Data.buttonUp) : false),
        configurable: true,
      });

      // register for later binding
      proxyInstances.add(this);
    }

    // keep name for nicer stack traces when possible
    try { Object.defineProperty(ProxyCtor, 'name', { value: 'JoyCon2' }); } catch (e) {}

    return ProxyCtor as any;
  }

  function bindRealConstructor(RealCtor: any) {
    if (typeof RealCtor !== 'function') return;
    // set canonical global
    try {
      (window as any).JoyCon2 = RealCtor;
    } catch (e) {
      // ignore
    }

    // bind existing proxy instances
    for (const proxy of Array.from(proxyInstances)) {
      try {
        // instantiate real instance with same ctor args
        const real = new RealCtor(...(proxy.__ctorArgs || []));
        // forward queued operations
        for (const task of proxy.__queue) {
          if (task.type === 'onUpdate') {
            try { real.onUpdate(...(task.args || [])); } catch (e) {}
            continue;
          }
          if (task.type === 'disconnect') {
            try { real.disconnect(...(task.args || [])); } catch (e) {}
            continue;
          }
          if (task.type === 'connect') {
            // if the task has resolve/reject, call connect and resolve/reject accordingly
            if (task.resolve) {
              real.connect(...(task.args || [])).then(task.resolve).catch(task.reject);
            } else {
              // fire-and-forget
              real.connect(...(task.args || [])).catch(()=>{});
            }
            continue;
          }
        }

        // attach the real instance so getters and direct calls work
        proxy.__real = real;
        // stop forwarding queue for this instance
        proxy.__queue = [];
        proxyInstances.delete(proxy);
      } catch (e) {
        // leave the proxy in place if instantiation fails
        console.warn('joycon bridge: failed to bind proxy instance', e);
      }
    }
  }

  // Install either direct constructor (if already available) or a proxy
  const RealCtor = findConstructor();
  if (RealCtor) {
    try {
      (window as any).JoyCon2 = RealCtor;
      // also set common lowercase alias to be forgiving
      try { (window as any).Joycon2 = RealCtor; } catch (e) {}
      console.log('joycon bridge: JoyCon2 constructor installed');
      return;
    } catch (e) {
      // fallthrough to proxy
      console.warn('joycon bridge: failed to set JoyCon2 directly', e);
    }
  }

  // Create proxy constructor so sketches can do `new JoyCon2()` immediately
  const Proxy = createProxyCtor();
  try { (window as any).JoyCon2 = Proxy; } catch (e) {}
  try { (window as any).Joycon2 = Proxy; } catch (e) {}
  console.log('joycon bridge: installed proxy constructor for JoyCon2 (will bind when real lib loads)');

  // probe for the real constructor and bind when it appears
  const start = Date.now();
  const t = setInterval(() => {
    const ctor = findConstructor();
    if (ctor) {
      clearInterval(t);
      try {
        bindRealConstructor(ctor);
        console.log('joycon bridge: real JoyCon2 constructor found and bound');
      } catch (e) {
        console.warn('joycon bridge: error while binding real constructor', e);
      }
      return;
    }
    if (Date.now() - start > PROBE_TIMEOUT) {
      clearInterval(t);
      console.warn('joycon bridge: timed out waiting for real JoyCon2 constructor');
    }
  }, PROBE_INTERVAL);

})();
