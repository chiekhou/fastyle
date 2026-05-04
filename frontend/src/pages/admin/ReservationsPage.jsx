import { useState, useEffect } from 'react';
import { Calendar, Search, CheckCircle, XCircle } from 'lucide-react';
import { reservationApi } from '../../api';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const PERIOD = { morning: 'Matin', afternoon: 'Après-midi', evening: 'Soir' };
const STATUSES = [
  { value: '',           label: 'Tous les statuts' },
  { value: 'pending',    label: 'En attente' },
  { value: 'confirmed',  label: 'Confirmée' },
  { value: 'completed',  label: 'Terminée' },
  { value: 'cancelled',  label: 'Annulée' },
];

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', date: '', page: 1 });

  const fetch = (f = filters) => {
    setLoading(true);
    const params = { ...f };
    if (!params.status) delete params.status;
    if (!params.date)   delete params.date;
    reservationApi.getAll({ ...params, limit: 15 })
      .then(r => { setReservations(r.data.data); setPagination(r.data.pagination); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [filters.page]);

  const applyFilters = () => { const f = { ...filters, page: 1 }; setFilters(f); fetch(f); };

  const handleComplete = async (id) => {
    try {
      await reservationApi.complete(id);
      setReservations(r => r.map(rv => rv.id === id ? { ...rv, status: 'completed' } : rv));
      toast.success('Réservation marquée comme terminée.');
    } catch (err) { toast.error(err.response?.data?.message || 'Impossible de terminer cette réservation.'); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Annuler et rembourser l\'acompte ?')) return;
    try {
      await reservationApi.cancel(id, 'Annulation par l\'administratrice');
      setReservations(r => r.map(rv => rv.id === id ? { ...rv, status: 'cancelled' } : rv));
      toast.success('Réservation annulée.');
    } catch (err) { toast.error(err.response?.data?.message || 'Impossible d\'annuler cette réservation.'); }
  };

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl text-ink mb-6 flex items-center gap-2">
        <Calendar size={22} className="text-olive" /> Réservations
      </h1>

      {/* Filtres */}
      <div className="card p-4 flex flex-wrap gap-3 mb-6">
        <select className="input w-auto py-2" value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <input type="date" className="input w-auto py-2" value={filters.date}
          onChange={e => setFilters(f => ({ ...f, date: e.target.value }))} />
        <button onClick={applyFilters} className="btn-primary py-2 px-4 text-sm">
          <Search size={15} /> Filtrer
        </button>
        <button onClick={() => { setFilters({ status: '', date: '', page: 1 }); fetch({ status: '', date: '', page: 1 }); }}
          className="btn-secondary py-2 px-4 text-sm">
          Réinitialiser
        </button>
      </div>

      {loading ? <Spinner /> : reservations.length === 0 ? (
        <EmptyState icon={Calendar} title="Aucune réservation" />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-cream-100 border-b border-cream-300">
                  <tr>
                    {['Cliente', 'Prestation', 'Date', 'Créneau', 'Total', 'Acompte', 'Statut', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {reservations.map(r => (
                    <tr key={r.id} className="hover:bg-cream-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">{r.user?.full_name}</p>
                        <p className="text-xs text-ink-muted">{r.user?.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{r.service?.name}</td>
                      <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                        {new Date(r.reservation_date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                          r.slot?.period === 'morning' ? 'bg-amber-100 text-amber-700' :
                          r.slot?.period === 'afternoon' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {PERIOD[r.slot?.period] || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">{Number(r.total_price).toFixed(2)} €</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.deposit_status} />
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {r.status === 'confirmed' && (
                            <button onClick={() => handleComplete(r.id)}
                              className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors" title="Marquer terminée">
                              <CheckCircle size={15} />
                            </button>
                          )}
                          {['pending', 'confirmed'].includes(r.status) && (
                            <button onClick={() => handleCancel(r.id)}
                              className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors" title="Annuler">
                              <XCircle size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination pagination={pagination} onPageChange={p => setFilters(f => ({ ...f, page: p }))} />
        </>
      )}
    </div>
  );
}
