(() => {
  function l() {
    const t = [
      "JoyCon2",
      // common
      "Joycon2",
      "joycon2",
      "BleLibTemplate",
      "Joycon",
      "JoyCon"
    ];
    for (const e of t) {
      const n = window[e];
      if (n) {
        if (typeof n == "function") return n;
        if (typeof n == "object") {
          const o = ["Joycon2", "JoyCon2", "joycon2", "joycon", "default", "Joycon"];
          for (const r of o)
            if (typeof n[r] == "function") return n[r];
          for (const r of Object.keys(n))
            try {
              if (typeof n[r] == "function") return n[r];
            } catch {
            }
        }
      }
    }
    return null;
  }
  const s = /* @__PURE__ */ new Set();
  function f() {
    function t(...e) {
      if (!(this instanceof t)) throw new Error("JoyCon2 must be called with new");
      this.__ctorArgs = e, this.__real = null, this.__queue = [];
      const n = (o, r, i, h) => {
        const c = { type: o, args: r };
        if (i && (c.resolve = i, c.reject = h), this.__queue.push(c), o === "connect" && i)
          return new Promise((p, w) => {
            c.resolve = p, c.reject = w;
          });
      };
      this.connect = (...o) => this.__real && typeof this.__real.connect == "function" ? this.__real.connect(...o) : n("connect", o, null, null), this.disconnect = (...o) => this.__real && typeof this.__real.disconnect == "function" ? this.__real.disconnect(...o) : n("disconnect", o), this.onUpdate = (o) => this.__real && typeof this.__real.onUpdate == "function" ? this.__real.onUpdate(o) : n("onUpdate", [o]), Object.defineProperty(this, "gJoyCon2Data", {
        get: () => this.__real ? this.__real.gJoyCon2Data : null,
        configurable: !0
      }), Object.defineProperty(this, "buttonUp", {
        get: () => this.__real ? !!(this.__real.gJoyCon2Data && this.__real.gJoyCon2Data.buttonUp) : !1,
        configurable: !0
      }), s.add(this);
    }
    try {
      Object.defineProperty(t, "name", { value: "JoyCon2" });
    } catch {
    }
    return t;
  }
  function d(t) {
    if (typeof t == "function") {
      try {
        window.JoyCon2 = t;
      } catch {
      }
      for (const e of Array.from(s))
        try {
          const n = new t(...e.__ctorArgs || []);
          for (const o of e.__queue) {
            if (o.type === "onUpdate") {
              try {
                n.onUpdate(...o.args || []);
              } catch {
              }
              continue;
            }
            if (o.type === "disconnect") {
              try {
                n.disconnect(...o.args || []);
              } catch {
              }
              continue;
            }
            if (o.type === "connect") {
              o.resolve ? n.connect(...o.args || []).then(o.resolve).catch(o.reject) : n.connect(...o.args || []).catch(() => {
              });
              continue;
            }
          }
          e.__real = n, e.__queue = [], s.delete(e);
        } catch (n) {
          console.warn("joycon bridge: failed to bind proxy instance", n);
        }
    }
  }
  const a = l();
  if (a)
    try {
      window.JoyCon2 = a;
      try {
        window.Joycon2 = a;
      } catch {
      }
      console.log("joycon bridge: JoyCon2 constructor installed");
      return;
    } catch (t) {
      console.warn("joycon bridge: failed to set JoyCon2 directly", t);
    }
  const u = f();
  try {
    window.JoyCon2 = u;
  } catch {
  }
  try {
    window.Joycon2 = u;
  } catch {
  }
  console.log("joycon bridge: installed proxy constructor for JoyCon2 (will bind when real lib loads)");
  const _ = Date.now(), y = setInterval(() => {
    const t = l();
    if (t) {
      clearInterval(y);
      try {
        d(t), console.log("joycon bridge: real JoyCon2 constructor found and bound");
      } catch (e) {
        console.warn("joycon bridge: error while binding real constructor", e);
      }
      return;
    }
    Date.now() - _ > 1e4 && (clearInterval(y), console.warn("joycon bridge: timed out waiting for real JoyCon2 constructor"));
  }, 200);
})();
//# sourceMappingURL=bridge.mjs.map
