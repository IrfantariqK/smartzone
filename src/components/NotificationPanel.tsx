"use client";


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
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4 sticky top-0 bg-white">Notifications</h2>
      
      {/* Add max height and overflow-y-auto for scrolling */}
      <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4">
        {notifications.map((notification, index) => {
          const routeData = notification.data as RouteUpdate;
          return (
            <div key={index} className="p-4 border rounded-lg bg-gray-50">
              <div className="mb-3">
                <p className="font-medium">From: {routeData.from}</p>
                <p className="font-medium">To: {routeData.to}</p>
              </div>
              
              <div className="mb-3 text-sm text-gray-600">
                <p>Total Time: {routeData.time} minutes</p>
                <p>Total Distance: {routeData.distance} km</p>
              </div>

              <div className="text-sm">
                <h3 className="font-medium mb-2">Turn-by-turn directions:</h3>
                <ul className="space-y-2">
                  {routeData.instructions.map((instruction, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span>{instruction.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                {notification.timestamp.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
