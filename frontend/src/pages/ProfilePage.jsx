import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Phone, Mail, Bike, Car, Zap, CheckCircle, ShieldAlert, Award, Sparkles } from 'lucide-react';
const ProfilePage = () => {
  const { user, vehicle, refreshUser } = useAuth();
  const isDriver = user?.role === 'driver';
  // Profile Edit States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  // Vehicle Edit States
  const [vehicleType, setVehicleType] = useState('bike');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleCapacity, setVehicleCapacity] = useState('1');
  const [vehicleSuccess, setVehicleSuccess] = useState('');
  const [vehicleError, setVehicleError] = useState('');
  const [vehicleLoading, setVehicleLoading] = useState(false);
  // Pre-populate fields on load
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setProfilePic(user.profilePic || '');
    }
    if (vehicle) {
      setVehicleType(vehicle.type);
      setVehicleModel(vehicle.model);
      setVehicleNumber(vehicle.number);
      setVehicleCapacity(vehicle.capacity.toString());
    }
  }, [user, vehicle]);
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileLoading(true);
    try {
      const data = await api.updateProfile({ name, phone, profilePic });
      if (data.success) {
        setProfileSuccess('Profile updated successfully!');
        refreshUser();
      } else {
        setProfileError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setProfileError('Failed to connect to the backend server.');
    } finally {
      setProfileLoading(false);
    }
  };
  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    setVehicleSuccess('');
    setVehicleError('');
    setVehicleLoading(true);
    try {
      const data = await api.registerVehicle({
        type: vehicleType,
        model: vehicleModel.trim(),
        number: vehicleNumber.trim(),
        capacity: Number(vehicleCapacity)
      });
      if (data.success) {
        setVehicleSuccess(data.message || 'Vehicle details registered successfully!');
        refreshUser();
      } else {
        setVehicleError(data.message || 'Failed to register vehicle details');
      }
    } catch (err) {
      setVehicleError('Failed to connect to the backend server.');
    } finally {
      setVehicleLoading(false);
    }
  };
  const getVehicleIcon = (type) => {
    switch (type) {
      case 'bike': return <Bike className="h-10 w-10 text-emerald-400" />;
      case 'auto': return <Zap className="h-10 w-10 text-brand-yellow fill-brand-yellow" />;
      default: return <Car className="h-10 w-10 text-indigo-400" />;
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Intro Grid */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 border-b border-slate-800 pb-8">
        <div className="flex items-center space-x-5">
          <img
            src={user?.profilePic}
            alt={user?.name}
            className="h-20 w-20 rounded-full border-2 border-brand-yellow object-cover"
          />
          <div>
            <h1 className="text-3xl font-extrabold text-white">{user?.name}</h1>
            <div className="flex items-center space-x-2.5 mt-1">
              <span className="text-xs text-slate-400 font-semibold">{user?.email}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-brand-yellow font-bold uppercase tracking-wider bg-brand-yellow/5 border border-brand-yellow/15 px-2.5 py-0.5 rounded-full">
                {user?.role} Account
              </span>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-850 px-6 py-4 rounded-2xl flex items-center space-x-4 shadow-lg shrink-0">
          <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider leading-none mb-1">User Rating</span>
            <span className="text-lg font-black text-white">{user?.rating?.toFixed(1) || '5.0'} ★</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Side: Profile Editing */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <User className="h-5.5 w-5.5 text-brand-yellow" />
            <span>Customize Personal Details</span>
          </h2>
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            {profileSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <CheckCircle className="h-4.5 w-4.5" />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2.5 rounded-xl text-xs font-semibold">
                {profileError}
              </div>
            )}
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-brand-yellow text-sm font-semibold"
                />
              </div>
            </div>
            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600">
                  <Phone className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-brand-yellow text-sm font-semibold"
                />
              </div>
            </div>
            {/* Profile pic URL */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Profile Picture URL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  type="url"
                  value={profilePic}
                  onChange={(e) => setProfilePic(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="block w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-brand-yellow text-sm font-semibold"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={profileLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-brand-dark bg-brand-yellow hover:bg-yellow-400 focus:outline-none transition-all disabled:opacity-50 items-center space-x-2"
            >
              {profileLoading ? <span>Saving Details...</span> : <span>Save Details</span>}
            </button>
          </form>
        </div>
        {/* Right Side: Vehicle Registry & Prompts */}
        <div className="space-y-6">
          {isDriver ? (
            <>
              {/* Active vehicle preview card */}
              {vehicle ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex items-center justify-between group">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-indigo" />
                  <div className="flex items-center space-x-4">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner">
                      {getVehicleIcon(vehicle.type)}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider leading-none mb-0.5">Active Vehicle Profile</span>
                      <h4 className="text-lg font-black text-white leading-none mt-1">{vehicle.model}</h4>
                      <span className="text-xs text-brand-yellow font-bold uppercase tracking-wider block mt-1">{vehicle.number}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold leading-none mb-0.5">Seat capacity</span>
                    <span className="text-xl font-black text-white">{vehicle.capacity} seats</span>
                  </div>
                </div>
              ) : (
                <div className="bg-brand-indigo/5 border border-brand-indigo/15 rounded-3xl p-6 flex items-start space-x-4">
                  <ShieldAlert className="h-6 w-6 text-brand-indigo shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Become a Commuting Driver</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">
                      Want to publish routes, share seats, and split travel costs? Register your bike, auto, or car details below to automatically transition your account into a **Commuter Driver**.
                    </p>
                  </div>
                </div>
              )}
              {/* Vehicle Form */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <Sparkles className="h-5.5 w-5.5 text-brand-yellow" />
                  <span>{vehicle ? 'Update Vehicle Registry' : 'Register Vehicle Profile'}</span>
                </h2>
                <form onSubmit={handleVehicleSubmit} className="space-y-5">
                  {vehicleSuccess && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2">
                      <CheckCircle className="h-4.5 w-4.5" />
                      <span>{vehicleSuccess}</span>
                    </div>
                  )}
                  {vehicleError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2.5 rounded-xl text-xs font-semibold">
                      {vehicleError}
                    </div>
                  )}
                  {/* Vehicle Type Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Vehicle Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['bike', 'auto', 'car'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setVehicleType(t);
                            // Auto populate sensible default capacities
                            if (t === 'bike') setVehicleCapacity('1');
                            else if (t === 'auto') setVehicleCapacity('3');
                            else setVehicleCapacity('4');
                          }}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize flex items-center justify-center space-x-1.5 transition-all ${
                            vehicleType === t
                              ? 'border-brand-yellow text-brand-yellow bg-brand-yellow/5'
                              : 'border-slate-800 text-slate-500 hover:text-white'
                          }`}
                        >
                          <span>{t}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Model */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Vehicle Model (Name)</label>
                    <input
                      type="text"
                      required
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="e.g. Suzuki Access 125, Honda City"
                      className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow text-sm font-semibold"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Number plate */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">License Plate Number</label>
                      <input
                        type="text"
                        required
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        placeholder="e.g. TN 07 BY 1234"
                        className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow text-sm font-semibold uppercase"
                      />
                    </div>
                    {/* Seating Capacity */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Seating Capacity</label>
                      <select
                        value={vehicleCapacity}
                        onChange={(e) => setVehicleCapacity(e.target.value)}
                        className="block w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-brand-yellow text-sm font-semibold"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map(num => (
                          <option key={num} value={num.toString()}>
                            {num} Seat{num > 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={vehicleLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-brand-dark bg-brand-yellow hover:bg-yellow-400 focus:outline-none transition-all disabled:opacity-50 items-center space-x-2 shadow-lg shadow-yellow-500/5"
                  >
                    {vehicleLoading ? (
                      <span>Saving Vehicle Details...</span>
                    ) : (
                      <span>{vehicle ? 'Update Vehicle' : 'Register Vehicle'}</span>
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-3">Vehicle Details for Drivers</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Vehicle registration is only available for driver accounts. Once your account is set to driver, you can add your vehicle details here to publish rides.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
