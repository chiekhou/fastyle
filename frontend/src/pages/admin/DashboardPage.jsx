import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, ShoppingBag, Package, Star,
  Users, TrendingUp, AlertTriangle, ArrowRight, Clock,
} from 'lucide-react';
import { reservationApi, orderApi, reviewApi, productApi, userApi } from '../../api';
import Spinner from '../../components/ui/Spinner';
import StatusBadge from '../../components/ui/StatusBadge';

export default function DashboardPage() {
  const [stats, setStats]               = useState(null);
  const [todayReservations, setTodayR]  = useState([]);
  const [pendingReviews, setPendingR]   = useState([]);
  const [recentOrders, setRecentO]      = useState([]);
  const [lowStock, setLowStock]         = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    Promise.allSettled([
      reservationApi.getAll({ date: today, limit: 10 }),
      reviewApi.getAll({ status: 'pending', limit: 5 }),
      orderApi.getAll({ limit: 5 }),
      productApi.getLowStock(),
      userApi.getAll({ limit: 1 }),
    ]).then(([resv, revw, ords, stock, usrs]) => {
      setTodayR(resv.value?.data?.data || []);
      setPendingR(revw.value?.data?.data || []);
      setRecentO(ords.value?.data?.data || []);
      setLowStock(stock.value?.data?.data || []);

      setStats({
        reservations_today: resv.value?.data?.pagination?.total || 0,
        pending_reviews:    revw.value?.data?.pagination?.total || 0,
        recent_orders:      ords.value?.data?.pagination?.total || 0,
        total_clients:      usrs.value?.data?.pagination?.total || 0,
      });
      setLoading(false);
    });
  }, []);

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  if (loading) return <Spinner fullPage />;

  const PERIOD_LABELS = { morning: 'Matin', afternoon: 'Après-midi', evening: 'Soir' };

  return (
    <div className="p-8 max-w-7xl">

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-ink-muted capitalize">{today}</p>
        <h1 className="font-display text-3xl text-ink mt-1">Bonjour 👋</h1>
        <p className="text-ink-muted mt-1">Voici un résumé de votre activité.</p>
      </div>

      {/* ── Stat cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Calendar,   label: 'Réservations aujourd\'hui', value: stats?.reservations_today, color: 'bg-olive/10 text-olive',   link: '/admin/reservations' },
          { icon: Star,       label: 'Avis en attente',           value: stats?.pending_reviews,    color: 'bg-amber-100 text-amber-600', link: '/admin/avis' },
          { icon: Package,    label: 'Commandes (total)',         value: stats?.recent_orders,      color: 'bg-blue-100 text-blue-600',  link: '/admin/commandes' },
          { icon: Users,      label: 'Clientes inscrites',        value: stats?.total_clients,      color: 'bg-cream-300 text-ink-soft', link: '/admin/clientes' },
        ].map(({ icon: Icon, label, value, color, link }) => (
          <Link key={label} to={link} className="card p-5 hover:shadow-hover transition-all duration-200 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="font-display text-3xl text-ink">{value ?? '—'}</p>
            <p className="text-xs text-ink-muted mt-1">{label}</p>
            <ArrowRight size={14} className="text-ink-muted mt-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Réservations du jour ────────────────────── */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-300">
              <h2 className="font-display text-lg text-ink flex items-center gap-2">
                <Calendar size={18} className="text-olive" />
                Réservations du jour
              </h2>
              <Link to="/admin/reservations" className="text-sm text-olive hover:underline flex items-center gap-1">
                Voir tout <ArrowRight size={13} />
              </Link>
            </div>

            {todayReservations.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <Calendar size={32} className="text-cream-400 mb-3" />
                <p className="text-ink-muted text-sm">Aucune réservation aujourd'hui</p>
              </div>
            ) : (
              <div className="divide-y divide-cream-200">
                {todayReservations.map((r) => (
                  <div key={r.id} className="flex items-center gap-4 px-6 py-4 hover:bg-cream-100 transition-colors">
                    {/* Créneau */}
                    <div className="w-20 shrink-0">
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                        r.slot?.period === 'morning'   ? 'bg-amber-100 text-amber-700' :
                        r.slot?.period === 'afternoon' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {PERIOD_LABELS[r.slot?.period] || r.slot?.period}
                      </span>
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-ink truncate">{r.user?.full_name}</p>
                      <p className="text-xs text-ink-muted truncate">{r.service?.name}</p>
                    </div>

                    {/* Montant */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-ink">{r.total_price} €</p>
                      <p className="text-xs text-ink-muted">Acompte {r.deposit_amount} €</p>
                    </div>

                    {/* Statut */}
                    <div className="shrink-0">
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Colonne droite ──────────────────────────── */}
        <div className="space-y-6">

          {/* Avis en attente */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-cream-300">
              <h2 className="font-display text-base text-ink flex items-center gap-2">
                <Star size={16} className="text-amber-500" />
                Avis à modérer
              </h2>
              <Link to="/admin/avis" className="text-xs text-olive hover:underline">Voir tout</Link>
            </div>

            {pendingReviews.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-ink-muted text-sm">Aucun avis en attente</p>
              </div>
            ) : (
              <div className="divide-y divide-cream-200">
                {pendingReviews.map((rev) => (
                  <div key={rev.id} className="px-5 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-ink">{rev.user?.full_name}</span>
                      <span className="text-xs text-amber-500">{'★'.repeat(rev.rating)}</span>
                    </div>
                    <p className="text-xs text-ink-muted line-clamp-2">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {pendingReviews.length > 0 && (
              <div className="px-5 py-3 border-t border-cream-300">
                <Link to="/admin/avis" className="btn-outline w-full justify-center py-2 text-sm">
                  Modérer les avis
                </Link>
              </div>
            )}
          </div>

          {/* Alertes stock */}
          {lowStock.length > 0 && (
            <div className="card overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-cream-300 bg-amber-50">
                <AlertTriangle size={16} className="text-amber-600" />
                <h2 className="font-display text-base text-amber-700">Stock bas</h2>
              </div>
              <div className="divide-y divide-cream-200">
                {lowStock.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3">
                    <p className="text-sm text-ink truncate max-w-[150px]">{p.name}</p>
                    <span className="badge-danger">{p.stock_qty} restants</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-cream-300">
                <Link to="/admin/produits" className="text-sm text-olive hover:underline flex items-center gap-1">
                  Gérer les stocks <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}

          {/* Commandes récentes */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-cream-300">
              <h2 className="font-display text-base text-ink flex items-center gap-2">
                <Package size={16} className="text-olive" />
                Commandes récentes
              </h2>
              <Link to="/admin/commandes" className="text-xs text-olive hover:underline">Voir tout</Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-ink-muted text-sm">Aucune commande</p>
              </div>
            ) : (
              <div className="divide-y divide-cream-200">
                {recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{o.user?.full_name}</p>
                      <p className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
                        <Clock size={11} />
                        {new Date(o.createdAt || o.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-ink">{o.total_price} €</p>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
