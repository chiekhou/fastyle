import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Calendar,
  Package,
  Lock,
  ChevronRight,
  Home,
} from "lucide-react";
import { reservationApi, orderApi, userApi } from "../api";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/ui/StatusBadge";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import toast from "react-hot-toast";

const TABS = [
  { id: "profile", label: "Mon profil", icon: User },
  { id: "reservations", label: "Réservations", icon: Calendar },
  { id: "orders", label: "Commandes", icon: Package },
  { id: "password", label: "Mot de passe", icon: Lock },
];

const PERIOD = { morning: "Matin", afternoon: "Après-midi", evening: "Soir" };

export default function AccountPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("profile");
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingR, setLoadingR] = useState(false);
  const [loadingO, setLoadingO] = useState(false);
  const [profile, setProfile] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
  });
  const [pwd, setPwd] = useState({ current_password: "", new_password: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tab === "reservations" && reservations.length === 0) {
      setLoadingR(true);
      reservationApi
        .getMine()
        .then((r) => setReservations(r.data.data))
        .finally(() => setLoadingR(false));
    }
    if (tab === "orders" && orders.length === 0) {
      setLoadingO(true);
      orderApi
        .getMine()
        .then((r) => setOrders(r.data.data))
        .finally(() => setLoadingO(false));
    }
  }, [tab]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userApi.updateProfile(profile);
      toast.success("Profil mis à jour.");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Erreur lors de la sauvegarde.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePwd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userApi.changePassword(pwd);
      toast.success("Mot de passe modifié.");
      setPwd({ current_password: "", new_password: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    if (
      !window.confirm(
        "Annuler cette réservation ? L'acompte sera remboursé si déjà payé.",
      )
    )
      return;
    try {
      await reservationApi.cancel(id, "Annulation cliente");
      setReservations((r) =>
        r.map((rv) => (rv.id === id ? { ...rv, status: "cancelled" } : rv)),
      );
      toast.success("Réservation annulée.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur.");
    }
  };

  return (
    <div className="section animate-fade-in">
      <div className="container-app max-w-4xl">
        <h1 className="font-display text-3xl text-ink mb-8">Mon compte</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="card p-2 space-y-1">
              <div className="px-4 py-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-olive/20 flex items-center justify-center mb-2">
                  <span className="font-display text-xl text-olive">
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="font-medium text-ink text-sm truncate">
                  {user?.full_name}
                </p>
                <p className="text-xs text-ink-muted truncate">{user?.email}</p>
              </div>
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    tab === id
                      ? "bg-olive text-ivory-100"
                      : "text-ink-soft hover:bg-cream-300"
                  }`}
                >
                  <Icon size={16} /> {label}
                  <ChevronRight size={14} className="ml-auto opacity-50" />
                </button>
              ))}
              <Link
                to="/"
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-ink-soft hover:bg-cream-300 transition-all"
              >
                <Home size={16} /> Accueil
                <ChevronRight size={14} className="ml-auto opacity-50" />
              </Link>
            </div>
          </aside>

          {/* Contenu */}
          <div className="md:col-span-3">
            {/* Profil */}
            {tab === "profile" && (
              <div className="card p-6 animate-slide-up">
                <h2 className="font-display text-xl text-ink mb-6">
                  Mes informations
                </h2>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="label">Nom complet</label>
                    <input
                      className="input"
                      value={profile.full_name}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, full_name: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      className="input bg-cream-100 cursor-not-allowed"
                      value={user?.email}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="label">Téléphone</label>
                    <input
                      className="input"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? (
                      <span className="w-4 h-4 rounded-full border-2 border-ivory-100/30 border-t-ivory-100 animate-spin" />
                    ) : (
                      "Enregistrer"
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Réservations */}
            {tab === "reservations" && (
              <div className="card overflow-hidden animate-slide-up">
                <div className="px-6 py-4 border-b border-cream-300">
                  <h2 className="font-display text-xl text-ink">
                    Mes réservations
                  </h2>
                </div>
                {loadingR ? (
                  <Spinner />
                ) : reservations.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title="Aucune réservation"
                    description="Réservez votre première prestation !"
                    action={
                      <a href="/reservation" className="btn-primary">
                        Réserver
                      </a>
                    }
                  />
                ) : (
                  <div className="divide-y divide-cream-200">
                    {reservations.map((r) => (
                      <div
                        key={r.id}
                        className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-ink">
                            {r.service?.name}
                          </p>
                          <p className="text-sm text-ink-muted mt-0.5">
                            {new Date(
                              r.reservation_date + "T12:00:00",
                            ).toLocaleDateString("fr-FR", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                            {r.slot?.period && ` — ${PERIOD[r.slot.period]}`}
                          </p>
                          <p className="text-xs text-ink-muted mt-0.5">
                            Total : {Number(r.total_price).toFixed(2)} € ·
                            Acompte : {Number(r.deposit_amount).toFixed(2)} €
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <StatusBadge status={r.status} />
                          {["pending", "confirmed"].includes(r.status) && (
                            <button
                              onClick={() => handleCancel(r.id)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Annuler
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Commandes */}
            {tab === "orders" && (
              <div className="card overflow-hidden animate-slide-up">
                <div className="px-6 py-4 border-b border-cream-300">
                  <h2 className="font-display text-xl text-ink">
                    Mes commandes
                  </h2>
                </div>
                {loadingO ? (
                  <Spinner />
                ) : orders.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="Aucune commande"
                    description="Découvrez notre boutique !"
                    action={
                      <a href="/boutique" className="btn-primary">
                        Boutique
                      </a>
                    }
                  />
                ) : (
                  <div className="divide-y divide-cream-200">
                    {orders.map((o) => (
                      <div key={o.id} className="px-6 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-ink-muted font-mono">
                            #{o.id.slice(0, 8).toUpperCase()}
                          </p>
                          <StatusBadge status={o.status} />
                        </div>
                        <p className="text-sm text-ink-muted mb-1">
                          {new Date(o.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <div className="space-y-1">
                          {o.items?.map((item) => (
                            <p key={item.id} className="text-sm text-ink">
                              {item.product_name_snapshot}
                              {item.variant_label_snapshot
                                ? ` — ${item.variant_label_snapshot}`
                                : ""}{" "}
                              x{item.quantity}
                            </p>
                          ))}
                        </div>
                        <p className="font-semibold text-ink mt-2">
                          {Number(o.total_price).toFixed(2)} €
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Mot de passe */}
            {tab === "password" && (
              <div className="card p-6 animate-slide-up">
                <h2 className="font-display text-xl text-ink mb-6">
                  Changer de mot de passe
                </h2>
                <form onSubmit={handleChangePwd} className="space-y-4">
                  <div>
                    <label className="label">Mot de passe actuel</label>
                    <input
                      type="password"
                      className="input"
                      value={pwd.current_password}
                      onChange={(e) =>
                        setPwd((p) => ({
                          ...p,
                          current_password: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Nouveau mot de passe</label>
                    <input
                      type="password"
                      className="input"
                      value={pwd.new_password}
                      onChange={(e) =>
                        setPwd((p) => ({ ...p, new_password: e.target.value }))
                      }
                      placeholder="8 caractères, 1 majuscule, 1 chiffre"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? (
                      <span className="w-4 h-4 rounded-full border-2 border-ivory-100/30 border-t-ivory-100 animate-spin" />
                    ) : (
                      "Modifier"
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
