import { BlePeripheral } from 'ble-lib-template-lib';


const ble = new BlePeripheral();
console.log('BLE Peripheral Sample:', ble);

const SERVICE_UUID = '10b20100-5b3b-4571-9508-cf3efcd7bbae';
const CHARACTERISTICS_UUID = '10b20101-5b3b-4571-9508-cf3efcd7bbae';

document.getElementById('ble-connect')?.addEventListener('click', async () => {
	try {
		const device = await navigator.bluetooth.requestDevice({
			filters: [{ services: [SERVICE_UUID] }]
		});
		const server = await device.gatt?.connect();
		console.log('Connected to GATT Server:', server);

    const service = await server.getPrimaryService(SERVICE_UUID);
		console.log('Got Primary Servcie', service);

    const characteristic = await service.getCharacteristic(CHARACTERISTICS_UUID);

    // Enable Notify
    await characteristic.startNotifications();

    // Register event listener for characteristic value changes
    characteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
      const char = event.target as any;
      // parse
      const dv = char.value;
      const infoType = dv.getUint8(0);                   // 0: UInt8
      const standardId = dv.getUint32(1, true);          // 1-4: UInt32 (little endian)
      const angle = dv.getUint16(5, true);               // 5-6: UInt16 (little endian)

      const parsed = {
        infoType,
        standardId,
        angle
      };

      (document.getElementById("infoType") as HTMLTableCellElement).textContent = parsed.infoType.toString();
      (document.getElementById("standardId") as HTMLTableCellElement).textContent = parsed.standardId.toString();
      (document.getElementById("angle") as HTMLTableCellElement).textContent = parsed.angle.toString();

      // console.log("Parsed Data:", parsed);
    });

    console.log('Notifications started');

	} catch (err) {
		console.error('BLE Connection error', err);
	}
});
