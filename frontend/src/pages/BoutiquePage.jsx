import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Search, Filter, Plus, Sparkles } from 'lucide-react';
import { productApi } from '../api';
import { useCartStore } from '../store/cartStore';
import Spinner from '../components/ui/Spinner';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: '',         label: 'Tout' },
  { value: 'cosmetic', label: 'Cosmétiques' },
  { value: 'clothing', label: 'Vêtements' },
];

export default function BoutiquePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const category = searchParams.get('category') || '';
  const page     = parseInt(searchParams.get('page') || '1');

  const fetchProducts = (params = {}) => {
    setLoading(true);
    productApi.getAll({ page, limit: 12, category, search, ...params })
      .then(r => {
        setProducts(r.data.data);
        setPagination(r.data.pagination);
      })
      .catch(() => toast.error('Erreur lors du chargement.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [category, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts({ search, page: 1 });
    setSearchParams(prev => { prev.set('page', '1'); return prev; });
  };

  const handleCategory = (cat) => {
    setSearchParams(cat ? { category: cat } : {});
  };

  const handlePage = (p) => {
    setSearchParams(prev => { prev.set('page', String(p)); return prev; });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-ink py-16 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-olive/10 blur-3xl" />
        <div className="container-app relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-olive/20 text-olive-300 text-sm font-medium mb-4">
            <ShoppingBag size={14} /> Notre sélection
          </span>
          <h1 className="font-display text-5xl text-ivory-100 mb-3">La Boutique</h1>
          <p className="text-cream-400 max-w-lg mx-auto">
            Cosmétiques et vêtements sélectionnés avec soin — livraison disponible.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-app">
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Catégories */}
            <div className="flex gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => handleCategory(c.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    category === c.value
                      ? 'bg-olive text-ivory-100'
                      : 'bg-cream-300 text-ink-soft hover:bg-cream-400'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            {/* Recherche */}
            <form onSubmit={handleSearch} className="flex gap-2 sm:ml-auto">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher…"
                  className="input pl-9 py-2 w-48"
                />
              </div>
              <button type="submit" className="btn-secondary py-2 px-4">
                <Filter size={15} />
              </button>
            </form>
          </div>

          {loading ? <Spinner /> : products.length === 0 ? (
            <EmptyState icon={ShoppingBag} title="Aucun produit trouvé" description="Essayez une autre catégorie ou un autre terme." />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              <Pagination pagination={pagination} onPageChange={handlePage} />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }) {
  const addItem = useCartStore(s => s.addItem);

  const handleAdd = (e) => {
    e.preventDefault();
    if (product.has_variants) return; // Rediriger vers fiche produit
    if (product.stock_qty <= 0) return toast.error('Produit épuisé.');
    addItem(product);
    toast.success('Ajouté au panier !');
  };

  return (
    <Link to={`/boutique/${product.id}`} className="card-hover group flex flex-col">
      <div className="aspect-square bg-olive/10 relative overflow-hidden flex items-center justify-center">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <Sparkles size={32} className="text-olive/30" />
        )}
        {product.stock_qty === 0 && !product.has_variants && (
          <div className="absolute inset-0 bg-ink/40 flex items-center justify-center">
            <span className="bg-white text-ink text-xs font-semibold px-3 py-1 rounded-full">Épuisé</span>
          </div>
        )}
        <span className={`absolute top-2 left-2 badge ${product.category === 'cosmetic' ? 'badge-olive' : 'badge-cream'}`}>
          {product.category === 'cosmetic' ? 'Cosmétique' : 'Vêtement'}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display text-base text-ink line-clamp-2 mb-1 flex-1">{product.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="font-display text-xl text-olive">{Number(product.price).toFixed(2)} €</span>
          <button
            onClick={handleAdd}
            className="w-8 h-8 rounded-xl bg-olive/10 flex items-center justify-center text-olive hover:bg-olive hover:text-ivory-100 transition-all"
            title={product.has_variants ? 'Voir les options' : 'Ajouter au panier'}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}
