import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, ShoppingBag, FolderHeart, LogOut, ArrowLeft, Plus } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Orders', path: '/admin/orders', icon: FolderHeart },
  ];

  return (
    <div className="flex min-h-screen bg-background text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col hidden md:flex">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
            <img src="/logo.jpg" alt="stickypicky" className="h-8 w-8 rounded-full object-cover border border-border" />
            <span className="text-base font-bold tracking-widest text-white">stickypicky</span>
          </Link>
          <span className="text-[10px] font-bold bg-white text-black px-2 py-0.5 rounded uppercase">
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-black font-semibold'
                    : 'text-secondary hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon size={16} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border flex flex-col gap-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-secondary hover:text-white transition-colors duration-200"
          >
            <ArrowLeft size={14} /> Back to Storefront
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-zinc-900 rounded transition-all duration-200 w-full text-left"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col">
        {/* Mobile Header Bar */}
        <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6 md:hidden">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="stickypicky" className="h-8 w-8 rounded-full object-cover border border-border" />
            <span className="text-sm font-bold tracking-wider text-white">stickypicky Admin</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-xs text-secondary hover:text-white">Dashboard</Link>
            <Link to="/admin/products" className="text-xs text-secondary hover:text-white">Products</Link>
            <Link to="/admin/orders" className="text-xs text-secondary hover:text-white">Orders</Link>
            <button onClick={handleLogout} className="text-xs text-red-500">Logout</button>
          </div>
        </header>

        {/* Content Page Container */}
        <main className="flex-grow p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
