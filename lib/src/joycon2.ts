/// <reference lib="dom" />

// WebBluetooth BLE Peripheral + JoyCon2 wrapper
// The library exposes a Joycon2 class (default export) which handles BLE
// connect/disconnect and parses incoming JoyCon2 packets into a `gJoyCon2Data`
// object that matches the shape used by the sample app.

export interface SimpleParsedJoyCon2Data {
  packetId: number;
  buttons: number;
  leftStick: number;
  rightStick: number;
  mouseX: number;
  mouseY: number;
  mouseUnknown: number;
  mouseDistance: number;
  magX: number;
  magY: number;
  magZ: number;
  batteryVoltage: number;
  batteryCurrent: number;
  temperature: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  triggerL: number;
  triggerR: number;
}

export interface JoyCon2Data {
  packetId: number;
  buttonL: boolean;
  buttonR: boolean;
  buttonMinus: boolean;
  buttonPlus: boolean;
  buttonLStick: boolean;
  buttonRStick: boolean;
  buttonA: boolean;
  buttonB: boolean;
  buttonC: boolean;
  buttonX: boolean;
  buttonY: boolean;
  buttonUp: boolean;
  buttonDown: boolean;
  buttonLeft: boolean;
  buttonRight: boolean;
  buttonCapture: boolean;
  buttonHome: boolean;
  buttonZR: boolean;
  buttonZL: boolean;
  buttonSR_R: boolean;
  buttonSL_R: boolean;
  buttonSR_L: boolean;
  buttonSL_L: boolean;
  leftStickX: number;
  leftStickY: number;
  rightStickX: number;
  rightStickY: number;
  mouseX: number;
  mouseY: number;
  mouseUnknown: number;
  mouseDistance: number;
  magX: number;
  magY: number;
  magZ: number;
  batteryVoltage: number;
  batteryCurrent: number;
  temperature: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  triggerL: number;
  triggerR: number;
  simpleParsed: SimpleParsedJoyCon2Data;
  rawData: Uint8Array;
}

const DEFAULT_DATA: JoyCon2Data = {
  packetId: 0,
  buttonL: false,
  buttonR: false,
  buttonMinus: false,
  buttonPlus: false,
  buttonLStick: false,
  buttonRStick: false,
  buttonA: false,
  buttonB: false,
  buttonC: false,
  buttonX: false,
  buttonY: false,
  buttonUp: false,
  buttonDown: false,
  buttonLeft: false,
  buttonRight: false,
  buttonCapture: false,
  buttonHome: false,
  buttonZR: false,
  buttonZL: false,
  buttonSR_R: false,
  buttonSL_R: false,
  buttonSR_L: false,
  buttonSL_L: false,
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
    triggerR: 0,
  },
  rawData: new Uint8Array(),
};

// Service/Characteristic UUIDs used by the example
export const SERVICE_UUID = "ab7de9be-89fe-49ad-828f-118f09df7fd0";
export const CHARACTERISTICS_UUID = "ab7de9be-89fe-49ad-828f-118f09df7fd2";

function readUint24LE(dv: DataView, offset: number): number {
  const b0 = dv.getUint8(offset);
  const b1 = dv.getUint8(offset + 1);
  const b2 = dv.getUint8(offset + 2);
  return (b2 << 16) | (b1 << 8) | b0;
}

// Stick normalization helpers (same logic used in the example app)
const centerX = 2000, minX = 1000, maxX = 3000;
const centerY = 2000, minY = 1000, maxY = 3000;
function normalizeStick(value: number, center: number, min: number, max: number): number {
  if (value > center) {
    const norm = (value - center) / (max - center);
    return Math.min(norm, 1);
  } else {
    const norm = (value - center) / (center - min);
    return Math.max(norm, -1);
  }
}
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
function applyDeadzone(x: number, y: number, deadzone: number = 0.15): [number, number] {
  const magnitude = Math.sqrt(x * x + y * y);
  if (magnitude < deadzone) return [0, 0];
  const scale = (magnitude - deadzone) / (1 - deadzone);
  let normX = (x / magnitude) * scale;
  let normY = (y / magnitude) * scale;
  normX = clamp(round2(normX), -1, 1);
  normY = clamp(round2(normY), -1, 1);
  return [normX, normY];
}
function getStick(rawX: number, rawY: number): [number, number] {
  let x = normalizeStick(rawX, centerX, minX, maxX);
  let y = normalizeStick(rawY, centerY, minY, maxY);
  return applyDeadzone(x, y, 0.15);
}

export class JoyCon2Device extends EventTarget {
  public data: JoyCon2Data = { ...DEFAULT_DATA };
  // Use `any` for internal Bluetooth types so declaration build doesn't require
  // the consumer to have WebBluetooth lib types installed.
  private device: any | null = null;
  private server: any | null = null;
  private characteristic: any | null = null;

