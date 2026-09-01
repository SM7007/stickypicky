import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword } = formData;
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please enter all required fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, phone);
      toast.success('Registration successful! Welcome to the club.');
      navigate(redirect);
    } catch (err) {
      console.error('Registration error', err);
      toast.error(err.response?.data?.message || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) return;
    setLoading(true);
    try {
      const loggedUser = await googleLogin(credentialResponse.credential);
      toast.success(`Signed up with Google! Welcome, ${loggedUser.name}`);
      navigate(redirect);
    } catch (err) {
      console.error('Google sign-up error', err);
      toast.error(err.response?.data?.message || 'Google sign-up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="bg-surface border border-border rounded-lg p-8 space-y-6 shadow-sm">
          <div className="text-center">
            <h1 className="text-2xl font-bold font-display text-primary uppercase tracking-wider">Create Account</h1>
            <p className="text-xs text-secondary mt-1">Join the stickypicky poster collectors club</p>
          </div>

          {/* Google Sign-Up */}
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Sign-Up failed')}
              useOneTap
              theme="filled_black"
              shape="pill"
              size="large"
              width="100%"
              text="signup_with"
            />
          </div>

          <div className="flex items-center gap-3">
            <hr className="flex-1 border-border" />
            <span className="text-[10px] text-secondary uppercase tracking-wider">or sign up with email</span>
            <hr className="flex-1 border-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-background text-primary border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-primary"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-background text-primary border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-primary"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Phone Number (Optional)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-background text-primary border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-primary"
                placeholder="9999999999"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-background text-primary border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-primary pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary cursor-pointer p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full bg-background text-primary border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-primary pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary cursor-pointer p-1"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
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
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <hr className="border-border" />

          <p className="text-center text-xs text-secondary">
            Already have an account?{' '}
            <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-primary font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Register;
