import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Calendar, User, MapPin, ArrowRight, ShieldCheck, Clock, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
const PassengerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getPassengerBookings();
      if (data.success) {
        setBookings(data.bookings);
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
    fetchBookings();
  }, []);
  // Filter bookings based on status
  const pendingRequests = bookings.filter(b => b.status === 'pending');
  const upcomingRides = bookings.filter(b => b.status === 'accepted');
  const pastRides = bookings.filter(b => b.status === 'completed' || b.status === 'rejected');
  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            Rejected
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Pending Approval
          </span>
        );
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Passenger Dashboard</h1>
          <p className="mt-1.5 text-slate-400 font-medium">Track your requested rides, scheduled commutes, and travel history.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBookings}
            className="p-3 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-all"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/search"
            className="bg-brand-yellow hover:bg-yellow-400 text-brand-dark px-5 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-yellow-500/10 transition-all duration-300 flex items-center justify-center space-x-1.5"
          >
            <span>Search New Rides</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative h-12 w-12 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
            <div className="absolute inset-0 rounded-full border-2 border-t-brand-yellow animate-spin" />
          </div>
          <span className="text-slate-400 text-sm font-medium tracking-wide">Syncing bookings...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-6 py-4 rounded-xl text-center">
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-10 text-center max-w-lg mx-auto mt-6">
          <MapPin className="h-10 w-10 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Bookings Yet</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            You haven't requested any rides yet. Look for drivers traveling in your direction and book your first split-cost commute.
          </p>
          <Link
            to="/search"
            className="bg-slate-800 hover:bg-brand-yellow text-slate-200 hover:text-brand-dark font-bold px-6 py-3 rounded-xl text-sm transition-all"
          >
            Find a Ride
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Section 1: Upcoming Rides (Accepted) */}
          {upcomingRides.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-5 flex items-center">
                <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2.5" />
                Upcoming Commutes ({upcomingRides.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingRides.map(b => (
                  <BookingItemCard key={b._id} booking={b} statusBadge={getStatusBadge(b.status)} />
                ))}
              </div>
            </div>
          )}
          {/* Section 2: Pending Requests */}
          {pendingRequests.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-5 flex items-center">
                <span className="h-2 w-2 rounded-full bg-amber-500 mr-2.5" />
                Pending Approvals ({pendingRequests.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingRequests.map(b => (
                  <BookingItemCard key={b._id} booking={b} statusBadge={getStatusBadge(b.status)} />
                ))}
              </div>
            </div>
          )}
          {/* Section 3: Booking History */}
          {pastRides.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-5 flex items-center">
                <span className="h-2 w-2 rounded-full bg-slate-600 mr-2.5" />
                Travel History ({pastRides.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastRides.map(b => (
                  <BookingItemCard key={b._id} booking={b} statusBadge={getStatusBadge(b.status)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
// Sub-Component for Booking Card to simplify rendering
const BookingItemCard = ({ booking, statusBadge }) => {
  const { ride, pickup, dropoff, seatsRequested, matchPercentage, _id } = booking;
  
  if (!ride) return null;
  const formattedDate = new Date(ride.departureTime).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  return (
    <div className="bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group">
      
      {/* Top Details & Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={ride.driver?.profilePic}
            alt={ride.driver?.name}
            className="h-10 w-10 rounded-full border border-slate-800 object-cover"
          />
          <div>
            <h4 className="font-bold text-white text-sm">{ride.driver?.name}</h4>
            <span className="text-slate-400 text-xs font-semibold uppercase">{ride.vehicle?.model}</span>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1.5">
          {statusBadge}
          {matchPercentage !== undefined && (
            <span className="text-[10px] font-bold text-brand-yellow bg-brand-yellow/5 border border-brand-yellow/15 px-2 py-0.5 rounded">
              {matchPercentage}% Route Match
            </span>
          )}
        </div>
      </div>
      {/* Booking specific Pickup & Dropoff */}
      <div className="space-y-2.5 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 mb-5">
        <div className="flex items-start space-x-2 text-xs">
          <div className="h-5 w-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 z-10">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
          <span className="text-slate-300 font-medium">
            <strong className="text-slate-500 uppercase tracking-wide text-[9px] block">Your Pickup</strong>
            {pickup}
          </span>
        </div>
        <div className="flex items-start space-x-2 text-xs">
          <div className="h-5 w-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 z-10">
            <div className="h-1.5 w-1.5 rounded-full bg-brand-yellow" />
          </div>
          <span className="text-slate-300 font-medium">
            <strong className="text-slate-500 uppercase tracking-wide text-[9px] block">Your Dropoff</strong>
            {dropoff}
          </span>
        </div>
      </div>
      {/* Footer details */}
      <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between mt-auto">
        <div className="flex flex-col text-xs text-slate-500">
          <span className="flex items-center text-slate-400 font-semibold mb-0.5">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            {formattedDate}
          </span>
          <span>{seatsRequested} seat{seatsRequested > 1 ? 's' : ''} requested</span>
        </div>
        <div className="flex items-center space-x-3.5">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block">Total Fare</span>
            <span className="text-base font-extrabold text-white">₹{ride.costPerSeat * seatsRequested}</span>
          </div>
          <Link
            to={`/ride/${ride._id}`}
            state={{ fromDashboard: true }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-brand-yellow text-slate-300 hover:text-brand-dark transition-all"
            title="View Journey Details"
          >
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
export default PassengerDashboard;
