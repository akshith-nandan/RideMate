import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RideCard from '../components/RideCard';
import LeafletMap from '../components/LeafletMap';
import { Search, MapPin, Navigation, Compass, AlertCircle, HelpCircle } from 'lucide-react';
// Client-side local geocoder helper for real-time map preview
const COORDINATES = {
  hyderabad: { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
  secunderabad: { name: "Secunderabad", lat: 17.4399, lng: 78.4983 },
  warangal: { name: "Warangal", lat: 17.9689, lng: 79.5941 },
  hanamkonda: { name: "Hanamkonda", lat: 18.0058, lng: 79.5570 },
  karimnagar: { name: "Karimnagar", lat: 18.4386, lng: 79.1288 },
  nizamabad: { name: "Nizamabad", lat: 18.6725, lng: 78.0941 },
  adilabad: { name: "Adilabad", lat: 19.6667, lng: 78.5333 },
  khammam: { name: "Khammam", lat: 17.2473, lng: 80.1514 },
  nalgonda: { name: "Nalgonda", lat: 17.0540, lng: 79.2671 },
  suryapet: { name: "Suryapet", lat: 17.1405, lng: 79.6200 },
  mahabubnagar: { name: "Mahabubnagar", lat: 16.7488, lng: 78.0035 },
  sangareddy: { name: "Sangareddy", lat: 17.6244, lng: 78.0862 },
  siddipet: { name: "Siddipet", lat: 18.1018, lng: 78.8521 },
  medak: { name: "Medak", lat: 18.0450, lng: 78.2608 },
  kamareddy: { name: "Kamareddy", lat: 18.3200, lng: 78.3500 },
  jagtial: { name: "Jagtial", lat: 18.7907, lng: 78.9116 },
  peddapalli: { name: "Peddapalli", lat: 18.6167, lng: 79.3833 },
  mancherial: { name: "Mancherial", lat: 18.8707, lng: 79.4288 },
  nirmal: { name: "Nirmal", lat: 19.0964, lng: 78.3446 },
  bhupalpally: { name: "Bhupalpally", lat: 18.4411, lng: 79.8675 },
  mulugu: { name: "Mulugu", lat: 18.1934, lng: 79.9424 },
  mahabubabad: { name: "Mahabubabad", lat: 17.5975, lng: 80.0021 },
  jangaon: { name: "Jangaon", lat: 17.7266, lng: 79.1524 },
  bhongir: { name: "Bhongir", lat: 17.5154, lng: 78.8856 },
  vikarabad: { name: "Vikarabad", lat: 17.3381, lng: 77.9044 },
  wanaparthy: { name: "Wanaparthy", lat: 16.3639, lng: 78.0625 },
  gadwal: { name: "Gadwal", lat: 16.2350, lng: 77.7956 },
  nagarkurnool: { name: "Nagarkurnool", lat: 16.4821, lng: 78.3247 },
  narayanpet: { name: "Narayanpet", lat: 16.7449, lng: 77.4954 },
  kothagudem: { name: "Kothagudem", lat: 17.5511, lng: 80.6176 },
  asifabad: { name: "Asifabad", lat: 19.3667, lng: 79.2833 },
  medchal: { name: "Medchal", lat: 17.6297, lng: 78.4814 },
  sircilla: { name: "Sircilla", lat: 18.3890, lng: 78.8156 }
};
const clientGeocode = (name) => {
  if (!name) return null;
  const norm = name.toLowerCase().trim();
  if (COORDINATES[norm]) return COORDINATES[norm];
  
  // Resilient deterministic coordinates hashing around Chennai for previewing
  let hash = 0;
  for (let i = 0; i < norm.length; i++) {
    hash = norm.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = (Math.abs(hash % 1000) / 10000) - 0.05;
  const lngOffset = (Math.abs((hash >> 8) % 1000) / 10000) - 0.05;
  return {
    lat: 13.0827 + latOffset,
    lng: 80.2707 + lngOffset
  };
};
const RideSearchPage = () => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  
  // Map preview coordinates
  const [pickCoords, setPickCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  // Trigger geocode previews when inputs blur or change
  useEffect(() => {
    if (pickup) {
      setPickCoords(clientGeocode(pickup));
    } else {
      setPickCoords(null);
    }
  }, [pickup]);
  useEffect(() => {
    if (destination) {
      setDestCoords(clientGeocode(destination));
    } else {
      setDestCoords(null);
    }
  }, [destination]);
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    if (!pickup || !destination) {
      setError('Please fill in both pickup and destination');
      return;
    }
    setError('');
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.searchRides(pickup, destination);
      if (data.success) {
        setRides(data.rides);
      } else {
        setError(data.message || 'Failed to search rides');
      }
    } catch (err) {
      setError('Could not connect to database server.');
    } finally {
      setLoading(false);
    }
  };
  // Seed default items for first load so page is never blank and displays beautifully!
  useEffect(() => {
    const fetchAllRides = async () => {
      setLoading(true);
      try {
        const data = await api.searchRides('', '');
        if (data.success) {
          setRides(data.rides);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllRides();
  }, []);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Search Form & Cards List (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center space-x-2">
              <Compass className="h-5.5 w-5.5 text-brand-yellow" />
              <span>Find Overlapping Rides</span>
            </h2>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Pickup input */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Pickup Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <MapPin className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="text"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      placeholder="e.g. Chromepet"
                      className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-sm font-medium"
                    />
                  </div>
                </div>
                {/* Destination input */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Destination</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Navigation className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Guindy"
                      className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-extrabold text-brand-dark bg-brand-yellow hover:bg-yellow-400 focus:outline-none shadow-lg shadow-yellow-500/10 transition-all duration-200 disabled:opacity-50 items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    <span>Searching Routes...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4.5 w-4.5" />
                    <span>Search Commutes</span>
                  </>
                )}
              </button>
            </form>
          </div>
          {/* Rides List Container */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-white">
                {searched ? 'Matching Search Commutes' : 'All Available Active Commutes'}
              </h3>
              <span className="text-xs text-slate-400 font-bold bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
                {rides.length} result{rides.length !== 1 ? 's' : ''}
              </span>
            </div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 bg-slate-900/30 border border-slate-800/40 rounded-3xl">
                <div className="h-8 w-8 border-2 border-slate-800 border-t-brand-yellow rounded-full animate-spin mb-3" />
                <span className="text-slate-400 text-xs font-semibold">Filtering matching rides...</span>
              </div>
            ) : rides.length === 0 ? (
              <div className="bg-slate-900/30 border border-slate-800/40 rounded-3xl p-10 text-center">
                <HelpCircle className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                <h4 className="font-bold text-white">No Matching Commutes Found</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed mt-1">
                  Try searching broader transit areas (e.g., Tambaram, Guindy, Saidapet) or check back later as new drivers join.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rides.map(r => (
                  <RideCard 
                    key={r._id} 
                    ride={r} 
                    searchContext={searched ? { pickup, dropoff } : null} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Right Side: Interactive Leaflet Map Panel (5 columns) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 shadow-xl flex flex-col justify-between h-[450px]">
            <div className="mb-3 px-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Route Matcher Preview</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Plotting overlapping waypoints dynamically on open-source geographic maps.</p>
            </div>
            
            {/* The interactive map component */}
            <div className="flex-1 min-h-[300px]">
              <LeafletMap 
                pickup={pickup}
                destination={destination}
                pickupCoords={pickCoords}
                dropoffCoords={destCoords}
                height="320px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RideSearchPage;
