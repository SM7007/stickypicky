import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, ShoppingBag, FolderHeart, LogOut, ArrowLeft, Menu, X, Settings } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard',          path: '/admin',           icon: LayoutDashboard },
    { name: 'Products',           path: '/admin/products',  icon: ShoppingBag },
    { name: 'Orders',             path: '/admin/orders',    icon: FolderHeart },
    { name: 'Delivery Settings',  path: '/admin/settings',  icon: Settings },
  ];

  const NavLinks = ({ onClose }) => (
    <>
      <nav className="flex-grow p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
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

      <div className="p-4 border-t border-border flex flex-col gap-2">
        <Link
          to="/"
          onClick={onClose}
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
    </>
  );

  return (
    <div className="flex min-h-screen bg-background text-white">

      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside className="hidden md:flex w-64 bg-surface border-r border-border flex-col shrink-0">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
            <img src="/logo.jpg" alt="stickypicky" className="h-8 w-8 rounded-full object-cover border border-border" />
            <span className="text-base font-bold tracking-widest text-white">stickypicky</span>
          </Link>
          <span className="text-[10px] font-bold bg-white text-black px-2 py-0.5 rounded uppercase">Admin</span>
        </div>
        <NavLinks onClose={() => {}} />
      </aside>

      {/* ── Mobile Sidebar Overlay ───────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile Sidebar Drawer ────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 bg-surface border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <Link to="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2">
            <img src="/logo.jpg" alt="stickypicky" className="h-8 w-8 rounded-full object-cover border border-border" />
            <span className="text-sm font-bold tracking-widest text-white">stickypicky</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-secondary hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <NavLinks onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="flex-grow flex flex-col min-w-0">

        {/* Mobile Top Bar */}
        <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-4 md:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-secondary hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="stickypicky" className="h-7 w-7 rounded-full object-cover border border-border" />
            <span className="text-sm font-bold tracking-wider text-white">Admin</span>
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-red-500 hover:bg-zinc-800 transition-colors"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-grow p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
