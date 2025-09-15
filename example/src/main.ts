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

const SERVICE_UUID = "10b20100-5b3b-4571-9508-cf3efcd7bbae";
const CHARACTERISTICS_UUID = "10b20101-5b3b-4571-9508-cf3efcd7bbae";

document.getElementById("ble-connect")?.addEventListener("click", async () => {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [SERVICE_UUID] }],
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
      document.getElementById("raw-data")!.textContent = Array.from(gJoyCon2Data.rawData).map(b => b.toString(16).padStart(2, '0')).join(' ');
      
      // 2. Sipmle Parsed Data
      gJoyCon2Data.simpleParsed = {
        // packetId: dv.getUint32(0, true),
        // buttons: dv.getUint32(4, true),
        // leftStick: dv.getUint8(8),
        // rightStick: dv.getUint8(11),
        // mouseX: dv.getInt16(14, true),
        // mouseY: dv.getInt16(16, true),
        // mouseUnk: dv.getInt16(18, true),
        // mouseDistance: dv.getInt16(20, true),
        // magX: dv.getInt16(22, true),
        // magY: dv.getInt16(24, true),
        // magZ: dv.getInt16(26, true),
        // batteryVoltage: dv.getInt16(28, true),
        // batteryCurrent: dv.getInt16(30, true),
        // reserved: dv.getUint8(32),
        // temperature: dv.getInt16(46, true),
        // accelX: dv.getInt16(48, true),
        // accelY: dv.getInt16(50, true),
        // accelZ: dv.getInt16(52, true),
        // gyroX: dv.getInt16(54, true),
        // gyroY: dv.getInt16(56, true),
        // gyroZ: dv.getInt16(58, true),
        // triggerL: dv.getUint8(60),
        // triggerR: dv.getUint8(61),

        packetId: dv.getUint32(0, true),
        buttons: dv.getUint32(0, true),
        leftStick: dv.getUint8(0),
        rightStick: dv.getUint8(0),
        mouseX: dv.getInt16(0, true),
        mouseY: dv.getInt16(0, true),
        mouseUnknown: dv.getInt16(0, true),
        mouseDistance: dv.getInt16(0, true),
        magX: dv.getInt16(0, true),
        magY: dv.getInt16(0, true),
        magZ: dv.getInt16(0, true),
        batteryVoltage: dv.getInt16(0, true),
        batteryCurrent: dv.getInt16(0, true),
        reserved: dv.getUint8(0),
        temperature: dv.getInt16(0, true),
        accelX: dv.getInt16(0, true),
        accelY: dv.getInt16(0, true),
        accelZ: dv.getInt16(0, true),
        gyroX: dv.getInt16(0, true),
        gyroY: dv.getInt16(0, true),
        gyroZ: dv.getInt16(0, true),
        triggerL: dv.getUint8(0),
        triggerR: dv.getUint8(0),
      };
      (Object.keys(gJoyCon2Data.simpleParsed) as (keyof SimpleParsedJoyCon2Data)[]).forEach((key) => {
        const cell = document.getElementById('smpl-'+key) as HTMLTableCellElement | null;
        if (cell) cell.textContent = gJoyCon2Data.simpleParsed[key].toString();
      });

      // 3. Detailed Parsed Data
      gJoyCon2Data.packetId = gJoyCon2Data.simpleParsed.packetId,
      gJoyCon2Data.buttonL       = (gJoyCon2Data.simpleParsed.buttons & (1 << 0)) !== 0,
      gJoyCon2Data.buttonR       = (gJoyCon2Data.simpleParsed.buttons & (1 << 1)) !== 0,
      gJoyCon2Data.buttonMinus   = (gJoyCon2Data.simpleParsed.buttons & (1 << 2)) !== 0,
      gJoyCon2Data.buttonPlus    = (gJoyCon2Data.simpleParsed.buttons & (1 << 3)) !== 0,
      gJoyCon2Data.buttonLStick  = (gJoyCon2Data.simpleParsed.buttons & (1 << 4)) !== 0,
      gJoyCon2Data.buttonRStick  = (gJoyCon2Data.simpleParsed.buttons & (1 << 5)) !== 0,
      gJoyCon2Data.buttonA       = (gJoyCon2Data.simpleParsed.buttons & (1 << 6)) !== 0,
      gJoyCon2Data.buttonB       = (gJoyCon2Data.simpleParsed.buttons & (1 << 7)) !== 0,
      gJoyCon2Data.buttonC       = (gJoyCon2Data.simpleParsed.buttons & (1 << 8)) !== 0,
      gJoyCon2Data.buttonX       = (gJoyCon2Data.simpleParsed.buttons & (1 << 9)) !== 0,
      gJoyCon2Data.buttonY       = (gJoyCon2Data.simpleParsed.buttons & (1 << 10)) !== 0,
      gJoyCon2Data.buttonUp      = (gJoyCon2Data.simpleParsed.buttons & (1 << 11)) !== 0,
      gJoyCon2Data.buttonDown    = (gJoyCon2Data.simpleParsed.buttons & (1 << 12)) !== 0,
      gJoyCon2Data.buttonLeft    = (gJoyCon2Data.simpleParsed.buttons & (1 << 13)) !== 0,
      gJoyCon2Data.buttonRight   = (gJoyCon2Data.simpleParsed.buttons & (1 << 14)) !== 0,
      gJoyCon2Data.buttonCapture = (gJoyCon2Data.simpleParsed.buttons & (1 << 15)) !== 0,
      gJoyCon2Data.buttonHome    = (gJoyCon2Data.simpleParsed.buttons & (1 << 16)) !== 0,
      gJoyCon2Data.leftStick = gJoyCon2Data.simpleParsed.leftStick,
      gJoyCon2Data.rightStick = gJoyCon2Data.simpleParsed.rightStick,
      gJoyCon2Data.mouseX = gJoyCon2Data.simpleParsed.mouseX,
      gJoyCon2Data.mouseY = gJoyCon2Data.simpleParsed.mouseY,
      gJoyCon2Data.mouseUnknown = gJoyCon2Data.simpleParsed.mouseUnknown,
      gJoyCon2Data.mouseDistance = gJoyCon2Data.simpleParsed.mouseDistance,
      gJoyCon2Data.magX = gJoyCon2Data.simpleParsed.magX,
      gJoyCon2Data.magY = gJoyCon2Data.simpleParsed.magY,
      gJoyCon2Data.magZ = gJoyCon2Data.simpleParsed.magZ,
      gJoyCon2Data.batteryVoltage = gJoyCon2Data.simpleParsed.batteryVoltage,
      gJoyCon2Data.batteryCurrent = gJoyCon2Data.simpleParsed.batteryCurrent,
      gJoyCon2Data.reserved = gJoyCon2Data.simpleParsed.reserved,
      gJoyCon2Data.temperature = gJoyCon2Data.simpleParsed.temperature,
      gJoyCon2Data.accelX = gJoyCon2Data.simpleParsed.accelX,
      gJoyCon2Data.accelY = gJoyCon2Data.simpleParsed.accelY,
      gJoyCon2Data.accelZ = gJoyCon2Data.simpleParsed.accelZ,
      gJoyCon2Data.gyroX = gJoyCon2Data.simpleParsed.gyroX,
      gJoyCon2Data.gyroY = gJoyCon2Data.simpleParsed.gyroY,
      gJoyCon2Data.gyroZ = gJoyCon2Data.simpleParsed.gyroZ,
      gJoyCon2Data.triggerL = gJoyCon2Data.simpleParsed.triggerL,
      gJoyCon2Data.triggerR = gJoyCon2Data.simpleParsed.triggerR;
      // console.log("SimpleParsedJoyCon2Data Data:", gJoyCon2Data.simpleParsed);

          (Object.keys(gJoyCon2Data) as (keyof JoyCon2Data)[]).forEach((key) => {
        const cell = document.getElementById(key) as HTMLTableCellElement | null;
        if (cell) cell.textContent = gJoyCon2Data[key].toString();
      });


    });
  } catch (err) {
    console.error("BLE Connection error", err);
  }
});
