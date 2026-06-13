import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigation, Shield, HeartHandshake, Compass, Users, CheckCircle, ArrowRight } from 'lucide-react';
const LandingPage = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-brand-yellow/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-brand-indigo/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Tagline */}
          <div className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full mb-6">
            <span className="h-2 w-2 rounded-full bg-brand-yellow animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Ride-Sharing for Daily Commuters</span>
          </div>
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
            Share Empty Seats.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-yellow-400">
              Split Travel Costs.
            </span>
          </h1>
          {/* Subtext */}
          <p className="max-w-2xl mx-auto text-lg text-slate-400 font-medium leading-relaxed mb-10">
            RideMate connects everyday bike, auto, and car owners with passengers traveling in the same direction. No commercial drivers, just ordinary citizens co-traveling to split costs and ease congestion.
          </p>
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {user ? (
              <Link
                to={user.role === 'driver' ? '/driver-dashboard' : '/passenger-dashboard'}
                className="w-full sm:w-auto bg-brand-yellow hover:bg-yellow-400 text-brand-dark px-8 py-4 rounded-xl text-base font-extrabold shadow-lg shadow-yellow-500/10 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                <span>Go to Dashboard</span>
                <Navigation className="h-4 w-4 fill-current transform rotate-45" />
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="w-full sm:w-auto bg-brand-yellow hover:bg-yellow-400 text-brand-dark px-8 py-4 rounded-xl text-base font-extrabold shadow-lg shadow-yellow-500/10 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Get Started for Free
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 px-8 py-4 rounded-xl text-base font-bold transition-all duration-300"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
      {/* Feature Grid Section */}
      <section className="py-16 bg-slate-950/40 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white">Why Choose RideMate?</h2>
            <p className="mt-4 text-slate-400 font-medium">Smart route overlaps, secure peer rides, and maximum cost-splitting efficiency.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-2xl">
              <div className="bg-brand-yellow/10 text-brand-yellow p-3.5 rounded-xl inline-block mb-6">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Route Matching</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our custom algorithm calculates precise overlap percentages. Discover routes going your way without modifying your schedule.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-2xl">
              <div className="bg-brand-indigo/10 text-brand-indigo p-3.5 rounded-xl inline-block mb-6">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Cost-Split Sharing</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Split fuel expenses easily. Drivers aren't operating for commercial profit, making rides up to 50% cheaper than traditional cabs.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-2xl">
              <div className="bg-brand-teal/10 text-brand-teal p-3.5 rounded-xl inline-block mb-6">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Trusted Community</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                All drivers and passengers are verified via phones and emails, complete with mutual rating reviews to ensure safe daily travels.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* How it Works / Steps Section */}
      <section className="py-20 bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-extrabold text-white mb-6">
                Simple Overlap,<br/>
                Instant Rides.
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-yellow text-slate-900 font-bold p-2.5 rounded-lg shrink-0 mt-1">1</div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Driver Lists Schedule</h4>
                    <p className="text-slate-400 text-sm mt-1">A vehicle owner posts their planned travel route and available seats.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-yellow text-slate-900 font-bold p-2.5 rounded-lg shrink-0 mt-1">2</div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Passenger Searches Destination</h4>
                    <p className="text-slate-400 text-sm mt-1">Passenger inputs their pickup and dropoff. The algorithm compares detours and lists matches.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-yellow text-slate-900 font-bold p-2.5 rounded-lg shrink-0 mt-1">3</div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Instant Request & Handshake</h4>
                    <p className="text-slate-400 text-sm mt-1">Passenger requests a booking. The driver reviews overlapping paths and accepts the commute.</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Visual Route Overlap Board */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Route Matching Example</h4>
              
              <div className="space-y-4">
                {/* Driver */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-brand-indigo uppercase">Driver Route</span>
                    <span className="text-xs text-slate-400 font-semibold">Capacity: 3 seats</span>
                  </div>
                  <div className="flex items-center text-sm font-bold text-white space-x-2">
                    <span>Tambaram</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-brand-indigo">Guindy</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                    <span>T Nagar</span>
                  </div>
                </div>
                {/* Passenger */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase">Passenger Request</span>
                    <div className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/20">
                      85% Match
                    </div>
                  </div>
                  <div className="flex items-center text-sm font-bold text-white space-x-2">
                    <span className="text-emerald-400">Chromepet</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-emerald-400">Guindy</span>
                  </div>
                </div>
              </div>
              {/* Alert box */}
              <div className="mt-6 bg-brand-yellow/5 border border-brand-yellow/20 rounded-xl p-4 flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-brand-yellow shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Overlap Detected!</strong> The passenger's pickup (Chromepet) and dropoff (Guindy) are perfectly aligned on the driver's Tambaram $\rightarrow$ T Nagar commute, minimizing detours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 text-center text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} RideMate Commuting Platform. Built for eco-friendly rides and shared travels.</p>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
