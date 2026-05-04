import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  ShoppingBag,
  Shield,
  Clock,
  Sparkles,
} from "lucide-react";
import { serviceApi, reviewApi } from "../api";
import StarRating from "../components/ui/StarRating";
import Spinner from "../components/ui/Spinner";

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: null, average: null });
  const [loadingSvc, setLoadingSvc] = useState(true);

  useEffect(() => {
    serviceApi
      .getAll()
      .then((r) => setServices(r.data.data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoadingSvc(false));
    reviewApi
      .getPublic({ limit: 6 })
      .then((r) => setReviews(r.data.data))
      .catch(() => {});
    reviewApi
      .getStats()
      .then((r) => setStats(r.data.data))
      .catch(() => {});
  }, []);

  return (
    <div className="animate-fade-in">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink min-h-[92vh] flex items-center">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-olive/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-cream-200/5 blur-3xl" />

        <div className="container-app relative z-10 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-olive/20 text-olive-300 text-sm font-medium mb-6">
              <Sparkles size={14} /> Votre espace beauté en ligne
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-ivory-100 leading-tight mb-6">
              La beauté, <em className="text-olive-300 not-italic">à votre</em>{" "}
              rythme
            </h1>
            <p className="text-cream-400 text-lg leading-relaxed mb-10 max-w-lg">
              Réservez vos prestations en quelques clics, découvrez notre
              boutique de cosmétiques et de vêtements sélectionnés avec soin.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/reservation"
                className="btn-primary text-base px-8 py-4"
              >
                <Calendar size={18} /> Réserver maintenant
              </Link>
              <Link
                to="/boutique"
                className="inline-flex items-center gap-2 text-base px-8 py-4 rounded-2xl border-2 border-cream-500 text-cream-300 font-medium transition-all hover:bg-white/10"
              >
                <ShoppingBag size={18} /> Voir la boutique
              </Link>
            </div>
            <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
              {[
                {
                  value: stats.total !== null ? `${stats.total}` : '—',
                  label: 'Avis approuvés',
                },
                {
                  value: stats.average !== null ? `${stats.average}★` : '—',
                  label: 'Note moyenne',
                },
                { value: '3', label: 'Créneaux / jour' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="font-display text-2xl text-ivory-100">
                    {value}
                  </p>
                  <p className="text-xs text-cream-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Carte flottante */}
          <div className="hidden lg:flex justify-center">
            <div className="relative">
              <div className="w-72 rounded-4xl bg-cream-200 p-6 shadow-hover">
                <div className="w-full h-52 rounded-3xl bg-olive/20 mb-4 flex items-center justify-center">
                  <Sparkles size={48} className="text-olive-300 opacity-60" />
                </div>
                <h3 className="font-display text-lg text-ink mb-1">
                  Soin du visage
                </h3>
                <p className="text-sm text-ink-muted mb-4">
                  Nettoyage profond, gommage et masque hydratant
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl text-olive">55 €</span>
                  <Link
                    to="/reservation"
                    className="btn-primary py-2 px-4 text-sm"
                  >
                    Réserver
                  </Link>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-olive text-ivory-100 rounded-2xl px-4 py-2 shadow-hover text-sm font-medium">
                Acompte 50% seulement
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-3 shadow-card flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-medium text-ink">
                  Disponible aujourd'hui
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Avantages ─────────────────────────────────────── */}
      <section className="section bg-cream-100">
        <div className="container-app">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: "Réservation simple",
                desc: "3 créneaux par jour — matin, après-midi, soir. Choisissez ce qui vous convient.",
              },
              {
                icon: Shield,
                title: "Acompte sécurisé",
                desc: "Paiement de 50% via PayPal pour confirmer votre rendez-vous en toute sécurité.",
              },
              {
                icon: Clock,
                title: "Confirmation rapide",
                desc: "Recevez votre confirmation par email dès la réservation validée.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 flex gap-4">
                <div className="w-11 h-11 rounded-2xl bg-olive/10 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-olive" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-ink mb-1">
                    {title}
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Prestations ───────────────────────────────────── */}
      <section className="section">
        <div className="container-app">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-medium text-olive uppercase tracking-widest">
                Nos soins
              </span>
              <h2 className="section-title mt-1">Nos prestations</h2>
            </div>
            <Link
              to="/services"
              className="flex items-center gap-1 text-sm text-olive font-medium hover:gap-2 transition-all"
            >
              Tout voir <ArrowRight size={15} />
            </Link>
          </div>

          {loadingSvc ? (
            <Spinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.length > 0
                ? services.map((svc) => (
                    <ServiceCard key={svc.id} service={svc} />
                  ))
                : [1, 2, 3].map((i) => (
                    <div key={i} className="card overflow-hidden">
                      <div className="skeleton h-44 rounded-none" />
                      <div className="p-5 space-y-3">
                        <div className="skeleton h-5 w-3/4" />
                        <div className="skeleton h-3 w-full" />
                        <div className="skeleton h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/reservation" className="btn-primary">
              <Calendar size={17} /> Prendre rendez-vous
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Boutique ──────────────────────────────────── */}
      <section className="section bg-olive">
        <div className="container-app text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-ivory-100 text-sm font-medium mb-4">
            Nouveautés disponibles
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-ivory-100 mb-4">
            Découvrez la boutique
          </h2>
          <p className="text-olive-100 max-w-xl mx-auto mb-8 text-lg">
            Cosmétiques soigneusement sélectionnés et vêtements tendance —
            livraison disponible.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/boutique?category=cosmetic"
              className="btn-secondary bg-white text-olive hover:bg-ivory-100 border-0"
            >
              <Sparkles size={17} /> Cosmétiques
            </Link>
            <Link
              to="/boutique?category=clothing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-ivory-100/50 text-ivory-100 font-medium hover:bg-white/10 transition-all"
            >
              <ShoppingBag size={17} /> Vêtements
            </Link>
          </div>
        </div>
      </section>

      {/* ── Avis ──────────────────────────────────────────── */}
      {reviews.length > 0 && (
        <section className="section">
          <div className="container-app">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-xs font-medium text-olive uppercase tracking-widest">
                  Témoignages
                </span>
                <h2 className="section-title mt-1">Ce qu'elles disent</h2>
              </div>
              <Link
                to="/avis"
                className="flex items-center gap-1 text-sm text-olive font-medium hover:gap-2 transition-all"
              >
                Tous les avis <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA final ─────────────────────────────────────── */}
      <section className="section bg-cream-100">
        <div className="container-app text-center">
          <h2 className="font-display text-4xl text-ink mb-4">
            Prête pour votre prochain soin ?
          </h2>
          <p className="text-ink-muted mb-8 text-lg">
            Réservez en 2 minutes, confirmez avec un acompte de 50%.
          </p>
          <Link to="/reservation" className="btn-primary text-base px-10 py-4">
            <Calendar size={18} /> Réserver ma prestation
          </Link>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ service }) {
  return (
    <div className="card-hover group">
      <div className="h-44 bg-olive/10 flex items-center justify-center relative overflow-hidden">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <Sparkles size={36} className="text-olive/40" />
        )}
        <div className="absolute top-3 right-3 bg-white rounded-xl px-3 py-1 text-xs font-medium text-ink shadow-card">
          {service.duration_minutes} min
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl text-ink mb-1">{service.name}</h3>
        <p className="text-sm text-ink-muted mb-4 line-clamp-2">
          {service.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-display text-2xl text-olive">
              {service.price} €
            </span>
            <span className="text-xs text-ink-muted ml-2">
              — acompte {(service.price * 0.5).toFixed(0)} €
            </span>
          </div>
          <Link
            to="/reservation"
            className="flex items-center gap-1 text-sm font-medium text-olive group-hover:gap-2 transition-all"
          >
            Réserver <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="card p-6">
      <StarRating value={review.rating} readonly size={16} />
      <p className="text-sm text-ink-soft mt-3 leading-relaxed line-clamp-4">
        "{review.comment}"
      </p>
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-cream-300">
        <div className="w-8 h-8 rounded-full bg-olive/20 flex items-center justify-center">
          <span className="text-olive text-sm font-semibold">
            {review.user?.full_name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-ink">
            {review.user?.full_name}
          </p>
          <p className="text-xs text-ink-muted">
            {new Date(review.createdAt).toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
