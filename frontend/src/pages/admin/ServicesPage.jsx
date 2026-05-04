import { useState, useEffect } from 'react';
import { Scissors, Plus, Pencil, Trash2, Check } from 'lucide-react';
import { serviceApi } from '../../api';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const EMPTY = { name: '', description: '', duration_minutes: 60, price: '', image: null };

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);

  const fetch = () => {
    setLoading(true);
    serviceApi.getAll().then(r => setServices(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit   = (svc) => { setEditing(svc); setForm({ name: svc.name, description: svc.description || '', duration_minutes: svc.duration_minutes, price: svc.price, image: null }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (k !== 'image' && v !== null) fd.append(k, v); });
      if (form.image) fd.append('image', form.image);

      if (editing) { await serviceApi.update(editing.id, fd); toast.success('Prestation mise à jour.'); }
      else          { await serviceApi.create(fd); toast.success('Prestation créée.'); }
      setModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde de la prestation.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Désactiver cette prestation ?')) return;
    try { await serviceApi.remove(id); toast.success('Prestation désactivée.'); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Impossible de désactiver cette prestation.'); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink flex items-center gap-2">
          <Scissors size={22} className="text-olive" /> Prestations
        </h1>
        <button onClick={openCreate} className="btn-primary py-2 px-3 sm:px-4 text-sm">
          <Plus size={16} />
          <span className="hidden sm:inline">Nouvelle prestation</span>
        </button>
      </div>

      {loading ? <Spinner /> : services.length === 0 ? (
        <EmptyState icon={Scissors} title="Aucune prestation"
          action={<button onClick={openCreate} className="btn-primary">Créer la première</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map(svc => (
            <div key={svc.id} className="card p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-olive/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {svc.image_url ? <img src={svc.image_url} alt={svc.name} className="w-full h-full object-cover" /> : <Scissors size={20} className="text-olive" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg text-ink leading-tight">{svc.name}</h3>
                  <p className="text-xs text-ink-muted">{svc.duration_minutes} min</p>
                </div>
              </div>
              <p className="text-sm text-ink-muted line-clamp-2 mb-3">{svc.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-display text-xl text-olive">{Number(svc.price).toFixed(2)} €</span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(svc)} className="p-2 rounded-xl bg-cream-300 hover:bg-cream-400 transition-colors text-ink-soft">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(svc.id)} className="p-2 rounded-xl bg-red-100 hover:bg-red-200 transition-colors text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Modifier la prestation' : 'Nouvelle prestation'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Nom</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
          <div><label className="label">Description</label><textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Durée (min)</label><input type="number" className="input" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} required /></div>
            <div><label className="label">Prix (€)</label><input type="number" step="0.01" className="input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required /></div>
          </div>
          <div><label className="label">Image</label><input type="file" accept="image/*" className="input py-2" onChange={e => setForm(f => ({ ...f, image: e.target.files[0] }))} /></div>
          <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
            {saving ? <span className="w-4 h-4 rounded-full border-2 border-ivory-100/30 border-t-ivory-100 animate-spin" /> : <><Check size={16} /> {editing ? 'Mettre à jour' : 'Créer'}</>}
          </button>
        </form>
      </Modal>
    </div>
  );
}