  constructor() {
    super();
  }

  async connect(): Promise<void> {
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          {
            manufacturerData: [
              {
                companyIdentifier: 1363, // 0x0553
                dataPrefix: new Uint8Array([0, 0, 0, 0, 0, 103, 32]),
                mask: new Uint8Array([0, 0, 0, 0, 0, 0, 255]),
              },
            ],
          },
        ],
        optionalServices: [SERVICE_UUID],
      });
      this.device = device;
      this.server = await device.gatt?.connect() ?? null;
      if (!this.server) throw new Error('GATT server not available');
      const service = await this.server.getPrimaryService(SERVICE_UUID);
      this.characteristic = await service.getCharacteristic(CHARACTERISTICS_UUID);
      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', (ev: Event) => {
        const char = (ev.target as any) as { value?: DataView };
        const dv = char.value! as DataView;
        this.handleData(dv);
      });
      this.dispatchEvent(new CustomEvent('connected'));
    } catch (err) {
      this.dispatchEvent(new CustomEvent('error', { detail: err }));
      throw err;
    }
  }

  disconnect(): void {
    if (this.device && this.device.gatt && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.dispatchEvent(new CustomEvent('disconnected'));
  }

  onUpdate(cb: (data: JoyCon2Data) => void) {
    this.addEventListener('update', () => cb(this.data));
  }

  private handleData(dv: DataView) {
    this.data.rawData = new Uint8Array(dv.buffer);
    this.data.simpleParsed = {
      packetId: dv.getUint32(0x00, true),
      buttons: dv.getUint32(0x04, true),
      leftStick: readUint24LE(dv, 0x0A),
      rightStick: readUint24LE(dv, 0x0D),
      mouseX: dv.getInt16(0x10, true),
      mouseY: dv.getInt16(0x12, true),
      mouseUnknown: dv.getInt16(0x14, true),
      mouseDistance: dv.getInt16(0x16, true),
      magX: dv.getInt16(0x18, true),
      magY: dv.getInt16(0x1A, true),
      magZ: dv.getInt16(0x1C, true),
      batteryVoltage: dv.getUint16(0x1F, true),
      batteryCurrent: dv.getInt16(0x28, true),
      temperature: dv.getInt16(0x2E, true),
      accelX: dv.getInt16(0x30, true),
      accelY: dv.getInt16(0x32, true),
      accelZ: dv.getInt16(0x34, true),
      gyroX: dv.getInt16(0x36, true),
      gyroY: dv.getInt16(0x38, true),
      gyroZ: dv.getInt16(0x3A, true),
      triggerL: dv.getUint8(0x3C),
      triggerR: dv.getUint8(0x3D),
    };

    // detailed parsed
    this.data.packetId = this.data.simpleParsed.packetId;
    this.data.buttonY = (this.data.simpleParsed.buttons & (1 << 0)) !== 0;
    this.data.buttonX = (this.data.simpleParsed.buttons & (1 << 1)) !== 0;
    this.data.buttonB = (this.data.simpleParsed.buttons & (1 << 2)) !== 0;
    this.data.buttonA = (this.data.simpleParsed.buttons & (1 << 3)) !== 0;
    this.data.buttonSR_R = (this.data.simpleParsed.buttons & (1 << 4)) !== 0;
    this.data.buttonSL_R = (this.data.simpleParsed.buttons & (1 << 5)) !== 0;
    this.data.buttonR = (this.data.simpleParsed.buttons & (1 << 6)) !== 0;
    this.data.buttonZR = (this.data.simpleParsed.buttons & (1 << 7)) !== 0;
    this.data.buttonMinus = (this.data.simpleParsed.buttons & (1 << 8)) !== 0;
    this.data.buttonPlus = (this.data.simpleParsed.buttons & (1 << 9)) !== 0;
    this.data.buttonRStick = (this.data.simpleParsed.buttons & (1 << 10)) !== 0;
    this.data.buttonLStick = (this.data.simpleParsed.buttons & (1 << 11)) !== 0;
    this.data.buttonHome = (this.data.simpleParsed.buttons & (1 << 12)) !== 0;
    this.data.buttonCapture = (this.data.simpleParsed.buttons & (1 << 13)) !== 0;
    this.data.buttonC = (this.data.simpleParsed.buttons & (1 << 14)) !== 0;
    this.data.buttonDown = (this.data.simpleParsed.buttons & (1 << 16)) !== 0;
    this.data.buttonUp = (this.data.simpleParsed.buttons & (1 << 17)) !== 0;
    this.data.buttonRight = (this.data.simpleParsed.buttons & (1 << 18)) !== 0;
    this.data.buttonLeft = (this.data.simpleParsed.buttons & (1 << 19)) !== 0;
    this.data.buttonSR_L = (this.data.simpleParsed.buttons & (1 << 20)) !== 0;
    this.data.buttonSL_L = (this.data.simpleParsed.buttons & (1 << 21)) !== 0;
    this.data.buttonL = (this.data.simpleParsed.buttons & (1 << 22)) !== 0;
    this.data.buttonZL = (this.data.simpleParsed.buttons & (1 << 23)) !== 0;
    this.data.leftStickY = (this.data.simpleParsed.leftStick >> 12) & 0xfff;
    this.data.leftStickX = this.data.simpleParsed.leftStick & 0xfff;
    this.data.rightStickY = (this.data.simpleParsed.rightStick >> 12) & 0xfff;
    this.data.rightStickX = this.data.simpleParsed.rightStick & 0xfff;
    this.data.mouseX = this.data.simpleParsed.mouseX;
    this.data.mouseY = this.data.simpleParsed.mouseY;
    this.data.mouseUnknown = this.data.simpleParsed.mouseUnknown;
    this.data.mouseDistance = this.data.simpleParsed.mouseDistance;
    this.data.magX = this.data.simpleParsed.magX;
    this.data.magY = this.data.simpleParsed.magY;
    this.data.magZ = this.data.simpleParsed.magZ;
    this.data.batteryVoltage = this.data.simpleParsed.batteryVoltage;
    this.data.batteryCurrent = this.data.simpleParsed.batteryCurrent / 100.0;
    this.data.temperature = 25.0 + this.data.simpleParsed.temperature / 127.0;
    this.data.accelX = this.data.simpleParsed.accelX / 4096.0;
    this.data.accelY = this.data.simpleParsed.accelY / 4096.0;
    this.data.accelZ = this.data.simpleParsed.accelZ / 4096.0;
    this.data.gyroX = (this.data.simpleParsed.gyroX / 48000.0) * 360.0;
    this.data.gyroY = (this.data.simpleParsed.gyroY / 48000.0) * 360.0;
    this.data.gyroZ = (this.data.simpleParsed.gyroZ / 48000.0) * 360.0;
    this.data.triggerL = this.data.simpleParsed.triggerL;
    this.data.triggerR = this.data.simpleParsed.triggerR;

    [this.data.rightStickX, this.data.rightStickY] = getStick(this.data.rightStickX, this.data.rightStickY);
    [this.data.leftStickX, this.data.leftStickY] = getStick(this.data.leftStickX, this.data.leftStickY);

    this.dispatchEvent(new CustomEvent('update', { detail: this.data }));
  }
}

