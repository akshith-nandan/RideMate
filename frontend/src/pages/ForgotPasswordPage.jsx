import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, KeyRound, Lock, Navigation, Phone } from 'lucide-react';
import api from '../services/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestCode = async (event) => {
    event.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const result = await api.forgotPassword(phone);
      if (!result.success) return setError(result.message || 'Unable to send a verification code');
      setMessage(result.message);
      setStep('reset');
    } catch {
      setError('Unable to connect to the server. Please try again.');
    } finally { setLoading(false); }
  };

  const submitReset = async (event) => {
    event.preventDefault();
    setError(''); setMessage('');
    if (password !== confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    try {
      const result = await api.resetPassword(phone, otp, password);
      if (!result.success) return setError(result.message || 'Unable to reset password');
      setMessage(result.message);
      setStep('done');
    } catch {
      setError('Unable to connect to the server. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-yellow/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex bg-brand-yellow text-brand-dark p-3 rounded-2xl shadow-lg"><Navigation className="h-6 w-6 fill-current rotate-45" /></div>
        <h1 className="mt-6 text-3xl font-extrabold text-white">Reset your password</h1>
        <p className="mt-2 text-sm text-slate-400">We’ll verify your mobile number before updating your password.</p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
          {error && <div className="mb-6 flex gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}
          {message && <div className="mb-6 flex gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400"><CheckCircle2 className="h-5 w-5 shrink-0" />{message}</div>}
          {step === 'phone' && <form className="space-y-6" onSubmit={requestCode}>
            <div><label htmlFor="phone" className="block text-sm font-bold text-slate-300">Registered phone number</label><div className="mt-2 relative"><Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" /><input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile number" className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm font-medium text-slate-200 placeholder-slate-600 focus:border-brand-yellow focus:outline-none focus:ring-1 focus:ring-brand-yellow" /></div></div>
            <button disabled={loading} className="w-full rounded-xl bg-brand-yellow py-3 text-sm font-bold text-brand-dark transition hover:bg-yellow-400 disabled:opacity-50">{loading ? 'Sending code...' : 'Send verification code'}</button>
          </form>}
          {step === 'reset' && <form className="space-y-5" onSubmit={submitReset}>
            <div><label htmlFor="otp" className="block text-sm font-bold text-slate-300">Verification code</label><div className="mt-2 relative"><KeyRound className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" /><input id="otp" required maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm font-medium tracking-widest text-slate-200 placeholder-slate-600 focus:border-brand-yellow focus:outline-none focus:ring-1 focus:ring-brand-yellow" /></div></div>
            <div><label htmlFor="new-password" className="block text-sm font-bold text-slate-300">New password</label><div className="mt-2 relative"><Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" /><input id="new-password" type="password" required minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm font-medium text-slate-200 placeholder-slate-600 focus:border-brand-yellow focus:outline-none focus:ring-1 focus:ring-brand-yellow" /></div></div>
            <div><label htmlFor="confirm-password" className="block text-sm font-bold text-slate-300">Confirm new password</label><input id="confirm-password" type="password" required minLength="6" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-2 block w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-medium text-slate-200 focus:border-brand-yellow focus:outline-none focus:ring-1 focus:ring-brand-yellow" /></div>
            <button disabled={loading} className="w-full rounded-xl bg-brand-yellow py-3 text-sm font-bold text-brand-dark transition hover:bg-yellow-400 disabled:opacity-50">{loading ? 'Resetting password...' : 'Reset password'}</button>
            <button type="button" onClick={() => { setStep('phone'); setOtp(''); }} className="w-full text-sm font-medium text-brand-yellow hover:underline">Use a different number</button>
          </form>}
          {step === 'done' && <button onClick={() => navigate('/login')} className="w-full rounded-xl bg-brand-yellow py-3 text-sm font-bold text-brand-dark hover:bg-yellow-400">Back to sign in</button>}
          {step !== 'done' && <p className="mt-6 text-center text-sm text-slate-400"><Link to="/login" className="font-medium text-brand-yellow hover:underline">Back to sign in</Link></p>}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
