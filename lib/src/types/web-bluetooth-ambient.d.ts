// Minimal ambient types for navigator.bluetooth used by this library.
// This avoids requiring `@types/web-bluetooth` from npm which may not exist
// in all registries.

declare interface BluetoothDevice {
  gatt?: {
    connect(): Promise<any>;
    disconnect(): void;
    connected?: boolean;
    getPrimaryService(uuid: string): Promise<any>;
  };
}

declare interface BluetoothRemoteGATTCharacteristic {
  startNotifications(): Promise<void>;
  addEventListener(event: "characteristicvaluechanged", listener: (ev: any) => void): void;
}

declare interface Navigator {
  bluetooth?: {
    requestDevice(options?: any): Promise<BluetoothDevice>;
  };
}

export {};
