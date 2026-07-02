# RideMate Authentication & Verification System

## Complete Feature Implementation

This document outlines all authentication and profile verification features implemented in the RideMate application.

---

## 1. AUTHENTICATION FEATURES

### 1.1 Email Authentication (Email & Password)

**Endpoints:**
- `POST /api/auth/signup` - Register new user with email
- `POST /api/auth/login` - Login with email and password

**Request/Response Example:**

```javascript
// Signup
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "SecurePass123",
  "role": "driver" // or "passenger"
}

Response:
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "driver",
    "rating": null,
    "profilePic": "url",
    "authMethods": ["email"]
  }
}

// Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response: (Same as signup)
```

**Frontend Usage:**
```javascript
import { useAuth } from '../context/AuthContext';

const AuthForm = () => {
  const { login, signup, authError } = useAuth();
  
  // For signup
  const handleSignup = async () => {
    const result = await signup('John', 'john@example.com', '9876543210', 'pass123', 'driver');
    if (result.success) {
      // Navigate to dashboard
    }
  };
  
  // For login
  const handleLogin = async () => {
    const result = await login('john@example.com', 'pass123');
    if (result.success) {
      // Navigate to dashboard
    }
  };
};
```

---

### 1.2 Mobile OTP Authentication

**Flow:**
1. User enters phone number
2. OTP sent to phone (via Twilio in production)
3. User enters OTP
4. Auto-creates account if new user

**Endpoints:**
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and login/register

**Request/Response Example:**

```javascript
// Step 1: Send OTP
POST /api/auth/send-otp
{
  "phone": "9876543210"
}

Response:
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456" // Only in development
}

// Step 2: Verify OTP
POST /api/auth/verify-otp
{
  "phone": "9876543210",
  "otp": "123456",
  "name": "John Doe", // For new users
  "role": "driver" // For new users
}

Response:
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}
```

**Frontend Usage:**
```javascript
const OTPLogin = () => {
  const { sendOTP, verifyOTP } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOTP] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  
  const handleSendOTP = async () => {
    const result = await sendOTP(phone);
    if (result.success) {
      setStep('otp');
    }
  };
  
  const handleVerifyOTP = async () => {
    const result = await verifyOTP(phone, otp, 'John', 'driver');
    if (result.success) {
      // Navigate to dashboard
    }
  };
  
  return (
    <>
      {step === 'phone' ? (
        <>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button onClick={handleSendOTP}>Send OTP</button>
        </>
      ) : (
        <>
          <input value={otp} onChange={(e) => setOTP(e.target.value)} />
          <button onClick={handleVerifyOTP}>Verify OTP</button>
        </>
      )}
    </>
  );
};
```

---

### 1.3 Google OAuth

**Setup:**
1. Create Google OAuth credentials at Google Cloud Console
2. Add redirect URI: `http://localhost:3000/auth/google-callback`

**Endpoints:**
- `POST /api/auth/google` - Authenticate with Google token

**Request/Response Example:**

```javascript
// After getting token from Google Sign-In
POST /api/auth/google
{
  "token": "google_access_token"
}

Response:
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}
```

**Frontend Usage:**
```javascript
import { GoogleLogin } from '@react-oauth/google';

const GoogleAuthButton = () => {
  const { googleLogin } = useAuth();
  
  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await googleLogin(credentialResponse.credential);
    if (result.success) {
      // Navigate to dashboard
    }
  };
  
  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => console.log('Login Failed')}
    />
  );
};
```

---

### 1.4 Token Management

**Access Token:**
- Expires in 15 minutes
- Used for API requests

**Refresh Token:**
- Expires in 30 days
- Used to get new access token
- Stored in database

**Auto-Refresh Implementation:**

```javascript
// In AuthContext - Set up auto-refresh
useEffect(() => {
  const interval = setInterval(async () => {
    // Refresh token 5 minutes before expiry
    const result = await refreshUserToken();
    if (!result) {
      // Token refresh failed, logout user
      logout();
    }
  }, 10 * 60 * 1000); // Check every 10 minutes
  
  return () => clearInterval(interval);
}, [refreshToken]);
```

**Endpoints:**
- `POST /api/auth/refresh` - Get new access token

```javascript
POST /api/auth/refresh
{
  "refreshToken": "eyJhbGc..."
}

Response:
{
  "success": true,
  "accessToken": "new_token",
  "user": { ... }
}
```

**Frontend Usage:**
```javascript
const { accessToken, refreshUserToken } = useAuth();

// In API interceptor
const makeRequest = async (url, options) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (response.status === 401) {
      // Token expired, try refresh
      const refreshed = await refreshUserToken();
      if (refreshed) {
        // Retry request with new token
        return makeRequest(url, options);
      }
    }
    
    return response;
  } catch (error) {
    // Handle error
  }
};
```

