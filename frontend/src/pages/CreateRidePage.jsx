import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Compass, Calendar, Coins, UserPlus, AlertCircle, HelpCircle, Navigation } from 'lucide-react';
const CreateRidePage = () => {
  const { vehicle } = useAuth();
  const navigate = useNavigate();
  
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [intermediateStops, setIntermediateStops] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [costPerSeat, setCostPerSeat] = useState('');
  const [availableSeats, setAvailableSeats] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Set default available seats based on vehicle capacity
  useEffect(() => {
    if (vehicle) {
      setAvailableSeats(vehicle.capacity.toString());
    }
  }, [vehicle]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!startLocation || !destination || !departureTime || !costPerSeat || !availableSeats) {
      setError('Please fill in all required fields.');
      return;
    }
    setIsLoading(true);
    // Assemble the complete array of route stops in sequence
    // e.g. ['Tambaram', 'Chromepet', 'Guindy', 'T Nagar']
    const intermediateArray = intermediateStops
      ? intermediateStops.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];
    
    const routePoints = [
      startLocation.trim(),
      ...intermediateArray,
      destination.trim()
    ];
    const rideData = {
      startLocation: startLocation.trim(),
      destination: destination.trim(),
      routePoints,
      departureTime: new Date(departureTime),
      costPerSeat: Number(costPerSeat),
      availableSeats: Number(availableSeats)
    };
    try {
      const res = await api.createRide(rideData);
      if (res.success) {
        navigate('/driver-dashboard');
      } else {
        setError(res.message || 'Failed to create ride');
      }
    } catch (err) {
      setError('Could not connect to the database server.');
    } finally {
      setIsLoading(false);
    }
  };
  if (!vehicle) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <AlertCircle className="h-12 w-12 text-brand-yellow mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Vehicle Profile Required</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            You must add a vehicle in your profile dashboard before you can publish ride schedules.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="bg-brand-yellow hover:bg-yellow-400 text-brand-dark px-6 py-3 rounded-xl text-sm font-bold shadow-lg"
          >
            Register Vehicle
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Top visual tab indicator */}
        <div className="absolute top-0 inset-x-0 h-1 bg-brand-yellow" />
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">Create a Commute Plan</h1>
          <p className="mt-1 text-slate-400 text-sm font-medium">List your scheduled travel route, available seats, and split travel cost.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-2">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {/* Locations grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Location */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Start Location (Departure)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Navigation className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  required
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  placeholder="e.g. Tambaram"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-sm font-medium"
                />
              </div>
            </div>
            {/* Destination Location */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Final Destination</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Navigation className="h-4.5 w-4.5 transform rotate-90" />
                </div>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. T Nagar"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>
          {/* Route stops/Waypoints */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Transit Stops (In Order)</label>
              <span className="text-[10px] text-slate-500 font-bold">Separated by commas</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Compass className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                value={intermediateStops}
                onChange={(e) => setIntermediateStops(e.target.value)}
                placeholder="e.g. Chromepet, Guindy"
                className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-sm font-medium"
              />
            </div>
            <p className="mt-1.5 text-[10px] text-slate-500 leading-normal flex items-start space-x-1">
              <HelpCircle className="h-3.5 w-3.5 text-slate-600 shrink-0 mt-0.5" />
              <span>
                Enter key transit milestones in sequence. The route matching algorithm projects passenger pickups against this precise layout to estimate detour overlap.
              </span>
            </p>
          </div>
          {/* Pricing & seats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Date time */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Departure Schedule</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <input
                  type="datetime-local"
                  required
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-sm font-medium"
                />
              </div>
            </div>
            {/* Cost per seat */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Fare per Seat (₹)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Coins className="h-4.5 w-4.5" />
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  value={costPerSeat}
                  onChange={(e) => setCostPerSeat(e.target.value)}
                  placeholder="e.g. 150"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-sm font-medium"
                />
              </div>
            </div>
            {/* Capacity / Available seats */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Seats Offered</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <UserPlus className="h-4.5 w-4.5" />
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  max={vehicle.capacity.toString()}
                  value={availableSeats}
                  onChange={(e) => setAvailableSeats(e.target.value)}
                  placeholder="e.g. 3"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>
          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-extrabold text-brand-dark bg-brand-yellow hover:bg-yellow-400 focus:outline-none shadow-lg shadow-yellow-500/10 transition-all duration-200 disabled:opacity-50 items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>Publishing Commute Plan...</span>
              </>
            ) : (
              <span>Publish Ride</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
export default CreateRidePage;
