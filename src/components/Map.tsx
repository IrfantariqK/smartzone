"use client";

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { MdLocationOn } from "react-icons/md";
import { renderToString } from "react-dom/server";

export interface Location {
  lat: number;
  lng: number;
  name: string;
}

// Wrap the map component with dynamic import
const MapWithNoSSR = dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
  loading: () => <div className="h-[700px] bg-gray-100 rounded-lg animate-pulse" />
});

export function Map({ searchResult }: { searchResult: Location | null }) {
  return <MapWithNoSSR searchResult={searchResult} />;
}

function MapComponent({ searchResult }: { searchResult: Location | null }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const routingControl = useRef<L.Routing.Control | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  const userIcon = useMemo(
    () =>
      new L.DivIcon({
        className: "custom-icon",
        html: renderToString(
          <MdLocationOn className="text-red-500 text-4xl" />
        ),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      }),
    []
  );

  const destinationIcon = useMemo(
    () =>
      new L.DivIcon({
        className: "custom-icon",
        html: renderToString(
          <MdLocationOn className="text-green-500 text-4xl" />
        ),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      }),
    []
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainer.current) return;

    map.current = L.map(mapContainer.current).setView([24.9056, 67.0822], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map.current);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setUserLocation({ lat, lng, name: "Your Location" });

        L.marker([lat, lng], { icon: userIcon })
          .bindPopup("<h3>Your Location</h3>")
          .addTo(map.current!);
      });
    }

    return () => {
      map.current?.remove();
    };
  }, [userIcon]);

  useEffect(() => {
    if (typeof window === 'undefined' || !map.current || !userLocation || !searchResult) return;

    if (routingControl.current) {
      map.current.removeControl(routingControl.current);
    }

    routingControl.current = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(searchResult.lat, searchResult.lng),
      ],
      routeWhileDragging: true,
      showAlternatives: true,
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: "#6366F1", weight: 6 }],
      },
      createMarker: function (i: number, wp: L.Routing.Waypoint) {
        return L.marker(wp.latLng, {
          icon: i === 0 ? userIcon : destinationIcon,
        });
      },
    }).addTo(map.current);

    routingControl.current.on(
      "routesfound",
      (e: L.Routing.RoutesFoundEvent) => {
        const routes = e.routes;
        const summary = routes[0].summary;
        const time = Math.round(summary.totalTime / 60);
        const distance = Math.round(summary.totalDistance / 1000);

        const event = new CustomEvent("routeUpdate", {
          detail: {
            from: userLocation.name,
            to: searchResult.name,
            time,
            distance,
            instructions: routes[0].instructions,
          },
        });
        window.dispatchEvent(event);
      }
    );
  }, [userLocation, searchResult, userIcon, destinationIcon]);

  return (
    <div className="relative h-[700px]">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
    </div>
  );
}
