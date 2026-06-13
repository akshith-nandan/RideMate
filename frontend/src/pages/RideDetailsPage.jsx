import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import LeafletMap from '../components/LeafletMap';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, Star, MapPin, Navigation, ArrowRight, ShieldCheck, Compass, MessageSquare, Phone, CheckCircle, ChevronLeft } from 'lucide-react';
// Local geocoder database to compute client-side previews in Details map
const COORDINATES = {
  'tambaram': { name: 'Tambaram', lat: 12.9249, lng: 80.0100 },
  'chromepet': { name: 'Chromepet', lat: 12.9516, lng: 80.1462 },
  'guindy': { name: 'Guindy', lat: 13.0067, lng: 80.2206 },
  't nagar': { name: 'T Nagar', lat: 13.0418, lng: 80.2337 },
  't. nagar': { name: 'T Nagar', lat: 13.0418, lng: 80.2337 },
  'saidapet': { name: 'Saidapet', lat: 13.0200, lng: 80.2215 },
  'adyar': { name: 'Adyar', lat: 13.0012, lng: 80.2565 },
  'velachery': { name: 'Velachery', lat: 12.9796, lng: 80.2196 },
  'central': { name: 'Chennai Central', lat: 13.0827, lng: 80.2707 },
  'egmore': { name: 'Egmore', lat: 13.0784, lng: 80.2588 }
};
const clientGeocode = (name) => {
  if (!name) return null;
  const norm = name.toLowerCase().trim();
  if (COORDINATES[norm]) return COORDINATES[norm];
  
  // Resilient deterministic coordinates hashing
  let hash = 0;
  for (let i = 0; i < norm.length; i++) {
    hash = norm.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = (Math.abs(hash % 1000) / 10000) - 0.05;
  const lngOffset = (Math.abs((hash >> 8) % 1000) / 10000) - 0.05;
  return {
    name,
    lat: 13.0827 + latOffset,
    lng: 80.2707 + lngOffset
  };
};
const RideDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Booking Form States
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [seatsRequested, setSeatsRequested] = useState('1');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  // Extract query contexts from search page if available
  useEffect(() => {
    if (location.state) {
      if (location.state.pickup) setPickup(location.state.pickup);
      if (location.state.dropoff) setDropoff(location.state.dropoff);
    }
  }, [location.state]);
  const fetchRideDetails = async () => {
    setLoading(true);
    try {
      const data = await api.getRideDetails(id);
      if (data.success) {
        setRide(data.ride);
      } else {
        setError(data.message || 'Failed to fetch ride details');
      }
    } catch (err) {
      setError('Could not connect to database server.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRideDetails();
  }, [id]);
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingLoading(true);
    if (!pickup || !dropoff) {
      setBookingError('Please enter both your pickup and dropoff points.');
      setBookingLoading(false);
      return;
    }
    try {
      const data = await api.requestBooking(
        id, 
        pickup.trim(), 
        dropoff.trim(), 
        Number(seatsRequested)
      );
      if (data.success) {
        setBookingSuccess(true);
      } else {
        setBookingError(data.message || 'Failed to submit booking request');
      }
    } catch (err) {
      setBookingError('Server connection error. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-[calc(screen-16)] flex flex-col items-center justify-center bg-brand-dark">
        <div className="h-8 w-8 border-2 border-slate-800 border-t-brand-yellow rounded-full animate-spin mb-3" />
        <span className="text-slate-400 text-xs font-semibold">Retrieving ride details...</span>
      </div>
    );
  }
  if (error || !ride) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-rose-400">
          <AlertCircle className="h-10 w-10 mx-auto mb-4" />
          <p>{error || 'Ride commute not found.'}</p>
          <button onClick={() => navigate(-1)} className="mt-4 bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm">
            Go Back
          </button>
        </div>
      </div>
    );
  }
  // Precompute geocoded coordinates for map markers
  const driverCoords = ride.routePoints.map(clientGeocode);
  const pickupC = pickup ? clientGeocode(pickup) : null;
  const dropoffC = dropoff ? clientGeocode(dropoff) : null;
  const formattedDate = new Date(ride.departureTime).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const isDriverSelf = user?._id === ride.driver?._id;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-1.5 text-slate-400 hover:text-white font-semibold text-xs mb-6 uppercase tracking-wider bg-slate-900/60 border border-slate-850 px-3.5 py-2 rounded-xl transition-all"
      >
        <ChevronLeft className="h-4.5 w-4.5" />
        <span>Back to search</span>
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Hand: Ride Details Card (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
            
            {/* Header: Locations & Price */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between border-b border-slate-800/80 pb-6 mb-6 gap-4">
              <div>
                <div className="flex items-center space-x-2 text-xs text-brand-yellow font-bold uppercase tracking-wider mb-2 bg-brand-yellow/5 border border-brand-yellow/15 px-3 py-1 rounded-full w-fit">
                  <Compass className="h-3.5 w-3.5" />
                  <span>Commute Plan</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                  {ride.startLocation} to {ride.destination}
                </h1>
                <p className="text-slate-400 text-xs mt-1.5 font-semibold flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  Departure Scheduled: {formattedDate}
                </p>
              </div>
              <div className="text-left md:text-right bg-slate-950/40 p-4 border border-slate-850 rounded-2xl shrink-0">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-0.5">Seat Fare</span>
                <span className="text-2xl font-black text-white">₹{ride.costPerSeat}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{ride.availableSeats} seat{ride.availableSeats > 1 ? 's' : ''} left</span>
              </div>
            </div>
            {/* Journey Stops Sequence */}
            <div className="mb-8 bg-slate-950/20 p-5 rounded-2xl border border-slate-850">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Complete Driver Route Timeline</h3>
              
              <div className="flex flex-wrap items-center gap-y-3">
                {ride.routePoints.map((stop, idx) => (
                  <React.Fragment key={idx}>
                    <div className="bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center space-x-2">
                      <span className={`h-2 w-2 rounded-full ${
                        idx === 0 ? 'bg-blue-500' : 
                        idx === ride.routePoints.length - 1 ? 'bg-red-500' : 
                        'bg-brand-yellow'
                      }`} />
                      <span>{stop}</span>
                    </div>
                    {idx < ride.routePoints.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-slate-700 mx-2 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            {/* Vehicle Registry details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Vehicle Type</span>
                <strong className="text-white capitalize text-sm">{ride.vehicle?.type}</strong>
              </div>
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Model Name</span>
                <strong className="text-white text-sm">{ride.vehicle?.model}</strong>
              </div>
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">License Plate</span>
                <strong className="text-white uppercase text-sm">{ride.vehicle?.number}</strong>
              </div>
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Max capacity</span>
                <strong className="text-white text-sm">{ride.vehicle?.capacity} seats</strong>
              </div>
            </div>
            {/* Driver Profile Section */}
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <img
                  src={ride.driver?.profilePic}
                  alt={ride.driver?.name}
                  className="h-14 w-14 rounded-full border border-slate-800 object-cover"
                />
                <div>
                  <h4 className="font-extrabold text-white text-lg">{ride.driver?.name}</h4>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="flex items-center text-amber-400 text-xs font-bold bg-amber-500/5 px-2.5 py-0.5 rounded border border-amber-500/10">
                      <Star className="h-3.5 w-3.5 fill-current mr-0.5 text-amber-400" />
                      {ride.driver?.rating?.toFixed(1) || '5.0'} Rating
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 uppercase font-bold">
                      Verified Owner
                    </span>
                  </div>
                </div>
              </div>
              {!isDriverSelf && (
                <div className="flex items-center gap-3">
                  <a
                    href={`tel:${ride.driver?.phone}`}
                    className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-all shadow-md"
                    title="Call Driver"
                  >
                    <Phone className="h-4.5 w-4.5" />
                  </a>
                  <a
                    href={`sms:${ride.driver?.phone}`}
                    className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-all shadow-md"
                    title="Message Driver"
                  >
                    <MessageSquare className="h-4.5 w-4.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
          {/* Interactive overlap map panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3.5">Interactive Journey Overlay Map</h3>
            <div className="h-[360px] w-full">
              <LeafletMap 
                pickup={pickup}
                destination={dropoff}
                pickupCoords={pickupC}
                dropoffCoords={dropoffC}
                driverCoords={driverCoords}
                height="340px"
              />
            </div>
          </div>
        </div>
        {/* Right Hand: Request Booking panel (5 Columns) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            
            {/* Design indicator */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 to-brand-yellow" />
            {bookingSuccess ? (
              <div className="text-center py-10">
                <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-5 animate-bounce" />
                <h3 className="text-2xl font-black text-white mb-2">Request Submitted!</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed mb-6">
                  Your seat booking has been successfully transmitted to <strong>{ride.driver?.name}</strong>. Track its acceptance on your dashboard.
                </p>
                <button
                  onClick={() => navigate('/passenger-dashboard')}
                  className="bg-brand-yellow hover:bg-yellow-400 text-brand-dark px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-yellow-500/10 w-full"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : isDriverSelf ? (
              <div className="py-6 text-center">
                <ShieldCheck className="h-12 w-12 text-brand-indigo mx-auto mb-4" />
                <h4 className="font-bold text-white mb-1">Your Published Ride Commute</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto mb-5">
                  You are registered as the driver of this commute. Go to your driver dashboard to accept bookings, review overlaps, and track progress.
                </p>
                <button
                  onClick={() => navigate('/driver-dashboard')}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all w-full"
                >
                  Manage bookings on Dashboard
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Book Split-Cost Seat</h3>
                <p className="text-xs text-slate-400 font-medium mb-5">Input your specific pickup/dropoff points to estimate route match score.</p>
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  {/* Pickup location */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Your Pickup</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600">
                        <MapPin className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        placeholder="e.g., Chromepet"
                        className="block w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow text-sm font-semibold"
                      />
                    </div>
                  </div>
                  {/* Dropoff location */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Your Drop-Off</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600">
                        <Navigation className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={dropoff}
                        onChange={(e) => setDropoff(e.target.value)}
                        placeholder="e.g., Guindy"
                        className="block w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow text-sm font-semibold"
                      />
                    </div>
                  </div>
                  {/* Seats requests */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Seats Needed</label>
                    <select
                      value={seatsRequested}
                      onChange={(e) => setSeatsRequested(e.target.value)}
                      className="block w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-brand-yellow text-sm font-semibold"
                    >
                      {[...Array(Math.min(ride.availableSeats, 4))].map((_, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1} Seat{i > 0 ? 's' : ''} (₹{ride.costPerSeat * (i + 1)})
                        </option>
                      ))}
                    </select>
                  </div>
                  {bookingError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3.5 py-2.5 rounded-xl text-xs font-semibold">
                      {bookingError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-extrabold text-brand-dark bg-brand-yellow hover:bg-yellow-400 focus:outline-none shadow-lg shadow-yellow-500/10 transition-all duration-200 disabled:opacity-50 items-center space-x-2"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                        <span>Transmitting request...</span>
                      </>
                    ) : (
                      <span>Request Booking</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default RideDetailsPage;
