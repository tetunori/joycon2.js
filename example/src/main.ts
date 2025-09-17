import { BlePeripheral } from "ble-lib-template-lib";

interface JoyCon2Data {
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
  buttonZR: boolean,
  buttonZL: boolean,
  buttonSR_R: boolean,
  buttonSL_R: boolean,
  buttonSR_L: boolean,
  buttonSL_L: boolean,
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
  reserved: number;
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

const gJoyCon2Data: JoyCon2Data = {
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
  reserved: 0,
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
    reserved: 0,
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

interface SimpleParsedJoyCon2Data {
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
  reserved: number;
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

const ble = new BlePeripheral();
console.log("BLE Peripheral Sample:", ble);

// const SERVICE_UUID = "10b20100-5b3b-4571-9508-cf3efcd7bbae";
// const CHARACTERISTICS_UUID = "10b20101-5b3b-4571-9508-cf3efcd7bbae";
const SERVICE_UUID = "ab7de9be-89fe-49ad-828f-118f09df7fd0";
const CHARACTERISTICS_UUID = "ab7de9be-89fe-49ad-828f-118f09df7fd2";

document.getElementById("ble-connect")?.addEventListener("click", async () => {
  try {
    // const device = await navigator.bluetooth.requestDevice({
    //   filters: [{ services: [SERVICE_UUID] }],
    // });
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        {
          manufacturerData: [
            {
              companyIdentifier: 1363, // 0x0553
              dataPrefix: new Uint8Array([0, 0, 0, 0, 0, 103, 32]),
              mask: new Uint8Array([0, 0, 0, 0, 0, 0/*255*/, 255]),
            },
          ],
        },
      ],
      optionalServices: [SERVICE_UUID],
    });
    const server = await device.gatt?.connect();
    console.log("Connected to GATT Server:", server);

    const service = await server.getPrimaryService(SERVICE_UUID);
    console.log("Got Primary Service", service);

    const characteristic = await service.getCharacteristic(CHARACTERISTICS_UUID);

    await characteristic.startNotifications();
    console.log("Notifications started");

    characteristic.addEventListener("characteristicvaluechanged", (event) => {
      const char = event.target as BluetoothRemoteGATTCharacteristic;
      const dv = char.value!;

      // 1. Raw Data
      // console.log("Raw Data:", new Uint8Array(dv.buffer));
      gJoyCon2Data.rawData = new Uint8Array(dv.buffer);
      document.getElementById("raw-data")!.textContent = Array.from(gJoyCon2Data.rawData)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ");

      // 2. Sipmle Parsed Data
      gJoyCon2Data.simpleParsed = {
        packetId: dv.getUint32(0x00, true),
        buttons: dv.getUint32(0x04, true),
        leftStick: readUint24LE(dv, 0x0A),
        rightStick: readUint24LE(dv,0x0D),
        mouseX: dv.getInt16(0x10, true),
        mouseY: dv.getInt16(0x12, true),
        mouseUnknown: dv.getInt16(0x14, true),
        mouseDistance: dv.getInt16(0x16, true),
        magX: dv.getInt16(0x18, true),
        magY: dv.getInt16(0x1A, true),
        magZ: dv.getInt16(0x1C, true),
        batteryVoltage: dv.getUint16(0x1F, true),
        batteryCurrent: dv.getInt16(0x28, true),
        reserved: dv.getUint8(32),
        temperature: dv.getInt16(0x2E, true),
        accelX: dv.getInt16(0x30, true),
        accelY: dv.getInt16(0x32, true),
        accelZ: dv.getInt16(0x34, true),
        gyroX: dv.getInt16(0x36, true),
        gyroY: dv.getInt16(0x38, true),
        gyroZ: dv.getInt16(0x3A, true),
        triggerL: dv.getUint8(0x3C),
        triggerR: dv.getUint8(0x3D),

        // packetId: dv.getUint32(0, true),
        // buttons: dv.getUint32(0, true),
        // leftStick: dv.getUint8(0),
        // rightStick: dv.getUint8(0),
        // mouseX: dv.getInt16(0, true),
        // mouseY: dv.getInt16(0, true),
        // mouseUnknown: dv.getInt16(0, true),
        // mouseDistance: dv.getInt16(0, true),
        // magX: dv.getInt16(0, true),
        // magY: dv.getInt16(0, true),
        // magZ: dv.getInt16(0, true),
        // batteryVoltage: dv.getInt16(0, true),
        // batteryCurrent: dv.getInt16(0, true),
        // reserved: dv.getUint8(0),
        // temperature: dv.getInt16(0, true),
        // accelX: dv.getInt16(0, true),
        // accelY: dv.getInt16(0, true),
        // accelZ: dv.getInt16(0, true),
        // gyroX: dv.getInt16(0, true),
        // gyroY: dv.getInt16(0, true),
        // gyroZ: dv.getInt16(0, true),
        // triggerL: dv.getUint8(0),
        // triggerR: dv.getUint8(0),
      };
      (Object.keys(gJoyCon2Data.simpleParsed) as (keyof SimpleParsedJoyCon2Data)[]).forEach(
        (key) => {
          const cell = document.getElementById("smpl-" + key) as HTMLTableCellElement | null;
          if (cell) cell.textContent = gJoyCon2Data.simpleParsed[key].toString();
        },
      );

      // 3. Detailed Parsed Data
      ((gJoyCon2Data.packetId = gJoyCon2Data.simpleParsed.packetId),
        (gJoyCon2Data.buttonY = (gJoyCon2Data.simpleParsed.buttons & (1 << 0)) !== 0),
        (gJoyCon2Data.buttonX = (gJoyCon2Data.simpleParsed.buttons & (1 << 1)) !== 0),
        (gJoyCon2Data.buttonB = (gJoyCon2Data.simpleParsed.buttons & (1 << 2)) !== 0),
        (gJoyCon2Data.buttonA = (gJoyCon2Data.simpleParsed.buttons & (1 << 3)) !== 0),
        (gJoyCon2Data.buttonSR_R = (gJoyCon2Data.simpleParsed.buttons & (1 << 4)) !== 0),
        (gJoyCon2Data.buttonSL_R = (gJoyCon2Data.simpleParsed.buttons & (1 << 5)) !== 0),
        (gJoyCon2Data.buttonR = (gJoyCon2Data.simpleParsed.buttons & (1 << 6)) !== 0),
        (gJoyCon2Data.buttonZR = (gJoyCon2Data.simpleParsed.buttons & (1 << 7)) !== 0),
        (gJoyCon2Data.buttonMinus = (gJoyCon2Data.simpleParsed.buttons & (1 << 8)) !== 0),
        (gJoyCon2Data.buttonPlus = (gJoyCon2Data.simpleParsed.buttons & (1 << 9)) !== 0),
        (gJoyCon2Data.buttonRStick = (gJoyCon2Data.simpleParsed.buttons & (1 << 10)) !== 0),
        (gJoyCon2Data.buttonLStick = (gJoyCon2Data.simpleParsed.buttons & (1 << 11)) !== 0),
        (gJoyCon2Data.buttonHome = (gJoyCon2Data.simpleParsed.buttons & (1 << 12)) !== 0),
        (gJoyCon2Data.buttonCapture = (gJoyCon2Data.simpleParsed.buttons & (1 << 13)) !== 0),
        (gJoyCon2Data.buttonC = (gJoyCon2Data.simpleParsed.buttons & (1 << 14)) !== 0),
        // reserved (1 << 15)
        (gJoyCon2Data.buttonDown = (gJoyCon2Data.simpleParsed.buttons & (1 << 16)) !== 0),
        (gJoyCon2Data.buttonUp = (gJoyCon2Data.simpleParsed.buttons & (1 << 17)) !== 0),
        (gJoyCon2Data.buttonRight = (gJoyCon2Data.simpleParsed.buttons & (1 << 18)) !== 0),
        (gJoyCon2Data.buttonLeft = (gJoyCon2Data.simpleParsed.buttons & (1 << 19)) !== 0),
        (gJoyCon2Data.buttonSR_L = (gJoyCon2Data.simpleParsed.buttons & (1 << 20)) !== 0),
        (gJoyCon2Data.buttonSL_L = (gJoyCon2Data.simpleParsed.buttons & (1 << 21)) !== 0),
        (gJoyCon2Data.buttonL = (gJoyCon2Data.simpleParsed.buttons & (1 << 22)) !== 0),
        (gJoyCon2Data.buttonZL = (gJoyCon2Data.simpleParsed.buttons & (1 << 23)) !== 0),
        (gJoyCon2Data.leftStickY = (gJoyCon2Data.simpleParsed.leftStick >> 12) & 0xfff),
        (gJoyCon2Data.leftStickX = gJoyCon2Data.simpleParsed.leftStick & 0xfff),
        (gJoyCon2Data.rightStickY = (gJoyCon2Data.simpleParsed.rightStick >> 12) & 0xfff),
        (gJoyCon2Data.rightStickX = gJoyCon2Data.simpleParsed.rightStick & 0xfff),
        (gJoyCon2Data.mouseX = gJoyCon2Data.simpleParsed.mouseX),
        (gJoyCon2Data.mouseY = gJoyCon2Data.simpleParsed.mouseY),
        (gJoyCon2Data.mouseUnknown = gJoyCon2Data.simpleParsed.mouseUnknown),
        (gJoyCon2Data.mouseDistance = gJoyCon2Data.simpleParsed.mouseDistance),
        (gJoyCon2Data.magX = gJoyCon2Data.simpleParsed.magX),
        (gJoyCon2Data.magY = gJoyCon2Data.simpleParsed.magY),
        (gJoyCon2Data.magZ = gJoyCon2Data.simpleParsed.magZ),
        (gJoyCon2Data.batteryVoltage = gJoyCon2Data.simpleParsed.batteryVoltage),
        (gJoyCon2Data.batteryCurrent = gJoyCon2Data.simpleParsed.batteryCurrent / 100.0),
        (gJoyCon2Data.reserved = gJoyCon2Data.simpleParsed.reserved),
        (gJoyCon2Data.temperature = 25.0 + gJoyCon2Data.simpleParsed.temperature / 127.0),
        (gJoyCon2Data.accelX = gJoyCon2Data.simpleParsed.accelX / 4096.0),
        (gJoyCon2Data.accelY = gJoyCon2Data.simpleParsed.accelY / 4096.0),
        (gJoyCon2Data.accelZ = gJoyCon2Data.simpleParsed.accelZ / 4096.0),
        (gJoyCon2Data.gyroX = (gJoyCon2Data.simpleParsed.gyroX / 48000.0) * 360.0),
        (gJoyCon2Data.gyroY = (gJoyCon2Data.simpleParsed.gyroY / 48000.0) * 360.0),
        (gJoyCon2Data.gyroZ = (gJoyCon2Data.simpleParsed.gyroZ / 48000.0) * 360.0),
        (gJoyCon2Data.triggerL = gJoyCon2Data.simpleParsed.triggerL),
        (gJoyCon2Data.triggerR = gJoyCon2Data.simpleParsed.triggerR));
      // console.log("SimpleParsedJoyCon2Data Data:", gJoyCon2Data.simpleParsed);

      (Object.keys(gJoyCon2Data) as (keyof JoyCon2Data)[]).forEach((key) => {
        const cell = document.getElementById(key) as HTMLTableCellElement | null;
        if (cell) cell.textContent = gJoyCon2Data[key].toString();
        if (gJoyCon2Data[key] === true) updateButtonCell(key, true);
        if (gJoyCon2Data[key] === false) updateButtonCell(key, false);
      });
    });
  } catch (err) {
    console.error("BLE Connection error", err);
  }
});

function updateButtonCell(id: string, value: boolean) {
  const el = document.getElementById(id);
  if (!el) return;

  el.textContent = value ? "ON" : "OFF";

  if (value) {
    el.classList.add("bg-primary", "text-white"); // trueの時に色付け
  } else {
    el.classList.remove("bg-primary", "text-white"); // falseなら元に戻す
  }
}


function readUint24LE(dv: DataView, offset: number): number {
  const b0 = dv.getUint8(offset);       // 下位バイト
  const b1 = dv.getUint8(offset + 1);
  const b2 = dv.getUint8(offset + 2);   // 上位バイト
  return (b2 << 16) | (b1 << 8) | b0;   // 24bit 整数
}

