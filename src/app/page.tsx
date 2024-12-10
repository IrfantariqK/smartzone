'use client';

import { Map } from '@/components/Map';
import {
  NotificationPanel,
  CustomNotification,
  RouteUpdate,
} from "@/components/NotificationPanel";
import { SearchBar } from '@/components/SearchBar';
import { useState, useEffect } from 'react';
import type { Location } from '@/components/Map';

export default function Home() {
  const [notifications, setNotifications] = useState<CustomNotification[]>([]);
  const [searchResult, setSearchResult] = useState<Location | null>(null);

  useEffect(() => {
    const handleRouteUpdate = (event: CustomEvent<RouteUpdate>) => {
      setNotifications(prev => [...prev, {
        type: 'Route Update',
        data: event.detail,
        timestamp: new Date()
      }]);
    };

    window.addEventListener('routeUpdate', handleRouteUpdate as EventListener);
    return () => {
      window.removeEventListener('routeUpdate', handleRouteUpdate as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">SmartZone Map</h1>
          <div className="max-w-2xl mx-auto">
            <SearchBar onLocationSelect={setSearchResult} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl shadow-lg overflow-hidden">
            <Map searchResult={searchResult} />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h2>
            <NotificationPanel notifications={notifications} />
          </div>
        </div>
      </div>
    </div>
  );
}