**Logout:**
- `POST /api/auth/logout` - Revoke refresh token

```javascript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  // Navigate to login
};
```

---

## 2. PROFILE VERIFICATION SYSTEM

### 2.1 Verification Documents

Users must upload 4 documents with different statuses:

1. **Profile Photo**
   - Format: JPEG, PNG
   - Max size: 5MB
   - Status: Pending → Approved/Rejected

2. **Aadhaar (India National ID)**
   - 12-digit number
   - Format: PDF, JPEG, PNG
   - Max size: 10MB

3. **Driving License**
   - License number
   - Expiry date
   - Format: PDF, JPEG, PNG
   - Max size: 10MB

4. **Vehicle Registration**
   - Registration number
   - Format: PDF, JPEG, PNG
   - Max size: 10MB

---

### 2.2 Verification Status Codes

```javascript
{
  profilePhoto: {
    url: "string",
    status: "pending" | "approved" | "rejected",
    rejectionReason: "string (if rejected)",
    uploadedAt: "date"
  },
  aadhaar: {
    number: "string",
    url: "string",
    status: "pending" | "approved" | "rejected",
    rejectionReason: "string",
    uploadedAt: "date"
  },
  drivingLicense: {
    number: "string",
    url: "string",
    expiryDate: "date",
    status: "pending" | "approved" | "rejected",
    rejectionReason: "string",
    uploadedAt: "date"
  },
  vehicleRegistration: {
    number: "string",
    url: "string",
    status: "pending" | "approved" | "rejected",
    rejectionReason: "string",
    uploadedAt: "date"
  },
  overallStatus: "incomplete" | "pending" | "approved" | "rejected",
  isVerified: boolean,
  verifiedAt: "date (if approved)"
}
```

---

### 2.3 Verification Upload Endpoints

**Get Verification Status:**
```javascript
GET /api/verification/status
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "verification": { ... }
}
```

**Upload Profile Photo:**
```javascript
POST /api/verification/profile-photo
Content-Type: multipart/form-data
Authorization: Bearer {accessToken}

Body:
{
  "photo": <File>
}

Response:
{
  "success": true,
  "message": "Profile photo uploaded successfully",
  "verification": { ... }
}
```

**Upload Aadhaar:**
```javascript
POST /api/verification/aadhaar
Content-Type: multipart/form-data
Authorization: Bearer {accessToken}

Body:
{
  "number": "123456789012",
  "document": <File>
}
```

**Upload Driving License:**
```javascript
POST /api/verification/driving-license
Content-Type: multipart/form-data
Authorization: Bearer {accessToken}

Body:
{
  "number": "DL-2023-001",
  "expiryDate": "2026-12-31",
  "document": <File>
}
```

**Upload Vehicle Registration:**
```javascript
POST /api/verification/vehicle-registration
Content-Type: multipart/form-data
Authorization: Bearer {accessToken}

Body:
{
  "number": "TN-07-BW-1234",
  "document": <File>
}
```

---

### 2.4 Frontend Verification Component Usage

