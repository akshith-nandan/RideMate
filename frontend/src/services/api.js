const API_URL = 'http://localhost:5000/api';

// Create helper to get headers with token
const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// Create headers for file uploads
const getFileUploadHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const api = {
  // Authentication - Email
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return await res.json();
  },

  signup: async (name, email, phone, password, role) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, role })
    });
    return await res.json();
  },

  logout: async (refreshToken) => {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ refreshToken })
    });
    return await res.json();
  },

  // Token Management
  refreshToken: async (refreshToken) => {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    return await res.json();
  },

  // OTP Authentication
  sendOTP: async (phone) => {
    const res = await fetch(`${API_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    return await res.json();
  },

  verifyOTP: async (phone, otp, name, role) => {
    const res = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, name, role })
    });
    return await res.json();
  },

  // Google OAuth
  googleAuth: async (token) => {
    const res = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    return await res.json();
  },

  // Verification
  getVerificationStatus: async () => {
    const res = await fetch(`${API_URL}/verification/status`, {
      method: 'GET',
      headers: getHeaders()
    });
    return await res.json();
  },

  uploadProfilePhoto: async (photo) => {
    const formData = new FormData();
    formData.append('photo', photo);
    const res = await fetch(`${API_URL}/verification/profile-photo`, {
      method: 'POST',
      headers: getFileUploadHeaders(),
      body: formData
    });
    return await res.json();
  },

  uploadAadhaar: async (number, document) => {
    const formData = new FormData();
    formData.append('number', number);
    formData.append('document', document);
    const res = await fetch(`${API_URL}/verification/aadhaar`, {
      method: 'POST',
      headers: getFileUploadHeaders(),
      body: formData
    });
    return await res.json();
  },

  uploadDrivingLicense: async (number, expiryDate, document) => {
    const formData = new FormData();
    formData.append('number', number);
    formData.append('expiryDate', expiryDate);
    formData.append('document', document);
    const res = await fetch(`${API_URL}/verification/driving-license`, {
      method: 'POST',
      headers: getFileUploadHeaders(),
      body: formData
    });
    return await res.json();
  },

  uploadVehicleRegistration: async (number, document) => {
    const formData = new FormData();
    formData.append('number', number);
    formData.append('document', document);
    const res = await fetch(`${API_URL}/verification/vehicle-registration`, {
      method: 'POST',
      headers: getFileUploadHeaders(),
      body: formData
    });
    return await res.json();
  },

  // Rides
  createRide: async (rideData) => {
    const res = await fetch(`${API_URL}/ride/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(rideData)
    });
    return await res.json();
  },

  searchRides: async (pickup, destination) => {
    const query = new URLSearchParams();
    if (pickup) query.append('pickup', pickup);
    if (destination) query.append('destination', destination);
    
    const res = await fetch(`${API_URL}/rides?${query.toString()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return await res.json();
  },

  getRideDetails: async (id) => {
    const res = await fetch(`${API_URL}/ride/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return await res.json();
  },

  // Bookings
  requestBooking: async (rideId, pickup, dropoff, seatsRequested = 1) => {
    const res = await fetch(`${API_URL}/booking/request`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rideId, pickup, dropoff, seatsRequested })
    });
    return await res.json();
  },

  acceptBooking: async (bookingId) => {
    const res = await fetch(`${API_URL}/booking/accept`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ bookingId })
    });
    return await res.json();
  },

  rejectBooking: async (bookingId) => {
    const res = await fetch(`${API_URL}/booking/reject`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ bookingId })
    });
    return await res.json();
  },

  getPassengerBookings: async () => {
    const res = await fetch(`${API_URL}/booking/passenger`, {
      method: 'GET',
      headers: getHeaders()
    });
    return await res.json();
  },

  getDriverBookings: async () => {
    const res = await fetch(`${API_URL}/booking/driver`, {
      method: 'GET',
      headers: getHeaders()
    });
    return await res.json();
  },

  // User & Vehicle
  getProfile: async () => {
    const res = await fetch(`${API_URL}/user/profile`, {
      method: 'GET',
      headers: getHeaders()
    });
    return await res.json();
  },

  updateProfile: async (profileData) => {
    const res = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    });
    return await res.json();
  },

  registerVehicle: async (vehicleData) => {
    const res = await fetch(`${API_URL}/user/vehicle`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(vehicleData)
    });
    return await res.json();
  }
};

export default api;