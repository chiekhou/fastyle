import { useState, useEffect } from 'react';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import { orderApi } from '../../api';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const STATUSES = [
  { value: '',          label: 'Tous les statuts' },
  { value: 'pending',   label: 'En attente' },
  { value: 'paid',      label: 'Payée' },
  { value: 'shipped',   label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
];
const NEXT_STATUS = { paid: 'shipped', shipped: 'delivered' };
const NEXT_LABEL  = { paid: 'Marquer expédiée', shipped: 'Marquer livrée' };

export default function AdminOrdersPage() {
  const [orders, setOrders]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]       = useState(1);
  const [expanded, setExpanded] = useState(null);

  const fetch = (s = statusFilter, p = page) => {
    setLoading(true);
    const params = { page: p, limit: 15 };
    if (s) params.status = s;
    orderApi.getAll(params)
      .then(r => { setOrders(r.data.data); setPagination(r.data.pagination); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, [page, statusFilter]);

  const handleStatus = async (id, status) => {
    try {
      await orderApi.updateStatus(id, status);
      setOrders(o => o.map(ord => ord.id === id ? { ...ord, status } : ord));
      toast.success('Statut mis à jour.');
    } catch { toast.error('Erreur.'); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink flex items-center gap-2">
          <Package size={22} className="text-olive" /> Commandes
        </h1>
        <select className="input w-auto py-2 text-sm" value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {loading ? <Spinner /> : orders.length === 0 ? (
        <EmptyState icon={Package} title="Aucune commande" />
      ) : (
        <>
          <div className="card overflow-hidden space-y-0 divide-y divide-cream-200">
            {orders.map(o => (
              <div key={o.id}>
                <div className="flex items-center gap-4 px-5 py-4 hover:bg-cream-50 transition-colors cursor-pointer"
                  onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-ink-muted">#{o.id.slice(0,8).toUpperCase()}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="font-medium text-ink mt-1">{o.user?.full_name}</p>
                    <p className="text-xs text-ink-muted">{o.user?.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-ink">{Number(o.total_price).toFixed(2)} €</p>
                    <p className="text-xs text-ink-muted">
                      {new Date(o.createdAt || o.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {NEXT_STATUS[o.status] && (
                    <button onClick={e => { e.stopPropagation(); handleStatus(o.id, NEXT_STATUS[o.status]); }}
                      className="btn-secondary py-1.5 px-3 text-xs shrink-0">
                      {NEXT_LABEL[o.status]}
                    </button>
                  )}
                  {expanded === o.id ? <ChevronUp size={16} className="text-ink-muted" /> : <ChevronDown size={16} className="text-ink-muted" />}
                </div>

                {/* Détail expandé */}
                {expanded === o.id && (
                  <div className="px-5 pb-4 bg-cream-50 border-t border-cream-200 animate-slide-up">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">Articles</p>
                        <div className="space-y-1">
                          {o.items?.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-ink">{item.product_name_snapshot}{item.variant_label_snapshot ? ` — ${item.variant_label_snapshot}` : ''} x{item.quantity}</span>
                              <span className="text-ink-muted">{(item.unit_price * item.quantity).toFixed(2)} €</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {o.shipping_address && (
                        <div>
                          <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">Livraison</p>
                          <p className="text-sm text-ink">{o.shipping_address.full_name}</p>
                          <p className="text-sm text-ink-muted">{o.shipping_address.street}</p>
                          <p className="text-sm text-ink-muted">{o.shipping_address.zip} {o.shipping_address.city}</p>
                          <p className="text-sm text-ink-muted">{o.shipping_address.country}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </>
      )}
    </div>
  );
}
