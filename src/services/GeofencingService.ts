interface StoreLocation {
  location: {
    coordinates: [number, number];
  };
  geofence: {
    radius: number;
  };
}

interface StoreDocument {
  location: {
    coordinates: [number, number];
  };
  geofence: {
    radius: number;
  };
}

export class GeofencingService {
  private watchId: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initGeofencing();
    }
  }

  private initGeofencing() {
    if ('geolocation' in navigator) {
      this.watchId = navigator.geolocation.watchPosition(
        this.handlePositionUpdate.bind(this),
        this.handleError.bind(this),
        {
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 27000
        }
      );
    }
  }

  private async handlePositionUpdate(position: GeolocationPosition) {
    const { latitude, longitude } = position.coords;
    
    try {
      const nearbyStores = await this.findNearbyStores(latitude, longitude);
      nearbyStores.forEach((storeDoc: StoreDocument) => {
        const store: StoreLocation = {
          location: {
            coordinates: storeDoc.location.coordinates
          },
          geofence: {
            radius: storeDoc.geofence.radius
          }
        };

        if (this.isWithinGeofence(store, latitude, longitude)) {
          this.triggerGeofenceEvent('enter', store);
        }
      });
    } catch (error) {
      console.error('Error checking nearby stores:', error);
    }
  }

  private async findNearbyStores(latitude: number, longitude: number) {
    try {
      const response = await fetch(`/api/stores/nearby?lat=${latitude}&lng=${longitude}`);
      if (!response.ok) throw new Error('Failed to fetch nearby stores');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch nearby stores:', error);
      return [];
    }
  }

  private isWithinGeofence(store: StoreLocation, latitude: number, longitude: number): boolean {
    // Haversine formula implementation
    const R = 6371e3; // Earth's radius in meters
    const φ1 = latitude * Math.PI/180;
    const φ2 = store.location.coordinates[1] * Math.PI/180;
    const Δφ = (store.location.coordinates[1] - latitude) * Math.PI/180;
    const Δλ = (store.location.coordinates[0] - longitude) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance <= store.geofence.radius;
  }

  private triggerGeofenceEvent(type: 'enter' | 'exit', store: StoreLocation) {
    const event = new CustomEvent('geofenceUpdate', {
      detail: { type, store }
    });
    window.dispatchEvent(event);
  }

  private handleError(error: GeolocationPositionError) {
    console.error('Geolocation error:', error);
  }

  public cleanup() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }
} 