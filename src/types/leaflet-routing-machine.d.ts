import * as L from 'leaflet';

declare module 'leaflet' {
  namespace Routing {
    interface Waypoint {
      latLng: L.LatLng;
    }

    interface LineOptions extends L.PolylineOptions {
      styles?: Array<L.PolylineOptions>;
    }

    interface ControlOptions {
      waypoints: L.LatLng[];
      routeWhileDragging?: boolean;
      showAlternatives?: boolean;
      addWaypoints?: boolean;
      lineOptions?: LineOptions;
      createMarker?: (i: number, waypoint: Waypoint, n: number) => L.Marker;
    }

    interface RouteInstruction {
      type: string;
      distance: number;
      time: number;
      road?: string;
      direction?: string;
      text: string;
    }

    interface RoutesFoundEvent {
      routes: Array<{
        summary: {
          totalTime: number;
          totalDistance: number;
        };
        instructions: RouteInstruction[];
      }>;
    }

    class Control extends L.Control {
      constructor(options: ControlOptions);
      getWaypoints(): Waypoint[];
      setWaypoints(waypoints: L.LatLng[]): Control;
      on(event: string, fn: (event: RoutesFoundEvent) => void): Control;
    }

    function control(options: ControlOptions): Control;
  }
} 