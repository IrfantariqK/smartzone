interface BeaconData {
  uuid: string;
  major: number;
  minor: number;
  txPower: number;
  rssi?: number;
  timestamp?: number;
}

export class BeaconService {
  private beacons: Map<string, BeaconData> = new Map();
  
  constructor() {
    // Remove auto-initialization
  }

  // Make this public and async
  public async startScanning() {
    if (!('bluetooth' in navigator)) {
      throw new Error('Bluetooth is not supported in this browser');
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['feaa'] }  // Eddystone service UUID
        ],
        optionalServices: ['battery_service']
      });
      
      const server = await device.gatt?.connect();
      if (server) {
        const service = await server.getPrimaryService('feaa');
        await this.handleBeaconService(service);
      }
    } catch (error) {
      console.error('Bluetooth scanning failed:', error);
      throw error;
    }
  }

  private async handleBeaconService(service: BluetoothRemoteGATTService) {
    const characteristic = await service.getCharacteristic('feaa');
    await characteristic.startNotifications();
    
    characteristic.addEventListener('characteristicvaluechanged', (event) => {
      const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
      if (value) {
        const beaconData = this.parseBeaconData(value);
        this.beacons.set(beaconData.uuid, {
          ...beaconData,
          rssi: undefined, // RSSI not available in this method
          timestamp: Date.now()
        });
        
        this.triggerProximityEvent(beaconData);
      }
    });
  }

  private parseBeaconData(data: DataView): BeaconData {
    return {
      uuid: 'parsed-uuid',
      major: 0,
      minor: 0,
      txPower: data.getInt8(1)
    };
  }

  private triggerProximityEvent(beaconData: BeaconData) {
    const event = new CustomEvent('beaconProximity', {
      detail: beaconData
    });
    window.dispatchEvent(event);
  }
} 