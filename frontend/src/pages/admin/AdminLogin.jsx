import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

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
      toast.error('Enter admin login details');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role !== 'ADMIN') {
        toast.error('Access denied. Admin credentials required.');
        return;
      }
      toast.success('Admin authorized successfully!');
      navigate('/admin');
    } catch (err) {
      console.error('Admin login error', err);
      toast.error(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 selection:bg-white selection:text-black">
      <div className="w-full max-w-sm bg-surface border border-border rounded-lg p-8 space-y-6">
        <div className="text-center">
          <span className="text-[10px] font-bold bg-white text-black px-2 py-0.5 rounded uppercase tracking-wider">
            stickypicky Admin
          </span>
          <h1 className="text-xl font-bold font-display text-white mt-4 uppercase tracking-widest">Authorized Access Only</h1>
          <p className="text-[10px] text-secondary mt-1">Please enter your credentials to authenticate</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">Admin Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-background text-white border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-white"
              placeholder="admin@stickypicky.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-background text-white border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-white pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-white cursor-pointer p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold uppercase tracking-wider text-xs py-4 rounded hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In To Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
