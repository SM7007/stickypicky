import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    if (!email || !password) {
      toast.error('Please enter all fields');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      toast.success(`Welcome back, ${loggedUser.name}!`);
      
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    } catch (err) {
      console.error('Login error', err);
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) return;
    setLoading(true);
    try {
      const loggedUser = await googleLogin(credentialResponse.credential);
      toast.success(`Signed in with Google! Welcome, ${loggedUser.name}`);
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    } catch (err) {
      console.error('Google login error', err);
      toast.error(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="bg-surface border border-border rounded-lg p-8 space-y-6 shadow-sm">
          <div className="text-center">
            <h1 className="text-2xl font-bold font-display text-primary uppercase tracking-wider">Welcome Back</h1>
            <p className="text-xs text-secondary mt-1">Enter your details to log in to your account</p>
          </div>

          {/* Google Sign-In */}
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Sign-In failed')}
              useOneTap
              theme="filled_black"
              shape="pill"
              size="large"
              width="100%"
            />
          </div>

          <div className="flex items-center gap-3">
            <hr className="flex-1 border-border" />
            <span className="text-[10px] text-secondary uppercase tracking-wider">or sign in with email</span>
            <hr className="flex-1 border-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  Forgot Password?
                </Link>
              </div>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-background font-bold uppercase tracking-wider text-xs py-4 rounded hover:opacity-90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>


          <hr className="border-border" />

          <p className="text-center text-xs text-secondary">
            Don't have an account?{' '}
            <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-primary font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;
