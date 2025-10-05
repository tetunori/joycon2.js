(() => {
  function l() {
    const n = [
      "Joycon2",
      // common
      "JoyCon2"
    ];
    for (const e of n) {
      const t = window[e];
      if (t) {
        if (typeof t == "function") return t;
        if (typeof t == "object") {
          const o = ["Joycon2", "JoyCon2"];
          for (const r of o)
            if (typeof t[r] == "function") return t[r];
          for (const r of Object.keys(t))
            try {
              if (typeof t[r] == "function") return t[r];
            } catch {
            }
        }
      }
    }
    return null;
  }
  const s = /* @__PURE__ */ new Set();
  function y() {
    function n(...e) {
      if (!(this instanceof n)) throw new Error("JoyCon2 must be called with new");
      this.__ctorArgs = e, this.__real = null, this.__queue = [];
      const t = (o, r, i, h) => {
        const c = { type: o, args: r };
        if (i && (c.resolve = i, c.reject = h), this.__queue.push(c), o === "connect" && i)
          return new Promise((p, w) => {
            c.resolve = p, c.reject = w;
          });
      };
      this.connect = (...o) => this.__real && typeof this.__real.connect == "function" ? this.__real.connect(...o) : t("connect", o, null, null), this.disconnect = (...o) => this.__real && typeof this.__real.disconnect == "function" ? this.__real.disconnect(...o) : t("disconnect", o), this.onUpdate = (o) => this.__real && typeof this.__real.onUpdate == "function" ? this.__real.onUpdate(o) : t("onUpdate", [o]), Object.defineProperty(this, "gJoyCon2Data", {
        get: () => this.__real ? this.__real.gJoyCon2Data : null,
        configurable: !0
      }), Object.defineProperty(this, "buttonUp", {
        get: () => this.__real ? !!(this.__real.gJoyCon2Data && this.__real.gJoyCon2Data.buttonUp) : !1,
        configurable: !0
      }), s.add(this);
    }
    try {
      Object.defineProperty(n, "name", { value: "JoyCon2" });
    } catch {
    }
    return n;
  }
  function _(n) {
    if (typeof n == "function") {
      try {
        window.JoyCon2 = n;
      } catch {
      }
      for (const e of Array.from(s))
        try {
          const t = new n(...e.__ctorArgs || []);
          for (const o of e.__queue) {
            if (o.type === "onUpdate") {
              try {
                t.onUpdate(...o.args || []);
              } catch {
              }
              continue;
            }
            if (o.type === "disconnect") {
              try {
                t.disconnect(...o.args || []);
              } catch {
              }
              continue;
            }
            if (o.type === "connect") {
              o.resolve ? t.connect(...o.args || []).then(o.resolve).catch(o.reject) : t.connect(...o.args || []).catch(() => {
              });
              continue;
            }
          }
          e.__real = t, e.__queue = [], s.delete(e);
        } catch (t) {
          console.warn("joycon bridge: failed to bind proxy instance", t);
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
    } catch (n) {
      console.warn("joycon bridge: failed to set JoyCon2 directly", n);
    }
  const u = y();
  try {
    window.JoyCon2 = u;
  } catch {
  }
  try {
    window.Joycon2 = u;
  } catch {
  }
  console.log("joycon bridge: installed proxy constructor for JoyCon2 (will bind when real lib loads)");
  const d = Date.now(), f = setInterval(() => {
    const n = l();
    if (n) {
      clearInterval(f);
      try {
        _(n), console.log("joycon bridge: real JoyCon2 constructor found and bound");
      } catch (e) {
        console.warn("joycon bridge: error while binding real constructor", e);
      }
      return;
    }
    Date.now() - d > 1e4 && (clearInterval(f), console.warn("joycon bridge: timed out waiting for real JoyCon2 constructor"));
  }, 200);
})();
//# sourceMappingURL=bridge.mjs.map
