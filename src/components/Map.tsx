"use client";

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

interface MapProps {
  searchResult: Location | null;
}

export function Map({ searchResult }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const routingControl = useRef<L.Routing.Control | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  const userIcon = useMemo(() => new L.DivIcon({
    className: 'custom-icon',
    html: renderToString(<MdLocationOn className="text-red-500 text-4xl" />),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }), []);

  const destinationIcon = new L.DivIcon({
    className: 'custom-icon',
    html: renderToString(<MdLocationOn className="text-green-500 text-4xl" />),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  useEffect(() => {
    if (!mapContainer.current) return;

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
  }, []);

  useEffect(() => {
    if (!map.current || !userLocation || !searchResult) return;

    if (routingControl.current) {
      map.current.removeControl(routingControl.current);
    }

    routingControl.current = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(searchResult.lat, searchResult.lng)
      ],
      routeWhileDragging: true,
      showAlternatives: true,
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: "#6366F1", weight: 6 }]
      },
      createMarker: function(i: number, wp: L.Routing.Waypoint) {
        return L.marker(wp.latLng, {
          icon: i === 0 ? userIcon : destinationIcon
        });
      }
    }).addTo(map.current);

    routingControl.current.on('routesfound', (e: L.Routing.RoutesFoundEvent) => {
      const routes = e.routes;
      const summary = routes[0].summary;
      const time = Math.round(summary.totalTime / 60);
      const distance = Math.round(summary.totalDistance / 1000);

      const event = new CustomEvent('routeUpdate', {
        detail: {
          from: userLocation.name,
          to: searchResult.name,
          time,
          distance,
          instructions: routes[0].instructions
        }
      });
      window.dispatchEvent(event);
    });

    L.marker([searchResult.lat, searchResult.lng], { icon: destinationIcon })
      .bindPopup(`<h3>${searchResult.name}</h3>`)
      .addTo(map.current!);
  }, [userLocation, searchResult]);

  return (
    <div className="relative h-[700px]">
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg"
      />
    </div>
  );
}
