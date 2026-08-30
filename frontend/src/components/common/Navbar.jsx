import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { ShoppingBag, User, LogOut, Menu, X, Search, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
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
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#1e1e1e] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
              <img src="/logo.jpg" alt="stickypicky" className="h-10 w-10 rounded-full object-cover border border-border" />
              <span className="text-base font-bold tracking-widest text-white">stickypicky</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/shop" className="text-sm font-medium text-secondary hover:text-white transition-colors duration-200">
              Shop
            </Link>
            <div className="relative group">
              <span className="text-sm font-medium text-secondary hover:text-white cursor-pointer transition-colors duration-200">
                Categories
              </span>
              <div className="absolute left-0 mt-2 w-48 bg-[#111111] border border-[#1e1e1e] rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50">
                <Link to="/shop?category=anime" className="block px-4 py-2 text-sm text-secondary hover:text-white hover:bg-[#1a1a1a]">Anime</Link>
                <Link to="/shop?category=bollywood" className="block px-4 py-2 text-sm text-secondary hover:text-white hover:bg-[#1a1a1a]">Bollywood</Link>
                <Link to="/shop?category=aesthetic" className="block px-4 py-2 text-sm text-secondary hover:text-white hover:bg-[#1a1a1a]">Aesthetic</Link>
                <Link to="/shop?category=sports" className="block px-4 py-2 text-sm text-secondary hover:text-white hover:bg-[#1a1a1a]">Sports</Link>
                <Link to="/shop?category=minimal" className="block px-4 py-2 text-sm text-secondary hover:text-white hover:bg-[#1a1a1a]">Minimal</Link>
              </div>
            </div>
          </div>

          {/* Icons/Actions */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Search Trigger */}
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search posters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#111111] text-white border border-[#1e1e1e] rounded-full py-1 px-4 pr-10 text-xs focus:outline-none focus:border-white transition-all w-48"
                  autoFocus
                />
                <button type="submit" className="absolute right-3 text-secondary hover:text-white">
                  <Search size={14} />
                </button>
                <button type="button" onClick={() => setSearchOpen(false)} className="ml-2 text-secondary hover:text-white text-xs">
                  Cancel
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="text-secondary hover:text-white transition-colors duration-200">
                <Search size={18} />
              </button>
            )}

            {/* Admin Dashboard Shield */}
            {isAdmin && (
              <Link to="/admin" className="text-secondary hover:text-white flex items-center gap-1 transition-colors duration-200" title="Admin Dashboard">
                <Shield size={18} />
              </Link>
            )}

            {/* Cart Icon */}
            <Link to="/cart" className="relative text-secondary hover:text-white transition-colors duration-200">
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth Link / Dropdown */}
            {user ? (
              <div className="relative group">
                <button className="text-secondary hover:text-white flex items-center gap-1.5 transition-colors duration-200">
                  <User size={18} />
                  <span className="text-xs max-w-[80px] truncate">{user.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-[#111111] border border-[#1e1e1e] rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50">
                  <Link to="/my-orders" className="block px-4 py-2 text-sm text-secondary hover:text-white hover:bg-[#1a1a1a]">My Orders</Link>
                  <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-red-500 hover:bg-[#1a1a1a]">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-secondary hover:text-white transition-colors duration-200">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative text-secondary hover:text-white">
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-secondary hover:text-white">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-b border-[#1e1e1e] px-4 pt-2 pb-6 space-y-4">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search posters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#111111] text-white border border-[#1e1e1e] rounded-md py-2 px-4 pr-10 text-sm focus:outline-none focus:border-white w-full"
            />
            <button type="submit" className="absolute right-3 text-secondary">
              <Search size={16} />
            </button>
          </form>

          {/* Links */}
          <div className="flex flex-col space-y-3">
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="text-base text-secondary hover:text-white">
              Shop All
            </Link>
            <div className="pl-2 border-l border-[#1e1e1e] flex flex-col space-y-2">
              <Link to="/shop?category=anime" onClick={() => setMobileMenuOpen(false)} className="text-sm text-secondary hover:text-white">Anime</Link>
              <Link to="/shop?category=bollywood" onClick={() => setMobileMenuOpen(false)} className="text-sm text-secondary hover:text-white">Bollywood</Link>
              <Link to="/shop?category=aesthetic" onClick={() => setMobileMenuOpen(false)} className="text-sm text-secondary hover:text-white">Aesthetic</Link>
              <Link to="/shop?category=sports" onClick={() => setMobileMenuOpen(false)} className="text-sm text-secondary hover:text-white">Sports</Link>
              <Link to="/shop?category=minimal" onClick={() => setMobileMenuOpen(false)} className="text-sm text-secondary hover:text-white">Minimal</Link>
            </div>

            <hr className="border-[#1e1e1e] my-2" />

            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-base text-secondary hover:text-white flex items-center gap-2">
                <Shield size={18} /> Admin Dashboard
              </Link>
            )}

            {user ? (
              <>
                <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)} className="text-base text-secondary hover:text-white">
                  My Orders
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-base text-red-500 flex items-center gap-2"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-base text-secondary hover:text-white">
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
