import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, MapPin, ArrowRight, User, Bike, Car, Zap } from 'lucide-react';
const RideCard = ({ ride, searchContext }) => {
  const {
    _id,
    driver,
    vehicle,
    startLocation,
    destination,
    departureTime,
    costPerSeat,
    availableSeats,
    matchPercentage
  } = ride;
  const formattedDate = new Date(departureTime).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  // Dynamic colors for Match Score
  const getScoreColor = (pct) => {
    if (pct >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (pct >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };
  const getVehicleIcon = (type) => {
    switch (type) {
      case 'bike': return <Bike className="h-5 w-5" />;
      case 'auto': return <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" />;
      default: return <Car className="h-5 w-5" />;
    }
  };
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 hover:shadow-xl hover:shadow-brand-yellow/5 transition-all duration-300 relative overflow-hidden group">
      
      {/* Route matching USP badge */}
      {matchPercentage !== undefined && (
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(matchPercentage)}`}>
          {matchPercentage}% Match
        </div>
      )}
      {/* Driver Identity */}
      <div className="flex items-center space-x-4 mb-5">
        <img
          src={driver?.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
          alt={driver?.name}
          className="h-12 w-12 rounded-full border border-slate-700 object-cover"
        />
        <div>
          <h4 className="font-bold text-white group-hover:text-brand-yellow transition-colors">{driver?.name}</h4>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className="flex items-center text-amber-400 text-xs font-bold">
              <Star className="h-3.5 w-3.5 fill-current mr-0.5" />
              {driver?.rating?.toFixed(1) || '5.0'}
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-slate-400 text-xs flex items-center capitalize">
              {getVehicleIcon(vehicle?.type)}
              <span className="ml-1 font-medium">{vehicle?.model || 'Vehicle'}</span>
            </span>
          </div>
        </div>
      </div>
      {/* Journey stops */}
      <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 mb-6">
        <div className="flex items-start space-x-3 text-sm">
          <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0 z-10">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Departure</span>
            <span className="text-slate-200 font-semibold mt-0.5">{startLocation}</span>
          </div>
        </div>
        <div className="flex items-start space-x-3 text-sm">
          <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0 z-10">
            <div className="h-2 w-2 rounded-full bg-brand-yellow" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Destination</span>
            <span className="text-slate-200 font-semibold mt-0.5">{destination}</span>
          </div>
        </div>
      </div>
      {/* Schedule and cost footer */}
      <div className="border-t border-slate-800 pt-5 flex items-center justify-between">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center text-xs text-slate-400">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center text-xs text-slate-400">
            <User className="h-3.5 w-3.5 mr-1" />
            <span>{availableSeats} seat{availableSeats > 1 ? 's' : ''} left</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-xs text-slate-500 block leading-none mb-0.5">Fare per seat</span>
            <span className="text-lg font-extrabold text-white">₹{costPerSeat}</span>
          </div>
          
          <Link
            to={`/ride/${_id}`}
            state={searchContext ? { fromSearch: true, pickup: searchContext.pickup, dropoff: searchContext.dropoff } : null}
            className="bg-slate-800 hover:bg-brand-yellow text-slate-200 hover:text-brand-dark p-2.5 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
export default RideCard;
