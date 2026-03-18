import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/auth');
  }

  const linkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors duration-150 ${
      isActive ? 'text-white' : 'text-gray-400 hover:text-white'
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="text-2xl font-black text-white tracking-tight">
          Moo<span className="text-violet-500">be</span>
        </NavLink>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-8">
          <NavLink to="/" end className={linkClass}>
            Discover
          </NavLink>
          <NavLink to="/library" className={linkClass}>
            My Library
          </NavLink>
        </div>

        {/* Right side */}
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-gray-500 text-xs truncate max-w-36">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm font-semibold text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800"
          >
            Sign Out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden text-gray-400 hover:text-white"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden bg-gray-900 border-t border-gray-800 px-4 py-4 space-y-3">
          <NavLink
            to="/"
            end
            className={linkClass}
            onClick={() => setMenuOpen(false)}
          >
            Discover
          </NavLink>
          <NavLink
            to="/library"
            className={linkClass}
            onClick={() => setMenuOpen(false)}
          >
            My Library
          </NavLink>
          <div className="pt-2 border-t border-gray-800">
            <p className="text-gray-500 text-xs mb-2">{user?.email}</p>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
