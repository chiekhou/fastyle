import { useState, useEffect } from 'react';
import { Star, PenLine } from 'lucide-react';
import { reviewApi } from '../api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/ui/StarRating';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function ReviewsPage() {
  const { user }  = useAuth();
  const [reviews, setReviews]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetch = (p = 1) => {
    setLoading(true);
    reviewApi.getPublic({ page: p, limit: 9 })
      .then(r => { setReviews(r.data.data); setPagination(r.data.pagination); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(page); }, [page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await reviewApi.create(form);
      toast.success('Avis soumis ! Il sera visible après validation.');
      setShowModal(false);
      setForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi.');
    } finally {
      setSubmitting(false);
    }
  };

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-ink py-16 relative overflow-hidden">
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-olive/10 blur-3xl" />
        <div className="container-app relative z-10 text-center">
          <h1 className="font-display text-5xl text-ivory-100 mb-3">Avis clientes</h1>
          {avg && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="font-display text-4xl text-olive-300">{avg}</span>
              <div>
                <StarRating value={Math.round(avg)} readonly size={22} />
                <p className="text-cream-400 text-sm mt-1">{pagination?.total} avis</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container-app">
          {/* CTA laisser un avis */}
          <div className="flex justify-end mb-8">
            {user ? (
              <button onClick={() => setShowModal(true)} className="btn-primary">
                <PenLine size={16} /> Laisser un avis
              </button>
            ) : (
              <a href="/login" className="btn-outline">
                <Star size={16} /> Connectez-vous pour laisser un avis
              </a>
            )}
          </div>

          {loading ? <Spinner /> : reviews.length === 0 ? (
            <EmptyState icon={Star} title="Aucun avis pour l'instant" description="Soyez la première à partager votre expérience !" />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
              </div>
              <Pagination pagination={pagination} onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            </>
          )}
        </div>
      </section>

      {/* Modal avis */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Laisser un avis">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Votre note</label>
            <StarRating value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} size={28} />
          </div>
          <div>
            <label className="label">Votre commentaire <span className="text-ink-muted">(optionnel)</span></label>
            <textarea
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              placeholder="Partagez votre expérience…"
              rows={4}
              className="input resize-none"
            />
          </div>
          <p className="text-xs text-ink-muted">Votre avis sera visible après validation par notre équipe.</p>
          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
            {submitting
              ? <span className="w-4 h-4 rounded-full border-2 border-ivory-100/30 border-t-ivory-100 animate-spin" />
              : 'Envoyer mon avis'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="card p-6 flex flex-col">
      <StarRating value={review.rating} readonly size={16} />
      <p className="text-sm text-ink-soft mt-3 leading-relaxed flex-1 line-clamp-5">
        "{review.comment}"
      </p>
      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-cream-300">
        <div className="w-9 h-9 rounded-full bg-olive/20 flex items-center justify-center shrink-0">
          <span className="text-olive font-semibold text-sm">{review.user?.full_name?.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-ink">{review.user?.full_name}</p>
          <p className="text-xs text-ink-muted">
            {new Date(review.createdAt || review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
