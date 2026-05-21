import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { GraduationCap, Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Student Portal', path: '/' },
  { label: 'Admin Portal', path: '/admin' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-sage/80 backdrop-blur-md border-b border-olive/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center group-hover:bg-gold transition-colors duration-300">
            <GraduationCap className="w-5 h-5 text-sage" />
          </div>
          <div className="flex flex-col">
            <span className="text-forest font-semibold text-sm tracking-wide leading-tight">
              FEDPOLYNAS RECORDS
            </span>
            <span className="text-olive text-[10px] tracking-[0.15em] uppercase">
              Transcript Management
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative text-sm font-medium transition-colors duration-300 ${
                isActive(link.path)
                  ? 'text-forest'
                  : 'text-olive hover:text-forest'
              }`}
            >
              {link.label}
              <span
                className={`absolute -bottom-1 left-0 h-[2px] bg-gold transition-all duration-300 ${
                  isActive(link.path) ? 'w-full' : 'w-0'
                }`}
              />
            </Link>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-moss transition-colors"
        >
          {mobileOpen ? (
            <X className="w-5 h-5 text-forest" />
          ) : (
            <Menu className="w-5 h-5 text-forest" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-sage/95 backdrop-blur-lg border-t border-olive/20">
          <div className="px-6 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-medium py-2 transition-colors ${
                  isActive(link.path)
                    ? 'text-forest'
                    : 'text-olive hover:text-forest'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
