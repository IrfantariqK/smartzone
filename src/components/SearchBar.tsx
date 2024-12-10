'use client';

import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import { FaSearch } from 'react-icons/fa';

interface SearchBarProps {
  onLocationSelect: (location: { lat: number; lng: number; name: string }) => void;
}

export function SearchBar({ onLocationSelect }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto z-20">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
        <FaSearch className="w-5 h-5" />
      </div>
      <div className="search-container">
        <GeoapifyContext apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_KEY || ''}>
          <GeoapifyGeocoderAutocomplete
            placeholder="🔍 Search for your favorite place..."
            type="city"
            lang="en"
            limit={5}
            filterByCountryCode={['pk']}
            position={{
              lat: 24.8607,
              lon: 67.0011
            }}
            placeSelect={(value) => {
              console.log('Selected place:', value);
              if (value) {
                onLocationSelect({
                  lat: value.properties.lat,
                  lng: value.properties.lon,
                  name: value.properties.formatted
                });
              }
            }}
          />
        </GeoapifyContext>
      </div>
      <style jsx global>{`
        .search-container .geoapify-autocomplete-input {
          padding: 1rem 1rem 1rem 3rem;
          font-size: 1rem;
          border: none;
          border-radius: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          width: 100%;
          background-color: white;
          transition: all 0.3s ease;
        }

        .search-container .geoapify-autocomplete-input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
        }

        .search-container .geoapify-autocomplete-items {
          border: none;
          border-radius: 1rem;
          margin-top: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          background-color: white;
          z-index: 50; /* Ensure dropdown is above the map */
          position: relative; /* Ensure proper stacking context */
        }

        .search-container .geoapify-autocomplete-item {
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .search-container .geoapify-autocomplete-item:hover {
          background-color: #F3F4F6;
        }
      `}</style>
    </div>
  );
} 