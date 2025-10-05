const m = {
  packetId: 0,
  buttonL: !1,
  buttonR: !1,
  buttonMinus: !1,
  buttonPlus: !1,
  buttonLStick: !1,
  buttonRStick: !1,
  buttonA: !1,
  buttonB: !1,
  buttonC: !1,
  buttonX: !1,
  buttonY: !1,
  buttonUp: !1,
  buttonDown: !1,
  buttonLeft: !1,
  buttonRight: !1,
  buttonCapture: !1,
  buttonHome: !1,
  buttonZR: !1,
  buttonZL: !1,
  buttonSR_R: !1,
  buttonSL_R: !1,
  buttonSR_L: !1,
  buttonSL_L: !1,
  leftStickX: 0,
  leftStickY: 0,
  rightStickX: 0,
  rightStickY: 0,
  mouseX: 0,
  mouseY: 0,
  mouseUnknown: 0,
  mouseDistance: 0,
  magX: 0,
  magY: 0,
  magZ: 0,
  batteryVoltage: 0,
  batteryCurrent: 0,
  temperature: 0,
  accelX: 0,
  accelY: 0,
  accelZ: 0,
  gyroX: 0,
  gyroY: 0,
  gyroZ: 0,
  triggerL: 0,
  triggerR: 0,
  simpleParsed: {
    packetId: 0,
    buttons: 0,
    leftStick: 0,
    rightStick: 0,
    mouseX: 0,
    mouseY: 0,
    mouseUnknown: 0,
    mouseDistance: 0,
    magX: 0,
    magY: 0,
    magZ: 0,
    batteryVoltage: 0,
    batteryCurrent: 0,
    temperature: 0,
    accelX: 0,
    accelY: 0,
    accelZ: 0,
    gyroX: 0,
    gyroY: 0,
    gyroZ: 0,
    triggerL: 0,
    triggerR: 0
  },
  rawData: new Uint8Array()
}, d = "ab7de9be-89fe-49ad-828f-118f09df7fd0", b = "ab7de9be-89fe-49ad-828f-118f09df7fd2";
function o(e, t) {
  const a = e.getUint8(t), s = e.getUint8(t + 1);
  return e.getUint8(t + 2) << 16 | s << 8 | a;
}
const p = 2e3, f = 1e3, P = 3e3, y = 2e3, v = 1e3, S = 3e3;
function h(e, t, a, s) {
  if (e > t) {
    const i = (e - t) / (s - t);
    return Math.min(i, 1);
  } else {
    const i = (e - t) / (t - a);
    return Math.max(i, -1);
  }
}
function c(e, t, a) {
  return Math.max(t, Math.min(a, e));
}
function u(e) {
  return Math.round(e * 100) / 100;
}
function k(e, t, a = 0.15) {
  const s = Math.sqrt(e * e + t * t);
  if (s < a) return [0, 0];
  const i = (s - a) / (1 - a);
  let n = e / s * i, r = t / s * i;
  return n = c(u(n), -1, 1), r = c(u(r), -1, 1), [n, r];
}
function l(e, t) {
  let a = h(e, p, f, P), s = h(t, y, v, S);
  return k(a, s, 0.15);
}
class w extends EventTarget {
  constructor() {
    super(), this.data = { ...m }, this.device = null, this.server = null, this.characteristic = null;
  }
  async connect() {
    try {
      const t = await navigator.bluetooth.requestDevice({
        filters: [
          {
            manufacturerData: [
              {
                companyIdentifier: 1363,
                // 0x0553
                dataPrefix: new Uint8Array([0, 0, 0, 0, 0, 103, 32]),
                mask: new Uint8Array([0, 0, 0, 0, 0, 0, 255])
              }
            ]
          }
        ],
        optionalServices: [d]
      });
      if (this.device = t, this.server = await t.gatt?.connect() ?? null, !this.server) throw new Error("GATT server not available");
      const a = await this.server.getPrimaryService(d);
      this.characteristic = await a.getCharacteristic(b), await this.characteristic.startNotifications(), this.characteristic.addEventListener("characteristicvaluechanged", (s) => {
        const n = s.target.value;
        this.handleData(n);
      }), this.dispatchEvent(new CustomEvent("connected"));
    } catch (t) {
      throw this.dispatchEvent(new CustomEvent("error", { detail: t })), t;
    }
  }
  disconnect() {
    this.device && this.device.gatt && this.device.gatt.connected && this.device.gatt.disconnect(), this.device = null, this.server = null, this.characteristic = null, this.dispatchEvent(new CustomEvent("disconnected"));
  }
  onUpdate(t) {
    this.addEventListener("update", () => t(this.data));
  }
  handleData(t) {
    this.data.rawData = new Uint8Array(t.buffer), this.data.simpleParsed = {
      packetId: t.getUint32(0, !0),
      buttons: t.getUint32(4, !0),
      leftStick: o(t, 10),
      rightStick: o(t, 13),
      mouseX: t.getInt16(16, !0),
      mouseY: t.getInt16(18, !0),
      mouseUnknown: t.getInt16(20, !0),
      mouseDistance: t.getInt16(22, !0),
      magX: t.getInt16(24, !0),
      magY: t.getInt16(26, !0),
      magZ: t.getInt16(28, !0),
      batteryVoltage: t.getUint16(31, !0),
      batteryCurrent: t.getInt16(40, !0),
      temperature: t.getInt16(46, !0),
      accelX: t.getInt16(48, !0),
      accelY: t.getInt16(50, !0),
      accelZ: t.getInt16(52, !0),
      gyroX: t.getInt16(54, !0),
      gyroY: t.getInt16(56, !0),
      gyroZ: t.getInt16(58, !0),
      triggerL: t.getUint8(60),
      triggerR: t.getUint8(61)
    }, this.data.packetId = this.data.simpleParsed.packetId, this.data.buttonY = (this.data.simpleParsed.buttons & 1) !== 0, this.data.buttonX = (this.data.simpleParsed.buttons & 2) !== 0, this.data.buttonB = (this.data.simpleParsed.buttons & 4) !== 0, this.data.buttonA = (this.data.simpleParsed.buttons & 8) !== 0, this.data.buttonSR_R = (this.data.simpleParsed.buttons & 16) !== 0, this.data.buttonSL_R = (this.data.simpleParsed.buttons & 32) !== 0, this.data.buttonR = (this.data.simpleParsed.buttons & 64) !== 0, this.data.buttonZR = (this.data.simpleParsed.buttons & 128) !== 0, this.data.buttonMinus = (this.data.simpleParsed.buttons & 256) !== 0, this.data.buttonPlus = (this.data.simpleParsed.buttons & 512) !== 0, this.data.buttonRStick = (this.data.simpleParsed.buttons & 1024) !== 0, this.data.buttonLStick = (this.data.simpleParsed.buttons & 2048) !== 0, this.data.buttonHome = (this.data.simpleParsed.buttons & 4096) !== 0, this.data.buttonCapture = (this.data.simpleParsed.buttons & 8192) !== 0, this.data.buttonC = (this.data.simpleParsed.buttons & 16384) !== 0, this.data.buttonDown = (this.data.simpleParsed.buttons & 65536) !== 0, this.data.buttonUp = (this.data.simpleParsed.buttons & 1 << 17) !== 0, this.data.buttonRight = (this.data.simpleParsed.buttons & 1 << 18) !== 0, this.data.buttonLeft = (this.data.simpleParsed.buttons & 1 << 19) !== 0, this.data.buttonSR_L = (this.data.simpleParsed.buttons & 1 << 20) !== 0, this.data.buttonSL_L = (this.data.simpleParsed.buttons & 1 << 21) !== 0, this.data.buttonL = (this.data.simpleParsed.buttons & 1 << 22) !== 0, this.data.buttonZL = (this.data.simpleParsed.buttons & 1 << 23) !== 0, this.data.leftStickY = this.data.simpleParsed.leftStick >> 12 & 4095, this.data.leftStickX = this.data.simpleParsed.leftStick & 4095, this.data.rightStickY = this.data.simpleParsed.rightStick >> 12 & 4095, this.data.rightStickX = this.data.simpleParsed.rightStick & 4095, this.data.mouseX = this.data.simpleParsed.mouseX, this.data.mouseY = this.data.simpleParsed.mouseY, this.data.mouseUnknown = this.data.simpleParsed.mouseUnknown, this.data.mouseDistance = this.data.simpleParsed.mouseDistance, this.data.magX = this.data.simpleParsed.magX, this.data.magY = this.data.simpleParsed.magY, this.data.magZ = this.data.simpleParsed.magZ, this.data.batteryVoltage = this.data.simpleParsed.batteryVoltage, this.data.batteryCurrent = this.data.simpleParsed.batteryCurrent / 100, this.data.temperature = 25 + this.data.simpleParsed.temperature / 127, this.data.accelX = this.data.simpleParsed.accelX / 4096, this.data.accelY = this.data.simpleParsed.accelY / 4096, this.data.accelZ = this.data.simpleParsed.accelZ / 4096, this.data.gyroX = this.data.simpleParsed.gyroX / 48e3 * 360, this.data.gyroY = this.data.simpleParsed.gyroY / 48e3 * 360, this.data.gyroZ = this.data.simpleParsed.gyroZ / 48e3 * 360, this.data.triggerL = this.data.simpleParsed.triggerL, this.data.triggerR = this.data.simpleParsed.triggerR, [this.data.rightStickX, this.data.rightStickY] = l(this.data.rightStickX, this.data.rightStickY), [this.data.leftStickX, this.data.leftStickY] = l(this.data.leftStickX, this.data.leftStickY), this.dispatchEvent(new CustomEvent("update", { detail: this.data }));
  }
}
class g extends EventTarget {
  constructor() {
    super(), this.dev = new w(), this.dev.addEventListener("update", (t) => this.dispatchEvent(new CustomEvent("update", { detail: t.detail }))), this.dev.addEventListener("connected", (t) => this.dispatchEvent(new CustomEvent("connected"))), this.dev.addEventListener("disconnected", (t) => this.dispatchEvent(new CustomEvent("disconnected"))), this.dev.addEventListener("error", (t) => this.dispatchEvent(new CustomEvent("error", { detail: t.detail })));
  }
  async connect() {
    return this.dev.connect();
  }
  disconnect() {
    return this.dev.disconnect();
  }
  get gJoyCon2Data() {
    return this.dev.data;
  }
  // Convenience boolean getters for common buttons so consumers can read
  // `jc2.buttonUp` directly (useful for sketches / globals).
  get buttonUp() {
    return !!(this.dev && this.dev.data && this.dev.data.buttonUp);
  }
  get buttonDown() {
    return !!(this.dev && this.dev.data && this.dev.data.buttonDown);
  }
  get buttonLeft() {
    return !!(this.dev && this.dev.data && this.dev.data.buttonLeft);
  }
  get buttonRight() {
    return !!(this.dev && this.dev.data && this.dev.data.buttonRight);
  }
  onUpdate(t) {
    this.addEventListener("update", () => t(this.gJoyCon2Data));
  }
}
try {
  window.JoyCon2 = g, window.Joycon2 = g, console.log("joycon2 bridge: JoyCon2 constructor installed");
} catch (e) {
  console.warn("joycon2 bridge: failed to install JoyCon2 on window", e);
}
export {
  b as CHARACTERISTICS_UUID,
  w as JoyCon2Device,
  g as Joycon2,
  d as SERVICE_UUID
};
//# sourceMappingURL=bridge.mjs.map