```javascript
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const VerificationUpload = () => {
  const { user } = useAuth();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchVerification();
  }, []);
  
  const fetchVerification = async () => {
    const data = await api.getVerificationStatus();
    if (data.success) {
      setVerification(data.verification);
    }
  };
  
  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    const result = await api.uploadProfilePhoto(file);
    
    if (result.success) {
      setVerification(result.verification);
      // Show success message
    } else {
      // Show error message
    }
    setLoading(false);
  };
  
  const handleAadhaarUpload = async (e, number) => {
    const file = e.target.files[0];
    if (!file || !number) return;
    
    setLoading(true);
    const result = await api.uploadAadhaar(number, file);
    
    if (result.success) {
      setVerification(result.verification);
    }
    setLoading(false);
  };
  
  return (
    <div>
      <h2>Profile Verification</h2>
      
      {/* Profile Photo */}
      <section>
        <h3>Profile Photo</h3>
        <input 
          type="file" 
          accept="image/jpeg,image/png" 
          onChange={handleProfilePhotoUpload}
          disabled={loading}
        />
        <p>Status: {verification?.profilePhoto?.status}</p>
      </section>
      
      {/* Aadhaar */}
      <section>
        <h3>Aadhaar</h3>
        <input 
          type="text" 
          placeholder="12-digit Aadhaar number"
          id="aadhaarNumber"
        />
        <input 
          type="file" 
          accept=".pdf,image/jpeg,image/png" 
          onChange={(e) => handleAadhaarUpload(
            e, 
            document.getElementById('aadhaarNumber').value
          )}
          disabled={loading}
        />
        <p>Status: {verification?.aadhaar?.status}</p>
      </section>
      
      {/* Driving License */}
      <section>
        <h3>Driving License</h3>
        <input type="text" placeholder="License Number" id="dlNumber" />
        <input type="date" id="dlExpiry" />
        <input 
          type="file" 
          accept=".pdf,image/jpeg,image/png"
          onChange={(e) => {
            const file = e.target.files[0];
            const number = document.getElementById('dlNumber').value;
            const expiry = document.getElementById('dlExpiry').value;
            api.uploadDrivingLicense(number, expiry, file);
          }}
          disabled={loading}
        />
        <p>Status: {verification?.drivingLicense?.status}</p>
      </section>
      
      {/* Vehicle Registration */}
      <section>
        <h3>Vehicle Registration</h3>
        <input type="text" placeholder="Registration Number" id="vrNumber" />
        <input 
          type="file" 
          accept=".pdf,image/jpeg,image/png"
          onChange={(e) => {
            const file = e.target.files[0];
            const number = document.getElementById('vrNumber').value;
            api.uploadVehicleRegistration(number, file);
          }}
          disabled={loading}
        />
        <p>Status: {verification?.vehicleRegistration?.status}</p>
      </section>
      
      {/* Overall Status */}
      <div className="overall-status">
        <h4>Overall Verification Status: {verification?.overallStatus}</h4>
        {verification?.isVerified && (
          <p>✓ Verified on {new Date(verification.verifiedAt).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  );
};

export default VerificationUpload;
```

---

## 3. ENVIRONMENT VARIABLES

Add these to your `.env` file in backend:

```
# JWT Secrets
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here

# Google OAuth (Optional for development)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Twilio (For OTP - Optional in development)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# Node Environment
NODE_ENV=development # or production
```

---

## 4. FRONTEND ENVIRONMENT VARIABLES

Add to `.env` in frontend:

```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 5. DATABASE SCHEMAS

### User Schema Updates
```javascript
{
  googleId: String,
  googleEmail: String,
  phoneVerified: Boolean,
  authMethods: ['email' | 'phone' | 'google'],
  isActive: Boolean
}
```

### New Collections

**Verification Collection:**
- Stores all verification documents and status
- One per user
- References User by _id

**OTP Collection:**
- Auto-deletes after 10 minutes
- Prevents brute force with attempt tracking

**RefreshToken Collection:**
- Auto-deletes after 30 days
- Can be revoked (marked as isRevoked)
- References User by _id

---

## 6. SECURITY BEST PRACTICES

1. **Password Hashing:** All passwords hashed with bcrypt (10 salt rounds)
2. **Token Security:**
   - Access tokens: 15-minute expiry
   - Refresh tokens: 30-day expiry
   - Tokens stored in localStorage (frontend) and database (backend)
3. **File Upload Security:**
   - File type validation
   - File size limits (5-10 MB)
   - Files stored in `/uploads` directory
4. **Rate Limiting:** Implement rate limiting on auth endpoints
5. **HTTPS:** Use HTTPS in production
6. **CORS:** Configure appropriate CORS origins

---

## 7. TESTING AUTHENTICATION

### Using REST Client / Postman

**Email Login:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPass123"
}
```

**OTP (Development Only):**
```
POST http://localhost:5000/api/auth/send-otp
Content-Type: application/json

{
  "phone": "9876543210"
}

# Response will show OTP in development mode
# Then verify with:

POST http://localhost:5000/api/auth/verify-otp
Content-Type: application/json

{
  "phone": "9876543210",
  "otp": "123456",
  "name": "Test User",
  "role": "driver"
}
```

**Refresh Token:**
```
POST http://localhost:5000/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token_here"
}
```

---

## 8. NEXT STEPS

1. **Admin Panel:** Create admin verification approval interface
2. **Email Notifications:** Send verification status updates via email
3. **SMS Integration:** Integrate Twilio for OTP in production
4. **Document OCR:** Add OCR for automatic Aadhaar/License extraction
5. **Facial Recognition:** Optional biometric verification
6. **Two-Factor Authentication:** Add 2FA for security
7. **Session Management:** Implement session timeout

---

## 9. MIGRATION GUIDE (For existing users)

If migrating from old token system:

```javascript
// Old system uses "token" in localStorage
// New system uses "accessToken" and "refreshToken"

// Migration step:
const oldToken = localStorage.getItem('token');
if (oldToken) {
  // User needs to login again with new auth system
  localStorage.removeItem('token');
  // Redirect to login
}
```

---

This completes the comprehensive authentication and verification system for RideMate!
