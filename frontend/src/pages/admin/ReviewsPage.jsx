import { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { reviewApi } from '../../api';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const STATUSES = [
  { value: '',         label: 'Tous' },
  { value: 'pending',  label: 'En attente' },
  { value: 'approved', label: 'Approuvé' },
  { value: 'rejected', label: 'Rejeté' },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage]         = useState(1);

  const fetch = (s = statusFilter, p = page) => {
    setLoading(true);
    const params = { page: p, limit: 15 };
    if (s) params.status = s;
    reviewApi.getAll(params)
      .then(r => { setReviews(r.data.data); setPagination(r.data.pagination); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, [page, statusFilter]);

  const moderate = async (id, status) => {
    try {
      await reviewApi.moderate(id, { status });
      setReviews(r => r.map(rv => rv.id === id ? { ...rv, status } : rv));
      toast.success(status === 'approved' ? 'Avis approuvé ✓' : 'Avis rejeté.');
    } catch (err) { toast.error(err.response?.data?.message || 'Impossible de modérer cet avis.'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer définitivement cet avis ?')) return;
    try { await reviewApi.remove(id); setReviews(r => r.filter(rv => rv.id !== id)); toast.success('Avis supprimé.'); }
    catch (err) { toast.error(err.response?.data?.message || 'Impossible de supprimer cet avis.'); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink flex items-center gap-2">
          <Star size={22} className="text-olive" /> Avis clientes
        </h1>
        <select className="input w-auto py-2 text-sm" value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {loading ? <Spinner /> : reviews.length === 0 ? (
        <EmptyState icon={Star} title="Aucun avis" description="Aucun avis pour ce statut." />
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-olive/20 flex items-center justify-center shrink-0">
                        <span className="text-olive text-sm font-semibold">{r.user?.full_name?.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-ink text-sm">{r.user?.full_name}</p>
                        <p className="text-xs text-ink-muted">{r.user?.email}</p>
                      </div>
                      <span className="text-amber-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-sm text-ink-soft leading-relaxed">{r.comment || <em className="text-ink-muted">Aucun commentaire</em>}</p>
                    <p className="text-xs text-ink-muted mt-2">
                      {new Date(r.createdAt || r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {r.status !== 'approved' && (
                      <button onClick={() => moderate(r.id, 'approved')}
                        className="p-2 rounded-xl bg-green-100 hover:bg-green-200 transition-colors" title="Approuver">
                        <CheckCircle size={16} className="text-green-700" />
                      </button>
                    )}
                    {r.status !== 'rejected' && (
                      <button onClick={() => moderate(r.id, 'rejected')}
                        className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 transition-colors" title="Rejeter">
                        <XCircle size={16} className="text-amber-700" />
                      </button>
                    )}
                    <button onClick={() => remove(r.id)}
                      className="p-2 rounded-xl bg-red-100 hover:bg-red-200 transition-colors" title="Supprimer">
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </>
      )}
    </div>
  );
}
