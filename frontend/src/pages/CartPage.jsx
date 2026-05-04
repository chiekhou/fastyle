import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Sparkles, Truck } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useCartStore } from '../store/cartStore';
import { orderApi } from '../api';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/ui/EmptyState';
import { CARRIERS, FREE_THRESHOLD, getShippingCost } from '../utils/shipping';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const subtotal    = useCartStore(s => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0));
  const totalWeight = useCartStore(s => s.items.reduce((sum, i) => sum + (i.weight_grams || 250) * i.quantity, 0));

  const [carrier, setCarrier]   = useState('mondial_relay');
  const [order, setOrder]       = useState(null);
  const [paypalId, setPaypalId] = useState(null);
  const [step, setStep]         = useState('cart'); // cart | address | payment | done
  const [address, setAddress]   = useState({ full_name: user?.full_name || '', street: '', city: '', zip: '', country: 'France' });
  const [creating, setCreating] = useState(false);

  const shippingCost = getShippingCost(carrier, totalWeight, subtotal);
  const isFree       = subtotal >= FREE_THRESHOLD;
  const grandTotal   = subtotal + shippingCost;

  const handleCreateOrder = async () => {
    if (!user) { navigate('/login', { state: { from: { pathname: '/panier' } } }); return; }
    setCreating(true);
    try {
      const { data } = await orderApi.create({
        items: items.map(i => ({ product_id: i.product_id, variant_id: i.variant_id, quantity: i.quantity })),
        shipping_address: address,
        shipping_carrier: carrier,
      });
      setOrder(data.data.order);
      setPaypalId(data.data.paypal_order_id);
      setStep('payment');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la commande.');
    } finally {
      setCreating(false);
    }
  };

  const onPaypalApprove = async (data) => {
    try {
      await orderApi.capture(order.id, data.orderID);
      clearCart();
      toast.success('Commande confirmée ! Un email vous a été envoyé.');
      setStep('done');
    } catch {
      toast.error('Erreur lors du paiement.');
    }
  };

  if (step === 'done') return (
    <div className="section">
      <div className="container-app max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-olive/10 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={40} className="text-olive" />
        </div>
        <h1 className="font-display text-3xl text-ink mb-3">Commande confirmée !</h1>
        <p className="text-ink-muted mb-8">Merci pour votre achat. Vous recevrez un email de confirmation.</p>
        <div className="flex flex-col gap-3">
          <Link to="/compte" className="btn-primary justify-center">Voir mes commandes</Link>
          <Link to="/boutique" className="btn-secondary justify-center">Continuer mes achats</Link>
        </div>
      </div>
    </div>
  );

  return (
    <PayPalScriptProvider options={{ 'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID, currency: 'EUR' }}>
      <div className="section animate-fade-in">
        <div className="container-app max-w-4xl">
          <h1 className="font-display text-3xl text-ink mb-8">Mon panier</h1>

          {items.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Votre panier est vide"
              description="Découvrez notre boutique et ajoutez des produits."
              action={<Link to="/boutique" className="btn-primary">Voir la boutique</Link>}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Articles + formulaires */}
              <div className="lg:col-span-2 space-y-4">
                {step === 'address' && (
                  <div className="card p-6 space-y-4 animate-slide-up">
                    <h2 className="font-display text-xl text-ink">Adresse de livraison</h2>
                    {[
                      { name: 'full_name', label: 'Nom complet',  placeholder: 'Marie Dupont' },
                      { name: 'street',    label: 'Adresse',      placeholder: '12 rue des Roses' },
                      { name: 'city',      label: 'Ville',        placeholder: 'Paris' },
                      { name: 'zip',       label: 'Code postal',  placeholder: '75001' },
                      { name: 'country',   label: 'Pays',         placeholder: 'France' },
                    ].map(f => (
                      <div key={f.name}>
                        <label className="label">{f.label}</label>
                        <input className="input" placeholder={f.placeholder} value={address[f.name]}
                          onChange={e => setAddress(a => ({ ...a, [f.name]: e.target.value }))} />
                      </div>
                    ))}
                    {carrier === 'mondial_relay' && (
                      <p className="text-xs text-ink-muted bg-cream-200 rounded-xl px-4 py-3">
                        Mondial Relay : vous serez contacté après la commande pour choisir votre point relais.
                      </p>
                    )}
                  </div>
                )}

                {step === 'payment' && (
                  <div className="card p-6 animate-slide-up">
                    <h2 className="font-display text-xl text-ink mb-4">Paiement</h2>
                    <PayPalButtons
                      style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
                      createOrder={() => Promise.resolve(paypalId)}
                      onApprove={onPaypalApprove}
                      onError={() => toast.error('Erreur PayPal.')}
                    />
                  </div>
                )}

                {step === 'cart' && items.map(item => (
                  <div key={item.key} className="card p-4 flex gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-olive/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {item.image_url
                        ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        : <Sparkles size={20} className="text-olive/40" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink truncate">{item.name}</p>
                      {item.variant_label && <p className="text-xs text-ink-muted">{item.variant_label}</p>}
                      <p className="text-olive font-semibold mt-1">{Number(item.price).toFixed(2)} €</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-cream-300 flex items-center justify-center hover:bg-cream-400 transition-colors">
                          <Minus size={13} />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-cream-300 flex items-center justify-center hover:bg-cream-400 transition-colors">
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-ink">{(item.price * item.quantity).toFixed(2)} €</p>
                      <button onClick={() => removeItem(item.key)}
                        className="mt-2 text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Résumé */}
              <div className="lg:col-span-1">
                <div className="card p-6 sticky top-24 space-y-4">
                  <h2 className="font-display text-xl text-ink">Résumé</h2>

                  {/* Articles */}
                  <div className="space-y-2 text-sm">
                    {items.map(i => (
                      <div key={i.key} className="flex justify-between text-ink-muted">
                        <span className="truncate max-w-[150px]">{i.name} ×{i.quantity}</span>
                        <span>{(i.price * i.quantity).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>

                  <div className="divider" />

                  {/* Sélecteur transporteur */}
                  {step !== 'payment' && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
                        <Truck size={13} /> Livraison
                      </p>
                      {isFree && (
                        <p className="text-xs text-green-700 bg-green-50 rounded-xl px-3 py-2 font-medium">
                          Livraison offerte à partir de {FREE_THRESHOLD} €
                        </p>
                      )}
                      <div className="space-y-2">
                        {Object.values(CARRIERS).map(c => {
                          const price = getShippingCost(c.id, totalWeight, subtotal);
                          return (
                            <label key={c.id}
                              className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-colors ${
                                carrier === c.id
                                  ? 'border-olive bg-olive/5'
                                  : 'border-cream-300 hover:border-olive/40'
                              }`}>
                              <input type="radio" name="carrier" value={c.id}
                                checked={carrier === c.id}
                                onChange={() => setCarrier(c.id)}
                                className="mt-0.5 accent-olive" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-ink">{c.name}</p>
                                <p className="text-xs text-ink-muted">{c.description}</p>
                              </div>
                              <span className={`text-sm font-semibold shrink-0 ${isFree ? 'text-green-600' : 'text-olive'}`}>
                                {isFree ? 'OFFERT' : `${price.toFixed(2)} €`}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="divider" />

                  {/* Totaux */}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-ink-muted">
                      <span>Sous-total</span>
                      <span>{subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-ink-muted">
                      <span>Livraison</span>
                      <span className={isFree ? 'text-green-600 font-medium' : ''}>
                        {isFree ? 'OFFERT' : `${shippingCost.toFixed(2)} €`}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between font-display text-xl text-ink pt-1">
                    <span>Total</span>
                    <span className="text-olive">{grandTotal.toFixed(2)} €</span>
                  </div>

                  {step === 'cart' && (
                    <button onClick={() => setStep('address')} className="btn-primary w-full justify-center">
                      Commander <ArrowRight size={16} />
                    </button>
                  )}
                  {step === 'address' && (
                    <button onClick={handleCreateOrder} disabled={creating} className="btn-primary w-full justify-center">
                      {creating
                        ? <span className="w-4 h-4 rounded-full border-2 border-ivory-100/30 border-t-ivory-100 animate-spin" />
                        : <>Payer {grandTotal.toFixed(2)} € <ArrowRight size={16} /></>}
                    </button>
                  )}

                  <Link to="/boutique" className="btn-secondary w-full justify-center text-sm">
                    Continuer mes achats
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
