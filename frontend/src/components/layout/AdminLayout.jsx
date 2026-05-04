import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Scissors, ShoppingBag,
  Package, Star, Users, LogOut, ChevronRight, Home, Menu, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ADMIN_LINKS = [
  { to: '/admin',              label: 'Dashboard',     icon: LayoutDashboard, end: true },
  { to: '/admin/reservations', label: 'Réservations',  icon: Calendar },
  { to: '/admin/services',     label: 'Prestations',   icon: Scissors },
  { to: '/admin/produits',     label: 'Produits',      icon: ShoppingBag },
  { to: '/admin/commandes',    label: 'Commandes',     icon: Package },
  { to: '/admin/avis',         label: 'Avis',          icon: Star },
  { to: '/admin/clientes',     label: 'Clientes',      icon: Users },
];

function SidebarNav({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose();
    await logout();
    toast.success('Déconnexion réussie.');
    navigate('/');
  };

  return (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <span className="font-display text-xl text-ivory-100">
            Fa<span className="text-olive-300">Style</span>
          </span>
          <p className="text-xs text-cream-500 mt-0.5">Administration</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-cream-400 hover:text-ivory-100 transition-colors"
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {ADMIN_LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-olive text-ivory-100'
                  : 'text-cream-400 hover:bg-white/5 hover:text-ivory-100'
              }`
            }
          >
            <Icon size={16} />
            <span>{label}</span>
            <ChevronRight size={14} className="ml-auto opacity-40" />
          </NavLink>
        ))}
      </nav>

      {/* User info + actions */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-olive/30 flex items-center justify-center shrink-0">
            <span className="text-olive-300 text-sm font-bold">
              {user?.full_name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-ivory-100 truncate">{user?.full_name}</p>
            <p className="text-[10px] text-cream-500 truncate">{user?.email}</p>
          </div>
        </div>
        <Link
          to="/"
          onClick={onClose}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-cream-400 hover:bg-white/5 hover:text-ivory-100 transition-colors mb-1"
        >
          <Home size={15} />
          Retour au site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={15} />
          Déconnexion
        </button>
      </div>
    </>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="min-h-screen flex bg-cream-100">

      {/* ── Desktop sidebar — visible uniquement ≥ md, dans le flux flex ── */}
      <aside className="hidden md:flex md:w-60 md:shrink-0 flex-col bg-ink">
        <SidebarNav onClose={null} />
      </aside>

      {/* ── Mobile : barre du haut + drawer overlay ── */}

      {/* Barre top mobile */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center gap-3 px-4 py-3 bg-ink border-b border-white/10">
        <button
          onClick={() => setOpen(true)}
          className="text-cream-400 hover:text-ivory-100 transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu size={22} />
        </button>
        <span className="font-display text-lg text-ivory-100">
          Fa<span className="text-olive-300">Style</span>
        </span>
        <span className="text-xs text-cream-500">Admin</span>
      </div>

      {/* Drawer overlay mobile (backdrop + panel) */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60"
          onClick={close}
          aria-hidden="true"
        />
        {/* Panel */}
        <aside
          className={`absolute inset-y-0 left-0 w-[85vw] max-w-xs flex flex-col bg-ink transition-transform duration-300 ease-in-out ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarNav onClose={close} />
        </aside>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-auto pt-14 md:pt-0">
        <Outlet />
      </div>
    </div>
  );
}
