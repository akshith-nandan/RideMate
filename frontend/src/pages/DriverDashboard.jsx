import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Calendar, User, MapPin, ArrowRight, ShieldCheck, Check, X, Users, Coins, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
const DriverDashboard = () => {
  const { vehicle } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [earnings, setEarnings] = useState(0);
  const fetchDriverDashboardData = async () => {
    setLoading(true);
    try {
      const data = await api.getDriverBookings();
      if (data.success) {
        setBookings(data.bookings);
        // Calculate earnings
        // Earnings are calculated based on accepted or completed bookings
        const total = data.bookings
          .filter(b => b.status === 'accepted' || b.status === 'completed')
          .reduce((sum, b) => sum + (b.seatsRequested * b.ride.costPerSeat), 0);
        setEarnings(total);
      } else {
        setError(data.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDriverDashboardData();
  }, []);
  const handleAccept = async (bookingId) => {
    try {
      const res = await api.acceptBooking(bookingId);
      if (res.success) {
        // Refresh dashboard data
        fetchDriverDashboardData();
      } else {
        alert(res.message || 'Failed to accept request');
      }
    } catch (err) {
      alert('Error updating booking status.');
    }
  };
  const handleReject = async (bookingId) => {
    try {
      const res = await api.rejectBooking(bookingId);
      if (res.success) {
        // Refresh dashboard data
        fetchDriverDashboardData();
      } else {
        alert(res.message || 'Failed to reject request');
      }
    } catch (err) {
      alert('Error updating booking status.');
    }
  };
  const pendingRequests = bookings.filter(b => b.status === 'pending');
  const acceptedCommutes = bookings.filter(b => b.status === 'accepted');
  const pastCommutes = bookings.filter(b => b.status === 'completed' || b.status === 'rejected');
  if (!vehicle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 to-brand-yellow" />
          <AlertTriangle className="h-14 w-14 text-brand-yellow mx-auto mb-6" />
          <h2 className="text-2xl font-extrabold text-white mb-3">Vehicle Details Required</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed mb-8">
            Before you can share seats, create rides, and view earnings, you must register your vehicle details (Bike, Auto, or Car) in your profile.
          </p>
          <Link
            to="/profile"
            className="bg-brand-yellow hover:bg-yellow-400 text-brand-dark px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-yellow-500/10 transition-all duration-300 inline-flex items-center space-x-2"
          >
            <span>Register Vehicle Now</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header and Earnings Cards */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Driver Dashboard</h1>
          <p className="mt-1.5 text-slate-400 font-medium">Manage your created rides, respond to passenger requests, and view earnings.</p>
        </div>
        
        {/* Earnings & Actions */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-slate-900 border border-slate-850 px-5 py-3 rounded-2xl flex items-center space-x-3.5 shadow-lg">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider leading-none mb-0.5">Total Earnings</span>
              <span className="text-xl font-black text-white">₹{earnings}</span>
            </div>
          </div>
          <button
            onClick={fetchDriverDashboardData}
            className="p-3.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-all"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/create-ride"
            className="bg-brand-yellow hover:bg-yellow-400 text-brand-dark px-5 py-3.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-yellow-500/10 transition-all duration-300 flex items-center space-x-1.5"
          >
            <Sparkles className="h-4.5 w-4.5 fill-current" />
            <span>Create New Ride</span>
          </Link>
        </div>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative h-12 w-12 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
            <div className="absolute inset-0 rounded-full border-2 border-t-brand-yellow animate-spin" />
          </div>
          <span className="text-slate-400 text-sm font-medium tracking-wide">Syncing routes...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-6 py-4 rounded-xl text-center">
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-10 text-center max-w-lg mx-auto mt-6">
          <Users className="h-10 w-10 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Commuters Yet</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            You have registered your vehicle successfully. Now, post your daily travel routes, and let passengers request seats.
          </p>
          <Link
            to="/create-ride"
            className="bg-slate-800 hover:bg-brand-yellow text-slate-200 hover:text-brand-dark font-bold px-6 py-3 rounded-xl text-sm transition-all"
          >
            Create Ride
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Section 1: Pending Booking Requests */}
          {pendingRequests.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-5 flex items-center">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-yellow mr-2.5 animate-pulse" />
                Pending Requests ({pendingRequests.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingRequests.map(b => (
                  <DriverRequestCard 
                    key={b._id} 
                    booking={b} 
                    onAccept={handleAccept} 
                    onReject={handleReject} 
                  />
                ))}
              </div>
            </div>
          )}
          {/* Section 2: Active Shared Commutes (Accepted) */}
          {acceptedCommutes.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-5 flex items-center">
                <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2.5" />
                Active Shared Commutes ({acceptedCommutes.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {acceptedCommutes.map(b => (
                  <DriverCommuteCard key={b._id} booking={b} isHistory={false} />
                ))}
              </div>
            </div>
          )}
          {/* Section 3: History */}
          {pastCommutes.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-5 flex items-center">
                <span className="h-2 w-2 rounded-full bg-slate-600 mr-2.5" />
                Journey Archive ({pastCommutes.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastCommutes.map(b => (
                  <DriverCommuteCard key={b._id} booking={b} isHistory={true} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
// Sub-Component: Request card with Accept/Reject Actions
const DriverRequestCard = ({ booking, onAccept, onReject }) => {
  const { passenger, pickup, dropoff, seatsRequested, matchPercentage, _id, ride } = booking;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all duration-300">
      
      {/* Top Passenger Profile */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={passenger?.profilePic}
            alt={passenger?.name}
            className="h-10 w-10 rounded-full border border-slate-800 object-cover"
          />
          <div>
            <h4 className="font-bold text-white text-sm">{passenger?.name}</h4>
            <span className="text-slate-400 text-xs font-medium">Rating: 5.0 ★</span>
          </div>
        </div>
        <div className="bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow px-2 py-0.5 rounded text-[10px] font-bold">
          {matchPercentage}% Match
        </div>
      </div>
      {/* Ride details info */}
      <div className="mb-4 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Commute Plan</span>
        <div className="flex items-center text-xs font-semibold text-slate-300 space-x-2">
          <span>{ride?.startLocation}</span>
          <ArrowRight className="h-3 w-3 text-slate-600" />
          <span>{ride?.destination}</span>
        </div>
      </div>
      {/* Pickup & Dropoff of Passenger */}
      <div className="space-y-2 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-850 mb-5">
        <div className="flex items-start space-x-2 text-xs">
          <div className="h-4.5 w-4.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 z-10">
            <span className="h-1 w-1 bg-emerald-500 rounded-full" />
          </div>
          <span className="text-slate-400 font-medium">{pickup}</span>
        </div>
        <div className="flex items-start space-x-2 text-xs">
          <div className="h-4.5 w-4.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 z-10">
            <span className="h-1 w-1 bg-brand-yellow rounded-full" />
          </div>
          <span className="text-slate-400 font-medium">{dropoff}</span>
        </div>
      </div>
      {/* Footer details & CTA buttons */}
      <div className="border-t border-slate-850 pt-4 flex items-center justify-between">
        <div className="text-xs">
          <span className="text-slate-500 block leading-none mb-0.5">commuter fare</span>
          <strong className="text-white text-sm">₹{ride?.costPerSeat * seatsRequested}</strong>
          <span className="text-[10px] text-slate-400 block mt-0.5">{seatsRequested} seat{seatsRequested > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onReject(_id)}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-300"
            title="Reject Commuter"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={() => onAccept(_id)}
            className="py-2.5 px-4.5 rounded-xl bg-brand-yellow hover:bg-yellow-400 text-brand-dark font-extrabold text-xs transition-all duration-300 flex items-center space-x-1 shadow-md shadow-yellow-500/5"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            <span>Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};
// Sub-Component: Active Commute Card
const DriverCommuteCard = ({ booking, isHistory }) => {
  const { passenger, pickup, dropoff, seatsRequested, matchPercentage, ride, status } = booking;
  
  if (!ride) return null;
  const formattedDate = new Date(ride.departureTime).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all duration-300">
      
      {/* Top panel */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={passenger?.profilePic}
            alt={passenger?.name}
            className="h-9 w-9 rounded-full border border-slate-800 object-cover"
          />
          <div>
            <h4 className="font-bold text-white text-xs leading-none">{passenger?.name}</h4>
            <span className="text-[10px] text-slate-500 font-semibold uppercase mt-1 block">Commuter Profile</span>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          status === 'accepted' ? 'text-emerald-400 bg-emerald-500/10' :
          status === 'rejected' ? 'text-rose-400 bg-rose-500/10' :
          'text-blue-400 bg-blue-500/10'
        }`}>
          {status}
        </span>
      </div>
      {/* Pickup & Dropoff details */}
      <div className="space-y-2 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-850 mb-5 text-xs">
        <div className="flex items-start space-x-2">
          <div className="h-4.5 w-4.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 z-10">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
          </div>
          <span className="text-slate-300 font-medium">Pickup: {pickup}</span>
        </div>
        <div className="flex items-start space-x-2">
          <div className="h-4.5 w-4.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 z-10">
            <span className="h-1.5 w-1.5 bg-brand-yellow rounded-full" />
          </div>
          <span className="text-slate-300 font-medium">Drop-off: {dropoff}</span>
        </div>
      </div>
      {/* Schedule and cost details */}
      <div className="border-t border-slate-850 pt-4 flex items-center justify-between">
        <div className="text-xs text-slate-500 flex flex-col">
          <span className="flex items-center text-slate-400 font-bold mb-0.5">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            {formattedDate}
          </span>
          <span>{seatsRequested} seat{seatsRequested > 1 ? 's' : ''} occupied</span>
        </div>
        <div className="text-right flex items-center space-x-3.5">
          <div>
            <span className="text-[10px] text-slate-500 block">Earnings Collected</span>
            <span className="text-base font-extrabold text-emerald-400">+₹{ride.costPerSeat * seatsRequested}</span>
          </div>
          <Link
            to={`/ride/${ride._id}`}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-brand-yellow hover:text-slate-900 text-slate-300 transition-all"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
export default DriverDashboard;
