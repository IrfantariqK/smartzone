"use client";

import { useEffect, useState } from "react";

interface RouteInstruction {
  text: string;
  distance: number;
  time: number;
  type: string;
}


export interface CustomNotification {
  type: string;
  data: RouteUpdate;
  timestamp: Date;
}

export interface RouteUpdate {
  from: string;
  to: string;
  time: number;
  distance: number;
  instructions: RouteInstruction[];
}

interface NotificationPanelProps {
  notifications: Notification[];
}
export interface Notification {
  type: string;
  data: unknown;
  timestamp: Date;
}


export function NotificationPanel({ notifications }: NotificationPanelProps) {
  const [routeInfo, setRouteInfo] = useState<RouteUpdate | null>(null);

  useEffect(() => {
    const handleRouteUpdate = (event: CustomEvent<RouteUpdate>) => {
      setRouteInfo(event.detail);
    };

    window.addEventListener("routeUpdate", handleRouteUpdate as EventListener);
    return () => {
      window.removeEventListener(
        "routeUpdate",
        handleRouteUpdate as EventListener
      );
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      {routeInfo && (
        <div>
          <p>From: {routeInfo.from}</p>
          <p>To: {routeInfo.to}</p>
          <p>Total Time: {routeInfo.time} minutes</p>
          <p>Total Distance: {routeInfo.distance} km</p>
          <h3 className="font-semibold mb-2">Turn-by-turn directions:</h3>
          <ul className="space-y-2">
            {routeInfo.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start gap-2">
                <span>{instruction.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {notifications.map((notification, index) => (
        <div key={index} className="mt-4 p-2 border-t">
          <p>{notification.type}</p>
          <p>{notification.timestamp.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
