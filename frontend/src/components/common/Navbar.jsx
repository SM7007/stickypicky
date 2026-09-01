import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useTheme } from '../../hooks/useTheme';
import { ShoppingBag, User, Menu, X, Search, Shield, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-border shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
                <img src="/logo.jpg" alt="stickypicky" className="h-10 w-10 rounded-full object-cover border border-border" />
                <span className="text-base font-bold tracking-widest text-primary uppercase">stickypicky</span>
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex space-x-8 items-center">
              <Link to="/shop" className="text-sm font-medium text-secondary hover:text-primary transition-colors duration-200">
                Shop Posters
              </Link>
              <Link to="/shop?category=stickers" className="text-sm font-medium text-secondary hover:text-primary transition-colors duration-200">
                Stickers
              </Link>
              <div className="relative group">
                <span className="text-sm font-medium text-secondary hover:text-primary cursor-pointer transition-colors duration-200">
                  Categories
                </span>
                <div className="absolute left-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 overflow-hidden">
                  <Link to="/shop" className="block px-4 py-2.5 text-sm text-secondary hover:text-primary hover:bg-background transition-colors">All Products</Link>
                  <Link to="/shop?category=stickers" className="block px-4 py-2.5 text-sm text-secondary hover:text-primary hover:bg-background transition-colors">Vinyl Stickers</Link>
                  <Link to="/shop?category=anime" className="block px-4 py-2.5 text-sm text-secondary hover:text-primary hover:bg-background transition-colors">Anime</Link>
                  <Link to="/shop?category=bollywood" className="block px-4 py-2.5 text-sm text-secondary hover:text-primary hover:bg-background transition-colors">Bollywood</Link>
                  <Link to="/shop?category=aesthetic" className="block px-4 py-2.5 text-sm text-secondary hover:text-primary hover:bg-background transition-colors">Aesthetic</Link>
                  <Link to="/shop?category=sports" className="block px-4 py-2.5 text-sm text-secondary hover:text-primary hover:bg-background transition-colors">Sports</Link>
                  <Link to="/shop?category=minimal" className="block px-4 py-2.5 text-sm text-secondary hover:text-primary hover:bg-background transition-colors">Minimal</Link>
                </div>
              </div>
            </div>

            {/* Icons/Actions */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Search Trigger */}
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Search posters..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-background text-primary border border-border rounded-full py-1.5 pl-4 pr-9 text-xs focus:outline-none focus:border-primary transition-all w-52"
                      autoFocus
                    />
                    <button type="submit" className="absolute right-2.5 text-secondary hover:text-primary flex items-center justify-center p-1 cursor-pointer">
                      <Search size={14} />
                    </button>
                  </div>
                  <button type="button" onClick={() => setSearchOpen(false)} className="ml-2 text-secondary hover:text-primary text-xs whitespace-nowrap px-1 py-1 cursor-pointer">
                    Cancel
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="text-secondary hover:text-primary transition-colors duration-200 cursor-pointer">
                  <Search size={18} />
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="text-secondary hover:text-primary transition-colors duration-200 p-1.5 rounded-full hover:bg-background cursor-pointer"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Admin Dashboard Shield */}
              {isAdmin && (
                <Link to="/admin" className="text-secondary hover:text-primary flex items-center gap-1 transition-colors duration-200" title="Admin Dashboard">
                  <Shield size={18} />
                </Link>
              )}

              {/* Cart Icon */}
              <Link to="/cart" className="relative text-secondary hover:text-primary transition-colors duration-200">
                <ShoppingBag size={18} />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-background text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Auth Link / Dropdown */}
              {user ? (
                <div className="relative group py-2">
                  <button className="text-secondary hover:text-primary flex items-center gap-1.5 transition-colors duration-200 cursor-pointer">
                    <User size={18} />
                    <span className="text-xs font-semibold max-w-[80px] truncate">{user.name}</span>
                  </button>
                  <div className="absolute right-0 top-full w-48 bg-surface border border-border rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 overflow-hidden">
                    {isAdmin && (
                      <Link to="/admin" className="block px-4 py-2.5 text-sm text-secondary hover:text-primary hover:bg-background transition-colors">
                        Admin Dashboard
                      </Link>
                    )}
                    <Link to="/my-orders" className="block px-4 py-2.5 text-sm text-secondary hover:text-primary hover:bg-background transition-colors">
                      My Orders
                    </Link>
                    <button onClick={logout} className="w-full text-left block px-4 py-2.5 text-sm text-red-500 hover:bg-background transition-colors cursor-pointer">
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="text-sm font-medium text-secondary hover:text-primary transition-colors duration-200">
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
              <Link to="/cart" className="relative text-secondary hover:text-primary">
                <ShoppingBag size={18} />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-background text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="text-secondary hover:text-primary transition-colors duration-200 p-1 cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-secondary hover:text-primary cursor-pointer">
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Off-Canvas Slide-out Sidebar Drawer */}
      <div
        className={`fixed inset-0 z-[100] md:hidden flex transition-all duration-300 ${
          mobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {/* Backdrop Overlay */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Slide-out Sidebar */}
        <div
          className={`relative w-4/5 max-w-sm bg-surface border-r border-border h-screen flex flex-col z-[101] p-6 shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex justify-between items-center pb-5 border-b border-border mb-6">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold font-display text-primary tracking-widest uppercase">
              STICKY<span className="text-secondary font-light">PICKY</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 text-secondary hover:text-primary transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-6">
            <input
              type="text"
              placeholder="Search posters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background text-primary border border-border rounded-lg py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-primary w-full"
            />
            <button type="submit" className="absolute right-3 text-secondary hover:text-primary cursor-pointer">
              <Search size={16} />
            </button>
          </form>

          {/* Menu Navigation Links */}
          <div className="flex-1 space-y-6">
            <div>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-3">Navigation</span>
              <div className="flex flex-col space-y-2">
                <Link
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-primary hover:text-secondary transition-colors py-1.5"
                >
                  Shop All Products
                </Link>
                <Link
                  to="/shop?category=stickers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-primary hover:text-secondary transition-colors py-1.5"
                >
                  Stickers
                </Link>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-3">Categories</span>
              <div className="flex flex-col space-y-2 pl-2 border-l border-border">
                <Link to="/shop?category=stickers" onClick={() => setMobileMenuOpen(false)} className="text-sm text-secondary hover:text-primary transition-colors py-1">Stickers</Link>
                <Link to="/shop?category=anime" onClick={() => setMobileMenuOpen(false)} className="text-sm text-secondary hover:text-primary transition-colors py-1">Anime</Link>
                <Link to="/shop?category=bollywood" onClick={() => setMobileMenuOpen(false)} className="text-sm text-secondary hover:text-primary transition-colors py-1">Bollywood</Link>
                <Link to="/shop?category=aesthetic" onClick={() => setMobileMenuOpen(false)} className="text-sm text-secondary hover:text-primary transition-colors py-1">Aesthetic</Link>
                <Link to="/shop?category=sports" onClick={() => setMobileMenuOpen(false)} className="text-sm text-secondary hover:text-primary transition-colors py-1">Sports</Link>
                <Link to="/shop?category=minimal" onClick={() => setMobileMenuOpen(false)} className="text-sm text-secondary hover:text-primary transition-colors py-1">Minimal</Link>
              </div>
            </div>

            <hr className="border-border" />

            {/* Auth section in mobile drawer */}
            <div>
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <User size={16} />
                    <span>Signed in as {user.name}</span>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-sm font-semibold text-primary hover:text-secondary py-1"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/my-orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-semibold text-primary hover:text-secondary py-1"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm font-semibold text-red-500 py-1 block cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center bg-primary text-background font-bold uppercase tracking-wider text-xs py-3 rounded hover:opacity-90 transition-opacity"
                >
                  Log In / Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
