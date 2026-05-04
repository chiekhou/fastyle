import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { serviceApi } from '../api';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    serviceApi.getAll()
      .then(r => setServices(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="bg-ink py-20 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-olive/10 blur-3xl" />
        <div className="container-app relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-olive/20 text-olive-300 text-sm font-medium mb-4">
            <Sparkles size={14} /> Nos soins
          </span>
          <h1 className="font-display text-5xl text-ivory-100 mb-4">Nos prestations</h1>
          <p className="text-cream-400 max-w-xl mx-auto text-lg">
            Des soins adaptés à chaque besoin, réalisés avec des produits soigneusement sélectionnés.
          </p>
        </div>
      </section>

      {/* ── Comment ça marche ───────────────────────────── */}
      <section className="bg-cream-100 py-10 border-b border-cream-300">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0 text-sm text-ink-muted">
            {[
              { step: '1', label: 'Choisissez une prestation' },
              { step: '2', label: 'Sélectionnez une date et un créneau' },
              { step: '3', label: 'Réglez l\'acompte de 50% via PayPal' },
              { step: '4', label: 'Confirmé par email ✓' },
            ].map(({ step, label }, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-olive text-ivory-100 text-xs font-bold flex items-center justify-center shrink-0">
                    {step}
                  </div>
                  <span className="font-medium text-ink-soft">{label}</span>
                </div>
                {i < 3 && (
                  <ArrowRight size={16} className="hidden sm:block text-cream-400 mx-3 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Liste prestations ───────────────────────────── */}
      <section className="section">
        <div className="container-app">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="card overflow-hidden">
                  <div className="skeleton h-48 rounded-none" />
                  <div className="p-6 space-y-3">
                    <div className="skeleton h-5 w-2/3" />
                    <div className="skeleton h-3 w-full" />
                    <div className="skeleton h-3 w-4/5" />
                    <div className="skeleton h-9 w-full mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Aucune prestation disponible"
              description="Revenez bientôt, notre catalogue se remplit !"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(svc => <ServiceCard key={svc.id} service={svc} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="section bg-cream-100">
        <div className="container-app text-center">
          <h2 className="font-display text-3xl text-ink mb-3">Une question sur nos soins ?</h2>
          <p className="text-ink-muted mb-6">Contactez-nous, nous vous répondrons dans les plus brefs délais.</p>
          <a href="mailto:contact@fastyle.fr" className="btn-outline">
            Nous contacter
          </a>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ service }) {
  return (
    <div className="card group flex flex-col">
      {/* Image */}
      <div className="h-48 bg-olive/10 relative overflow-hidden flex items-center justify-center">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <Sparkles size={40} className="text-olive/30" />
        )}
        {/* Badge durée */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1 flex items-center gap-1.5 text-xs font-medium text-ink shadow-card">
          <Clock size={12} className="text-olive" />
          {service.duration_minutes} min
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-display text-xl text-ink mb-2">{service.name}</h3>
        <p className="text-sm text-ink-muted leading-relaxed flex-1 mb-5">
          {service.description || 'Prenez soin de vous avec ce soin professionnel.'}
        </p>

        {/* Prix */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="font-display text-3xl text-olive">{Number(service.price).toFixed(0)} €</span>
            <p className="text-xs text-ink-muted mt-0.5">
              Acompte : <span className="font-semibold text-ink">{(service.price * 0.5).toFixed(0)} €</span> via PayPal
            </p>
          </div>
        </div>

        <Link
          to={`/reservation?service=${service.id}`}
          className="btn-primary w-full justify-center"
        >
          <Calendar size={16} />
          Réserver ce soin
        </Link>
      </div>
    </div>
  );
}
