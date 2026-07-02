import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Upload, CheckCircle, AlertCircle, Clock, FileText, Camera, Car, Award } from 'lucide-react';

const VerificationPage = () => {
  const { user } = useAuth();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Document state
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarDoc, setAadhaarDoc] = useState(null);
  const [dlNumber, setDlNumber] = useState('');
  const [dlExpiry, setDlExpiry] = useState('');
  const [dlDoc, setDlDoc] = useState(null);
  const [vrNumber, setVrNumber] = useState('');
  const [vrDoc, setVrDoc] = useState(null);

  useEffect(() => {
    fetchVerification();
  }, []);

  const fetchVerification = async () => {
    try {
      const data = await api.getVerificationStatus();
      if (data.success) {
        setVerification(data.verification);
      }
    } catch (err) {
      console.error('Failed to fetch verification:', err);
    }
  };

  const handleProfilePhotoUpload = async () => {
    if (!profilePhoto) {
      setError('Please select a photo');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await api.uploadProfilePhoto(profilePhoto);
      if (result.success) {
        setVerification(result.verification);
        setProfilePhoto(null);
        setSuccess('Profile photo uploaded successfully!');
      } else {
        setError(result.message || 'Failed to upload photo');
      }
    } catch (err) {
      setError('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  const handleAadhaarUpload = async () => {
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }
    if (!aadhaarDoc) {
      setError('Please select a document');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await api.uploadAadhaar(aadhaarNumber, aadhaarDoc);
      if (result.success) {
        setVerification(result.verification);
        setAadhaarNumber('');
        setAadhaarDoc(null);
        setSuccess('Aadhaar document uploaded successfully!');
      } else {
        setError(result.message || 'Failed to upload Aadhaar');
      }
    } catch (err) {
      setError('Failed to upload Aadhaar');
    } finally {
      setLoading(false);
    }
  };

  const handleDrivingLicenseUpload = async () => {
    if (!dlNumber) {
      setError('Please enter driving license number');
      return;
    }
    if (!dlExpiry) {
      setError('Please enter expiry date');
      return;
    }
    if (!dlDoc) {
      setError('Please select a document');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await api.uploadDrivingLicense(dlNumber, dlExpiry, dlDoc);
      if (result.success) {
        setVerification(result.verification);
        setDlNumber('');
        setDlExpiry('');
        setDlDoc(null);
        setSuccess('Driving license uploaded successfully!');
      } else {
        setError(result.message || 'Failed to upload driving license');
      }
    } catch (err) {
      setError('Failed to upload driving license');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleRegistrationUpload = async () => {
    if (!vrNumber) {
      setError('Please enter vehicle registration number');
      return;
    }
    if (!vrDoc) {
      setError('Please select a document');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await api.uploadVehicleRegistration(vrNumber, vrDoc);
      if (result.success) {
        setVerification(result.verification);
        setVrNumber('');
        setVrDoc(null);
        setSuccess('Vehicle registration uploaded successfully!');
      } else {
        setError(result.message || 'Failed to upload vehicle registration');
      }
    } catch (err) {
      setError('Failed to upload vehicle registration');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-rose-400" />;
      default:
        return <Clock className="h-5 w-5 text-amber-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'rejected':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      default:
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    }
  };

  if (!verification) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="h-12 w-12 border-4 border-brand-yellow border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Identity Verification</h1>
        <p className="text-slate-400">Complete your profile verification to unlock all features</p>
      </div>

      {/* Overall Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Verification Status</h2>
            <p className="text-slate-400 text-sm">
              {verification.isVerified
                ? 'Your account is fully verified ✓'
                : `Overall status: ${verification.overallStatus}`}
            </p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(verification.overallStatus)}`}>
              {getStatusIcon(verification.overallStatus)}
              <span className="font-semibold capitalize">{verification.overallStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Profile Photo */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Camera className="h-6 w-6 text-brand-yellow" />
            <h3 className="text-lg font-bold text-white">Profile Photo</h3>
          </div>

          {verification.profilePhoto?.status && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-4 ${getStatusColor(verification.profilePhoto.status)}`}>
              {getStatusIcon(verification.profilePhoto.status)}
              <span className="text-sm font-semibold capitalize">{verification.profilePhoto.status}</span>
            </div>
          )}

          <div className="space-y-3">
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => setProfilePhoto(e.target.files[0])}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-yellow file:text-brand-dark hover:file:bg-yellow-400"
            />
            <button
              onClick={handleProfilePhotoUpload}
              disabled={loading || !profilePhoto}
              className="w-full py-2 px-4 bg-brand-yellow hover:bg-yellow-400 text-brand-dark font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {loading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>
        </div>

        {/* Aadhaar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-6 w-6 text-brand-yellow" />
            <h3 className="text-lg font-bold text-white">Aadhaar</h3>
          </div>

          {verification.aadhaar?.status && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-4 ${getStatusColor(verification.aadhaar.status)}`}>
              {getStatusIcon(verification.aadhaar.status)}
              <span className="text-sm font-semibold capitalize">{verification.aadhaar.status}</span>
            </div>
          )}

          <div className="space-y-3">
            <input
              type="text"
              placeholder="12-digit Aadhaar number"
              value={aadhaarNumber}
              onChange={(e) => setAadhaarNumber(e.target.value)}
              maxLength="12"
              className="block w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow"
            />
            <input
              type="file"
              accept=".pdf,image/jpeg,image/png"
              onChange={(e) => setAadhaarDoc(e.target.files[0])}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-yellow file:text-brand-dark hover:file:bg-yellow-400"
            />
            <button
              onClick={handleAadhaarUpload}
              disabled={loading || !aadhaarNumber || !aadhaarDoc}
              className="w-full py-2 px-4 bg-brand-yellow hover:bg-yellow-400 text-brand-dark font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {loading ? 'Uploading...' : 'Upload Aadhaar'}
            </button>
          </div>
        </div>

        {/* Driving License */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="h-6 w-6 text-brand-yellow" />
            <h3 className="text-lg font-bold text-white">Driving License</h3>
          </div>

          {verification.drivingLicense?.status && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-4 ${getStatusColor(verification.drivingLicense.status)}`}>
              {getStatusIcon(verification.drivingLicense.status)}
              <span className="text-sm font-semibold capitalize">{verification.drivingLicense.status}</span>
            </div>
          )}

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Driving License Number"
              value={dlNumber}
              onChange={(e) => setDlNumber(e.target.value)}
              className="block w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow"
            />
            <input
              type="date"
              value={dlExpiry}
              onChange={(e) => setDlExpiry(e.target.value)}
              className="block w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-yellow"
            />
            <input
              type="file"
              accept=".pdf,image/jpeg,image/png"
              onChange={(e) => setDlDoc(e.target.files[0])}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-yellow file:text-brand-dark hover:file:bg-yellow-400"
            />
            <button
              onClick={handleDrivingLicenseUpload}
              disabled={loading || !dlNumber || !dlExpiry || !dlDoc}
              className="w-full py-2 px-4 bg-brand-yellow hover:bg-yellow-400 text-brand-dark font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {loading ? 'Uploading...' : 'Upload License'}
            </button>
          </div>
        </div>

        {/* Vehicle Registration */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Car className="h-6 w-6 text-brand-yellow" />
            <h3 className="text-lg font-bold text-white">Vehicle Registration</h3>
          </div>

          {verification.vehicleRegistration?.status && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-4 ${getStatusColor(verification.vehicleRegistration.status)}`}>
              {getStatusIcon(verification.vehicleRegistration.status)}
              <span className="text-sm font-semibold capitalize">{verification.vehicleRegistration.status}</span>
            </div>
          )}

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Vehicle Registration Number"
              value={vrNumber}
              onChange={(e) => setVrNumber(e.target.value.toUpperCase())}
              className="block w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow"
            />
            <input
              type="file"
              accept=".pdf,image/jpeg,image/png"
              onChange={(e) => setVrDoc(e.target.files[0])}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-yellow file:text-brand-dark hover:file:bg-yellow-400"
            />
            <button
              onClick={handleVehicleRegistrationUpload}
              disabled={loading || !vrNumber || !vrDoc}
              className="w-full py-2 px-4 bg-brand-yellow hover:bg-yellow-400 text-brand-dark font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {loading ? 'Uploading...' : 'Upload Registration'}
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-brand-indigo/5 border border-brand-indigo/15 rounded-2xl p-6 mt-8">
        <h3 className="text-lg font-bold text-white mb-3">Why Verification?</h3>
        <ul className="text-slate-300 text-sm space-y-2">
          <li className="flex gap-2">
            <span className="text-brand-yellow">•</span>
            <span>Ensures trust and safety in our community</span>
          </li>
          <li className="flex gap-2">
            <span className="text-brand-yellow">•</span>
            <span>Protects against fraud and unauthorized access</span>
          </li>
          <li className="flex gap-2">
            <span className="text-brand-yellow">•</span>
            <span>Required for drivers to list rides</span>
          </li>
          <li className="flex gap-2">
            <span className="text-brand-yellow">•</span>
            <span>Verification typically takes 24-48 hours</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default VerificationPage;
