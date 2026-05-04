import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Pencil, Trash2, Check, Package, AlertTriangle } from 'lucide-react';
import { productApi } from '../../api';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const EMPTY = { name: '', description: '', category: 'cosmetic', price: '', stock_qty: 0, low_stock_threshold: 3, weight_grams: 250, has_variants: false, images: [] };

export default function AdminProductsPage() {
  const [products, setProducts]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [modal, setModal]         = useState(false);
  const [variantModal, setVariantModal] = useState(null); // product
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [variantForm, setVariantForm] = useState({ label: '', stock_qty: 0, price_override: '' });
  const [saving, setSaving]       = useState(false);

  const fetch = (p = page) => {
    setLoading(true);
    productApi.getAll({ page: p, limit: 12 })
      .then(r => { setProducts(r.data.data); setPagination(r.data.pagination); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, [page]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit   = (p) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || '', category: p.category, price: p.price, stock_qty: p.stock_qty, low_stock_threshold: p.low_stock_threshold, weight_grams: p.weight_grams || 250, has_variants: p.has_variants, images: [] });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (k !== 'images' && v !== null && v !== '') fd.append(k, v); });
      form.images.forEach((file) => fd.append('images', file));
      if (editing) { await productApi.update(editing.id, fd); toast.success('Produit mis à jour.'); }
      else          { await productApi.create(fd); toast.success('Produit créé.'); }
      setModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde du produit.'); }
    finally { setSaving(false); }
  };

  const handleAddVariant = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const data = { ...variantForm, stock_qty: Number(variantForm.stock_qty) };
      if (!variantForm.price_override) delete data.price_override;
      await productApi.createVariant(variantModal.id, data);
      toast.success('Variante ajoutée.');
      setVariantModal(null); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur lors de l\'ajout de la variante.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Désactiver ce produit ?')) return;
    try { await productApi.remove(id); toast.success('Produit désactivé.'); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Impossible de désactiver ce produit.'); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink flex items-center gap-2">
          <ShoppingBag size={22} className="text-olive" /> Produits
        </h1>
        <button onClick={openCreate} className="btn-primary py-2 px-4 text-sm">
          <Plus size={16} /> Nouveau produit
        </button>
      </div>

      {loading ? <Spinner /> : products.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="Aucun produit"
          action={<button onClick={openCreate} className="btn-primary">Ajouter le premier</button>} />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 border-b border-cream-300">
                <tr>
                  {['Produit', 'Catégorie', 'Prix', 'Stock', 'Variantes', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-cream-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-olive/10 flex items-center justify-center shrink-0 overflow-hidden">
                          {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <Package size={16} className="text-olive" />}
                        </div>
                        <p className="font-medium text-ink">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${p.category === 'cosmetic' ? 'badge-olive' : 'badge-cream'}`}>
                        {p.category === 'cosmetic' ? 'Cosmétique' : 'Vêtement'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">{Number(p.price).toFixed(2)} €</td>
                    <td className="px-4 py-3">
                      {p.has_variants ? (
                        <span className="text-ink-muted text-xs">Voir variantes</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className={`font-medium ${p.stock_qty <= p.low_stock_threshold ? 'text-red-500' : 'text-ink'}`}>{p.stock_qty}</span>
                          {p.stock_qty <= p.low_stock_threshold && <AlertTriangle size={13} className="text-amber-500" />}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.has_variants ? (
                        <button onClick={() => setVariantModal(p)} className="text-xs text-olive hover:underline">
                          {p.variants?.length || 0} variante(s)
                        </button>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg bg-cream-300 hover:bg-cream-400 transition-colors">
                          <Pencil size={14} className="text-ink-soft" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition-colors">
                          <Trash2 size={14} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}

      {/* Modal produit */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Modifier le produit' : 'Nouveau produit'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="label">Nom</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
            <div>
              <label className="label">Catégorie</label>
              <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="cosmetic">Cosmétique</option>
                <option value="clothing">Vêtement</option>
              </select>
            </div>
            <div><label className="label">Prix (€)</label><input type="number" step="0.01" className="input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required /></div>
            <div>
              <label className="label">Poids (grammes)</label>
              <input type="number" min="1" className="input" value={form.weight_grams}
                onChange={e => setForm(f => ({ ...f, weight_grams: e.target.value }))} />
              <p className="text-xs text-ink-muted mt-1">Utilisé pour calculer les frais de livraison. Ex : cosmétique 100–300 g, vêtement 200–500 g.</p>
            </div>
          </div>
          <div><label className="label">Description</label><textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="has_variants" checked={form.has_variants} onChange={e => setForm(f => ({ ...f, has_variants: e.target.checked }))} className="w-4 h-4 accent-olive" />
            <label htmlFor="has_variants" className="text-sm text-ink-soft">Ce produit a des variantes (tailles, couleurs…)</label>
          </div>
          {!form.has_variants && (
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Stock</label><input type="number" className="input" value={form.stock_qty} onChange={e => setForm(f => ({ ...f, stock_qty: e.target.value }))} /></div>
              <div><label className="label">Seuil alerte stock</label><input type="number" className="input" value={form.low_stock_threshold} onChange={e => setForm(f => ({ ...f, low_stock_threshold: e.target.value }))} /></div>
            </div>
          )}
          <div>
            <label className="label">Photos du produit <span className="text-ink-muted">(5 max)</span></label>
            <input type="file" accept="image/*" multiple className="input py-2" onChange={e => setForm(f => ({ ...f, images: Array.from(e.target.files).slice(0, 5) }))} />
            {form.images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {form.images.map((file, i) => (
                  <img key={i} src={URL.createObjectURL(file)} className="w-14 h-14 object-cover rounded-lg border border-cream-300" />
                ))}
              </div>
            )}
            {editing?.images_urls?.length > 0 && form.images.length === 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {editing.images_urls.map((url, i) => (
                  <img key={i} src={url} className="w-14 h-14 object-cover rounded-lg border border-cream-300" />
                ))}
              </div>
            )}
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
            {saving ? <span className="w-4 h-4 rounded-full border-2 border-ivory-100/30 border-t-ivory-100 animate-spin" /> : <><Check size={16} /> {editing ? 'Mettre à jour' : 'Créer'}</>}
          </button>
        </form>
      </Modal>

      {/* Modal variantes */}
      <Modal open={!!variantModal} onClose={() => setVariantModal(null)} title={`Variantes — ${variantModal?.name}`} size="lg">
        <div className="space-y-4">
          {variantModal?.variants?.length > 0 && (
            <div className="space-y-2">
              {variantModal.variants.map(v => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-cream-100">
                  <span className="text-sm font-medium text-ink">{v.label}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-ink-muted">Stock : <strong className={v.stock_qty <= 3 ? 'text-red-500' : 'text-ink'}>{v.stock_qty}</strong></span>
                    {v.price_override && <span className="text-sm text-olive">{Number(v.price_override).toFixed(2)} €</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="divider" />
          <h3 className="font-display text-lg text-ink">Ajouter une variante</h3>
          <form onSubmit={handleAddVariant} className="space-y-3">
            <div><label className="label">Label (ex: M / Rouge)</label><input className="input" value={variantForm.label} onChange={e => setVariantForm(f => ({ ...f, label: e.target.value }))} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Stock</label><input type="number" className="input" value={variantForm.stock_qty} onChange={e => setVariantForm(f => ({ ...f, stock_qty: e.target.value }))} /></div>
              <div><label className="label">Prix spécifique (€) <span className="text-ink-muted">optionnel</span></label><input type="number" step="0.01" className="input" value={variantForm.price_override} onChange={e => setVariantForm(f => ({ ...f, price_override: e.target.value }))} /></div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <span className="w-4 h-4 rounded-full border-2 border-ivory-100/30 border-t-ivory-100 animate-spin" /> : <><Plus size={15} /> Ajouter</>}
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}