// default export requested by the user: Joycon2 class which wraps JoyCon2Device
export class JoyCon2 extends EventTarget {
  private dev: JoyCon2Device;
  constructor() {
    super();
    this.dev = new JoyCon2Device();
    // re-dispatch device events
    this.dev.addEventListener('update', (e: Event) => this.dispatchEvent(new CustomEvent('update', { detail: (e as CustomEvent).detail })));
    this.dev.addEventListener('connected', (e) => this.dispatchEvent(new CustomEvent('connected')));
    this.dev.addEventListener('disconnected', (e) => this.dispatchEvent(new CustomEvent('disconnected')));
    this.dev.addEventListener('error', (e) => this.dispatchEvent(new CustomEvent('error', { detail: (e as CustomEvent).detail })));
  }

  async connect(): Promise<void> {
    return this.dev.connect();
  }

  disconnect(): void {
    return this.dev.disconnect();
  }

  get gJoyCon2Data(): JoyCon2Data {
    return this.dev.data;
  }

  // Convenience boolean getters for common buttons so consumers can read
  // `jc2.buttonUp` directly (useful for sketches / globals).
  get buttonUp(): boolean {
    return !!(this.dev && this.dev.data && this.dev.data.buttonUp);
  }

  get buttonDown(): boolean {
    return !!(this.dev && this.dev.data && this.dev.data.buttonDown);
  }

  get buttonLeft(): boolean {
    return !!(this.dev && this.dev.data && this.dev.data.buttonLeft);
  }

  get buttonRight(): boolean {
    return !!(this.dev && this.dev.data && this.dev.data.buttonRight);
  }

  onUpdate(cb: (data: JoyCon2Data) => void) {
    this.addEventListener('update', () => cb(this.gJoyCon2Data));
  }
}

// no default export: package exposes named exports only (Joycon2, JoyCon2Device, etc.)

// --- UMD向けブリッジ（グローバル登録） ---
try {
  (window as any).JoyCon2 = JoyCon2;
  (window as any).Joycon2 = JoyCon2;
  console.log('joycon2: JoyCon2 constructor installed on window');
} catch (e) {
  // Nodeなどwindowが無い環境ではスルー
}
