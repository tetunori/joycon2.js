import { BlePeripheral } from "ble-lib-template-lib";

interface Parsed {
  packetId: number;
  buttons: number;
  leftStick: number;
  rightStick: number;
  mouseX: number;
  mouseY: number;
  mouseUnk: number;
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
      
      // DataView からすべてのフィールドを読み込む
      const parsed: Parsed = {
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
        mouseUnk: dv.getInt16(0, true),
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

      // テーブルに値を反映
      (Object.keys(parsed) as (keyof Parsed)[]).forEach((key) => {
        const cell = document.getElementById(key) as HTMLTableCellElement | null;
        if (cell) cell.textContent = parsed[key].toString();
      });

      // デバッグ用
      // console.log("Parsed Data:", parsed);
    });
  } catch (err) {
    console.error("BLE Connection error", err);
  }
});
