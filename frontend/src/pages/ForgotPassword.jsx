import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { KeyRound, Mail, ShieldCheck, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Step 1 = Enter Email, Step 2 = Enter OTP + New Password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 1: Request OTP code
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success(res.data?.message || 'Verification code sent to your email!');
      setStep(2);
    } catch (err) {
      console.error('Request OTP error', err);
      toast.error(err.response?.data?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email,
        otp: otp.trim(),
        newPassword,
      });
      toast.success(res.data?.message || 'Password reset successful!');
      navigate('/login');
    } catch (err) {
      console.error('Reset password error', err);
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="bg-surface border border-border rounded-lg p-8 space-y-6 shadow-sm">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-1">
              {step === 1 ? <Mail size={24} /> : <KeyRound size={24} />}
            </div>
            <h1 className="text-2xl font-bold font-display text-primary uppercase tracking-wider">
              {step === 1 ? 'Forgot Password?' : 'Reset Password'}
            </h1>
            <p className="text-xs text-secondary">
              {step === 1
                ? 'Enter your registered email address to receive a 6-digit verification code'
                : `Enter the verification code sent to ${email}`}
            </p>
          </div>

          {step === 1 ? (
            /* STEP 1: Enter Email */
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-background text-primary border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-background font-bold uppercase tracking-wider text-xs py-4 rounded hover:opacity-90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Sending Verification Code...' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            /* STEP 2: Enter OTP & New Password */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                  6-Digit Verification Code (OTP)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full bg-background text-primary border border-border rounded px-4 py-3 text-center text-lg font-mono tracking-widest focus:outline-none focus:border-primary"
                  placeholder="123456"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full bg-background text-primary border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-primary pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary cursor-pointer p-1"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-background text-primary border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-primary pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary cursor-pointer p-1"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-background font-bold uppercase tracking-wider text-xs py-4 rounded hover:opacity-90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-secondary hover:text-primary flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft size={14} /> Change email / Resend code
                </button>
              </div>
            </form>
          )}

          <hr className="border-border" />

          <p className="text-center text-xs text-secondary">
            Remember your password?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default ForgotPassword;
