"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { Location } from '@/components/Map';
import type { CustomNotification,  } from '@/components/NotificationPanel';
import { SearchBar } from '@/components/SearchBar';

// Dynamically import Map with no SSR
const Map = dynamic(
  () => import('@/components/Map').then((mod) => mod.Map),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[700px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-gray-500">Loading map...</span>
      </div>
    )
  }
);

// Dynamically import NotificationPanel with no SSR
const NotificationPanel = dynamic(
  () => import('@/components/NotificationPanel').then((mod) => mod.NotificationPanel),
  { ssr: false }
);

export default function Home() {
  const [notifications, ] = useState<CustomNotification[]>([]);
  const [searchResult, setSearchResult] = useState<Location | null>(null);

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
