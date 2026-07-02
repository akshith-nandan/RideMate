import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User as UserIcon, Navigation, ShieldCheck, MapPin, CheckCircle } from 'lucide-react';
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const isActive = (path) => location.pathname === path;
  return (
    <nav className="bg-brand-dark/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-brand-yellow text-brand-dark p-2 rounded-lg font-extrabold flex items-center justify-center">
                <Navigation className="h-5 w-5 fill-current transform rotate-45" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Ride<span className="text-brand-yellow font-extrabold">Mate</span>
              </span>
            </Link>
          </div>
          {/* Desktop Nav Items */}
          {user ? (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to={user.role === 'driver' ? '/driver-dashboard' : '/passenger-dashboard'}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/driver-dashboard') || isActive('/passenger-dashboard')
                    ? 'text-brand-yellow bg-slate-800'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Dashboard
              </Link>
              
              <Link
                to="/search"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/search')
                    ? 'text-brand-yellow bg-slate-800'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Search Rides
              </Link>
              {user.role === 'driver' && (
                <Link
                  to="/create-ride"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/create-ride')
                      ? 'text-brand-yellow bg-slate-800'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Create Ride
                </Link>
              )}
              <Link
                to="/profile"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  isActive('/profile')
                    ? 'text-brand-yellow bg-slate-800'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <UserIcon className="h-4 w-4" />
                <span>Profile</span>
              </Link>
              <Link
                to="/verification"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  isActive('/verification')
                    ? 'text-brand-yellow bg-slate-800'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                <span>Verify</span>
              </Link>
              <div className="h-6 w-px bg-slate-800 mx-2"></div>
              {/* User Identity info */}
              <div className="flex items-center space-x-3">
                <img
                  src={user.profilePic}
                  alt={user.name}
                  className="h-8 w-8 rounded-full border border-slate-700 object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white leading-tight">{user.name}</span>
                  <span className="text-xs text-brand-yellow font-medium uppercase tracking-wide leading-none mt-0.5">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-all ml-2"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium">
                Log In
              </Link>
              <Link
                to="/signup"
                className="bg-brand-yellow text-brand-dark hover:bg-yellow-400 px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:shadow-yellow-500/10 transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          )}
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-brand-dark/95 border-b border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                <Link
                  to={user.role === 'driver' ? '/driver-dashboard' : '/passenger-dashboard'}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Dashboard
                </Link>
                <Link
                  to="/search"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Search Rides
                </Link>
                {user.role === 'driver' && (
                  <Link
                    to="/create-ride"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    Create Ride
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Profile
                </Link>
                <Link
                  to="/verification"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Verification
                </Link>
                <div className="border-t border-slate-800 my-2 pt-2 px-3 flex items-center space-x-3">
                  <img
                    src={user.profilePic}
                    alt={user.name}
                    className="h-10 w-10 rounded-full border border-slate-700 object-cover"
                  />
                  <div>
                    <div className="text-white font-bold">{user.name}</div>
                    <div className="text-xs text-brand-yellow font-semibold uppercase">{user.role}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium text-red-400 hover:bg-slate-800"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block mx-3 my-2 text-center bg-brand-yellow text-brand-dark font-bold px-4 py-2 rounded-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
export default Navbar;
