import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-border text-secondary py-12 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.jpg" alt="stickypicky" className="h-10 w-10 rounded-full object-cover border border-border" />
              <span className="text-xl font-bold tracking-widest text-primary uppercase">stickypicky</span>
            </div>
            <p className="mt-4 text-sm max-w-sm leading-relaxed">
              Walls that speak louder. Premium physical posters designed and printed to give your room, workspace, or home a distinct aesthetic.
            </p>
            <p className="mt-6 text-xs text-secondary/70">
              © {new Date().getFullYear()} stickypicky. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-primary tracking-wider uppercase mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link to="/shop" className="text-sm hover:text-primary transition-colors duration-150">All Posters</Link></li>
              <li><Link to="/shop?category=anime" className="text-sm hover:text-primary transition-colors duration-150">Anime Drops</Link></li>
              <li><Link to="/shop?category=bollywood" className="text-sm hover:text-primary transition-colors duration-150">Bollywood Retro</Link></li>
              <li><Link to="/shop?category=aesthetic" className="text-sm hover:text-primary transition-colors duration-150">Aesthetic Landscape</Link></li>
            </ul>
          </div>

          {/* Info & Legal */}
          <div>
            <h3 className="text-sm font-semibold text-primary tracking-wider uppercase mb-4">Customer Care</h3>
            <ul className="space-y-2">
              <li><span className="text-sm hover:text-primary cursor-pointer transition-colors duration-150">Shipping & Delivery</span></li>
              <li><span className="text-sm hover:text-primary cursor-pointer transition-colors duration-150">Returns & Refunds</span></li>
              <li><span className="text-sm hover:text-primary cursor-pointer transition-colors duration-150">Privacy Policy</span></li>
              <li><span className="text-sm hover:text-primary cursor-pointer transition-colors duration-150">Contact Us</span></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
