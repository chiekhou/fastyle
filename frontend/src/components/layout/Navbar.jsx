import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, LogOut, LayoutDashboard, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';

const NAV_LINKS = [
  { to: '/',          label: 'Accueil' },
  { to: '/services',  label: 'Prestations' },
  { to: '/boutique',  label: 'Boutique' },
  { to: '/avis',      label: 'Avis' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const navigate                  = useNavigate();
  const [open, setOpen]           = useState(false);
  const [userMenu, setUserMenu]   = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('À bientôt !');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-cream-200/90 backdrop-blur-md border-b border-cream-300">
      <div className="container-app">
        <nav className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="font-display text-2xl text-ink font-semibold tracking-tight">
            Fa<span className="text-olive">Style</span>
          </Link>

          {/* Nav desktop */}
          <ul className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? 'bg-olive text-ivory-100'
                        : 'text-ink-soft hover:bg-cream-300 hover:text-ink'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-2">

            {/* Panier */}
            <Link
              to="/panier"
              className="relative p-2.5 rounded-xl text-ink-soft hover:bg-cream-300 transition-colors"
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-olive text-ivory-100 text-[10px] font-bold flex items-center justify-center">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            {/* Réserver */}
            {user && !isAdmin && (
              <Link to="/reservation" className="hidden sm:flex btn-primary py-2 px-4 text-sm">
                <Calendar size={15} />
                Réserver
              </Link>
            )}

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-cream-300 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-olive/20 flex items-center justify-center">
                    <span className="text-olive text-sm font-semibold">
                      {user.full_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>

                {userMenu && (
                  <div className="absolute right-0 top-12 w-52 card shadow-hover py-2 animate-slide-up">
                    <div className="px-4 py-2 border-b border-cream-300">
                      <p className="font-medium text-sm text-ink truncate">{user.full_name}</p>
                      <p className="text-xs text-ink-muted truncate">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-ink-soft hover:bg-cream-200 transition-colors"
                      >
                        <LayoutDashboard size={15} />
                        Dashboard admin
                      </Link>
                    )}
                    <Link
                      to="/compte"
                      onClick={() => setUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-ink-soft hover:bg-cream-200 transition-colors"
                    >
                      <User size={15} />
                      Mon compte
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary py-2 px-4 text-sm">
                Connexion
              </Link>
            )}

            {/* Burger mobile */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-xl hover:bg-cream-300 transition-colors"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Menu mobile */}
        {open && (
          <div className="md:hidden pb-4 animate-slide-up">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive ? 'bg-olive text-ivory-100' : 'text-ink-soft hover:bg-cream-300'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
              {user && !isAdmin && (
                <li>
                  <Link
                    to="/reservation"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-sm font-medium text-olive"
                  >
                    📅 Réserver une prestation
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
