import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Plus, Minus, Sparkles, AlertTriangle } from 'lucide-react';
import { productApi } from '../api';
import { useCartStore } from '../store/cartStore';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const { id }    = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImg, setMainImg] = useState(null);
  const addItem = useCartStore(s => s.addItem);

  useEffect(() => {
    productApi.getOne(id)
      .then(r => {
        setProduct(r.data.data);
        setMainImg(r.data.data.image_url);
      })
      .catch(() => toast.error('Produit introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner fullPage />;
  if (!product) return (
    <div className="section container-app text-center">
      <p className="text-ink-muted">Produit introuvable.</p>
      <Link to="/boutique" className="btn-primary mt-4 inline-flex">Retour à la boutique</Link>
    </div>
  );

  const activeVariant = selectedVariant;
  const price    = activeVariant?.price_override ?? product.price;
  const stock    = product.has_variants ? (activeVariant?.stock_qty ?? null) : product.stock_qty;
  const inStock  = stock === null ? false : stock > 0;
  const images   = [product.image_url, ...(product.images_urls || [])].filter(Boolean);

  const handleAdd = () => {
    if (product.has_variants && !selectedVariant) return toast.error('Veuillez choisir une option.');
    if (!inStock) return toast.error('Produit épuisé.');
    addItem(product, selectedVariant, quantity);
    toast.success('Ajouté au panier !');
  };

  return (
    <div className="section animate-fade-in">
      <div className="container-app">
        <Link to="/boutique" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink mb-8 transition-colors">
          <ArrowLeft size={16} /> Retour à la boutique
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square rounded-3xl overflow-hidden bg-olive/10 flex items-center justify-center">
              {mainImg ? (
                <img src={mainImg} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <Sparkles size={56} className="text-olive/30" />
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setMainImg(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${mainImg === img ? 'border-olive' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Infos */}
          <div className="space-y-6">
            <div>
              <span className={`badge mb-3 ${product.category === 'cosmetic' ? 'badge-olive' : 'badge-cream'}`}>
                {product.category === 'cosmetic' ? 'Cosmétique' : 'Vêtement'}
              </span>
              <h1 className="font-display text-3xl text-ink mb-2">{product.name}</h1>
              <p className="font-display text-4xl text-olive">{Number(price).toFixed(2)} €</p>
            </div>

            {product.description && (
              <p className="text-ink-muted leading-relaxed">{product.description}</p>
            )}

            {/* Variantes */}
            {product.has_variants && product.variants?.length > 0 && (
              <div>
                <label className="label">Choisir une option</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.filter(v => v.is_active).map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      disabled={v.stock_qty === 0}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                        selectedVariant?.id === v.id
                          ? 'border-olive bg-olive/10 text-olive'
                          : v.stock_qty === 0
                          ? 'border-cream-300 text-ink-muted line-through cursor-not-allowed opacity-50'
                          : 'border-cream-300 text-ink-soft hover:border-olive'
                      }`}
                    >
                      {v.label}
                      {v.stock_qty === 0 && ' (épuisé)'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            {stock !== null && stock <= 5 && stock > 0 && (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <AlertTriangle size={15} /> Plus que {stock} en stock !
              </div>
            )}

            {/* Quantité */}
            <div>
              <label className="label">Quantité</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl bg-cream-300 flex items-center justify-center hover:bg-cream-400 transition-colors">
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-semibold text-ink">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(stock ?? 99, q + 1))}
                  className="w-9 h-9 rounded-xl bg-cream-300 flex items-center justify-center hover:bg-cream-400 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleAdd}
              disabled={!inStock || (product.has_variants && !selectedVariant)}
              className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={18} />
              {!inStock ? 'Épuisé' : 'Ajouter au panier'}
            </button>

            {/* Infos livraison */}
            <div className="card p-4 text-sm text-ink-muted space-y-1">
              <p>🚚 Livraison disponible — délai communiqué par email</p>
              <p>🔒 Paiement sécurisé via PayPal</p>
              <p>↩️ Retours acceptés sous 14 jours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
