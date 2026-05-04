import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, CreditCard, ChevronLeft, ChevronRight, Sparkles, Sun, Sunset, Moon } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { serviceApi, slotApi, reservationApi } from '../api';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';

/* ── Constantes ──────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Prestation' },
  { id: 2, label: 'Date & Créneau' },
  { id: 3, label: 'Acompte' },
  { id: 4, label: 'Confirmation' },
];

const PERIOD_CONFIG = {
  morning:   { label: 'Matin',        icon: Sun,    time: '9h – 12h',  color: 'bg-amber-50 border-amber-200 text-amber-700' },
  afternoon: { label: 'Après-midi',   icon: Sunset, time: '14h – 17h', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  evening:   { label: 'Soir',         icon: Moon,   time: '17h – 19h', color: 'bg-purple-50 border-purple-200 text-purple-700' },
};

/* ── Composant stepper ───────────────────────────────────── */
function Stepper({ currentStep }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 ${
              currentStep > step.id  ? 'bg-olive border-olive text-ivory-100' :
              currentStep === step.id ? 'bg-white border-olive text-olive shadow-soft' :
              'bg-white border-cream-300 text-ink-muted'
            }`}>
              {currentStep > step.id ? <CheckCircle size={16} /> : step.id}
            </div>
            <span className={`text-xs mt-1.5 font-medium hidden sm:block ${
              currentStep >= step.id ? 'text-olive' : 'text-ink-muted'
            }`}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-16 sm:w-24 h-0.5 mx-1 sm:mx-2 mb-4 transition-all duration-500 ${
              currentStep > step.id ? 'bg-olive' : 'bg-cream-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Page principale ─────────────────────────────────────── */
export default function ReservationPage() {
  const [searchParams]      = useSearchParams();
  const navigate            = useNavigate();

  const [step, setStep]             = useState(1);
  const [services, setServices]     = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedMonth, setSelectedMonth]     = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [slots, setSlots]           = useState([]);
  const [selectedDate, setSelectedDate]   = useState(null);
  const [selectedSlot, setSelectedSlot]   = useState(null);
  const [notes, setNotes]           = useState('');
  const [reservation, setReservation]     = useState(null);
  const [paypalOrderId, setPaypalOrderId] = useState(null);
  const [loadingSvc, setLoadingSvc] = useState(true);
  const [loadingSlots, setLoadingSlots]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* Charger les prestations */
  useEffect(() => {
    serviceApi.getAll()
      .then(r => {
        const svcs = r.data.data;
        setServices(svcs);
        const preselected = searchParams.get('service');
        if (preselected) {
          const found = svcs.find(s => s.id === preselected);
          if (found) setSelectedService(found);
        }
      })
      .finally(() => setLoadingSvc(false));
  }, []);

  /* Charger les créneaux quand le mois change */
  useEffect(() => {
    if (!selectedMonth) return;
    setLoadingSlots(true);
    setSelectedDate(null);
    setSelectedSlot(null);
    slotApi.getByMonth(selectedMonth)
      .then(r => setSlots(r.data.data))
      .catch(() => toast.error('Impossible de charger les créneaux.'))
      .finally(() => setLoadingSlots(false));
  }, [selectedMonth]);

  /* Grouper les slots par date */
  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  const availableDates = Object.keys(slotsByDate).filter(
    date => slotsByDate[date].some(s => s.is_available)
  );

  const slotsForSelectedDate = selectedDate
    ? (slotsByDate[selectedDate] || []).filter(s => s.is_available)
    : [];

  /* Navigation mois */
  const changeMonth = (delta) => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  /* Étape 1 → 2 */
  const goToStep2 = () => {
    if (!selectedService) return toast.error('Veuillez choisir une prestation.');
    setStep(2);
  };

  /* Étape 2 → 3 : créer la réservation */
  const goToStep3 = async () => {
    if (!selectedSlot) return toast.error('Veuillez choisir un créneau.');
    setSubmitting(true);
    try {
      const { data } = await reservationApi.create({
        slot_id: selectedSlot.id,
        service_id: selectedService.id,
        notes,
      });
      setReservation(data.data.reservation);
      setPaypalOrderId(data.data.paypal_order_id);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la réservation.');
    } finally {
      setSubmitting(false);
    }
  };

  /* Capture PayPal → étape 4 */
  const onPaypalApprove = async (data) => {
    try {
      await reservationApi.captureDeposit(reservation.id, data.orderID);
      toast.success('Acompte reçu ! Votre réservation est confirmée 🎉');
      setStep(4);
    } catch {
      toast.error('Erreur lors du paiement. Contactez-nous si le montant a été prélevé.');
    }
  };

  /* ── RENDER ────────────────────────────────────────────── */
  return (
    <PayPalScriptProvider options={{ 'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID, currency: 'EUR' }}>
      <div className="section animate-fade-in">
        <div className="container-app max-w-3xl">

          {/* En-tête */}
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl text-ink mb-2">Prendre rendez-vous</h1>
            <p className="text-ink-muted">Réservez en quelques étapes, confirmez avec un acompte de 50%.</p>
          </div>

          <Stepper currentStep={step} />

          {/* ── Étape 1 : Choix prestation ────────────────── */}
          {step === 1 && (
            <div className="animate-slide-up">
              <h2 className="font-display text-2xl text-ink mb-6 flex items-center gap-2">
                <Sparkles size={20} className="text-olive" /> Quelle prestation souhaitez-vous ?
              </h2>

              {loadingSvc ? <Spinner /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {services.map(svc => (
                    <button
                      key={svc.id}
                      onClick={() => setSelectedService(svc)}
                      className={`card text-left p-5 transition-all duration-200 hover:shadow-hover ${
                        selectedService?.id === svc.id
                          ? 'ring-2 ring-olive shadow-hover'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-olive/10 flex items-center justify-center shrink-0">
                          {svc.image_url
                            ? <img src={svc.image_url} alt={svc.name} className="w-full h-full object-cover rounded-2xl" />
                            : <Sparkles size={20} className="text-olive" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-display text-lg text-ink leading-tight">{svc.name}</h3>
                            {selectedService?.id === svc.id && (
                              <CheckCircle size={18} className="text-olive shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{svc.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="font-semibold text-olive text-sm">{Number(svc.price).toFixed(0)} €</span>
                            <span className="text-xs text-ink-muted flex items-center gap-1">
                              <Clock size={11} /> {svc.duration_minutes} min
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <button onClick={goToStep2} className="btn-primary" disabled={!selectedService}>
                  Continuer <ChevronRight size={17} />
                </button>
              </div>
            </div>
          )}

          {/* ── Étape 2 : Date et créneau ─────────────────── */}
          {step === 2 && (
            <div className="animate-slide-up space-y-6">

              {/* Récap prestation */}
              <div className="card p-4 flex items-center gap-4 bg-olive/5 border-olive/20">
                <div className="w-10 h-10 rounded-xl bg-olive/15 flex items-center justify-center">
                  <Sparkles size={18} className="text-olive" />
                </div>
                <div>
                  <p className="font-medium text-ink">{selectedService.name}</p>
                  <p className="text-sm text-ink-muted">{Number(selectedService.price).toFixed(0)} € — {selectedService.duration_minutes} min</p>
                </div>
                <button onClick={() => setStep(1)} className="ml-auto text-xs text-olive hover:underline">
                  Changer
                </button>
              </div>

              {/* Navigation mois */}
              <div>
                <h2 className="font-display text-2xl text-ink mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-olive" /> Choisissez une date
                </h2>

                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => changeMonth(-1)} className="p-2 rounded-xl hover:bg-cream-300 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <span className="font-display text-lg text-ink capitalize">
                    {new Date(selectedMonth + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={() => changeMonth(1)} className="p-2 rounded-xl hover:bg-cream-300 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>

                {loadingSlots ? <Spinner /> : (
                  availableDates.length === 0 ? (
                    <div className="card p-8 text-center">
                      <Calendar size={32} className="text-cream-400 mx-auto mb-3" />
                      <p className="text-ink-muted">Aucun créneau disponible ce mois-ci.</p>
                      <p className="text-sm text-ink-muted mt-1">Essayez le mois suivant.</p>
                    </div>
                  ) : (
                    <CalendarGrid
                      month={selectedMonth}
                      slotsByDate={slotsByDate}
                      availableDates={availableDates}
                      selectedDate={selectedDate}
                      onSelectDate={date => { setSelectedDate(date); setSelectedSlot(null); }}
                    />
                  )
                )}
              </div>

              {/* Créneaux du jour sélectionné */}
              {selectedDate && (
                <div>
                  <h2 className="font-display text-xl text-ink mb-3 flex items-center gap-2">
                    <Clock size={18} className="text-olive" />
                    Créneaux disponibles — {new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h2>

                  {slotsForSelectedDate.length === 0 ? (
                    <p className="text-ink-muted text-sm">Aucun créneau disponible ce jour.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {slotsForSelectedDate.map(slot => {
                        const config = PERIOD_CONFIG[slot.period];
                        const Icon   = config.icon;
                        return (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                              selectedSlot?.id === slot.id
                                ? 'border-olive bg-olive/5 shadow-soft'
                                : `${config.color} border hover:shadow-card`
                            }`}
                          >
                            <Icon size={22} />
                            <span className="font-semibold text-sm">{config.label}</span>
                            <span className="text-xs opacity-70">{config.time}</span>
                            {selectedSlot?.id === slot.id && (
                              <CheckCircle size={16} className="text-olive" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {selectedSlot && (
                <div className="animate-slide-up">
                  <label className="label">Note pour la presthésiste <span className="text-ink-muted">(optionnel)</span></label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Allergie, préférence, demande particulière…"
                    rows={3}
                    className="input resize-none"
                  />
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(1)} className="btn-secondary">
                  <ChevronLeft size={17} /> Retour
                </button>
                <button
                  onClick={goToStep3}
                  disabled={!selectedSlot || submitting}
                  className="btn-primary"
                >
                  {submitting
                    ? <span className="w-4 h-4 rounded-full border-2 border-ivory-100/30 border-t-ivory-100 animate-spin" />
                    : <><CreditCard size={17} /> Payer l'acompte</>
                  }
                </button>
              </div>
            </div>
          )}

          {/* ── Étape 3 : Paiement acompte PayPal ────────── */}
          {step === 3 && reservation && (
            <div className="animate-slide-up">
              <h2 className="font-display text-2xl text-ink mb-6 flex items-center gap-2">
                <CreditCard size={20} className="text-olive" /> Régler l'acompte
              </h2>

              {/* Récap commande */}
              <div className="card p-6 mb-6 space-y-3">
                <h3 className="font-display text-lg text-ink mb-2">Récapitulatif</h3>
                <RecapRow label="Prestation"  value={selectedService.name} />
                <RecapRow label="Date"
                  value={new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                />
                <RecapRow label="Créneau" value={PERIOD_CONFIG[selectedSlot.period].label + ' — ' + PERIOD_CONFIG[selectedSlot.period].time} />
                <div className="divider" />
                <RecapRow label="Prix total" value={`${Number(reservation.total_price).toFixed(2)} €`} />
                <div className="flex items-center justify-between bg-olive/5 rounded-xl px-4 py-3">
                  <span className="font-semibold text-olive">Acompte à payer maintenant</span>
                  <span className="font-display text-2xl text-olive">{Number(reservation.deposit_amount).toFixed(2)} €</span>
                </div>
                <p className="text-xs text-ink-muted">Le solde de {Number(reservation.total_price - reservation.deposit_amount).toFixed(2)} € sera réglé lors de votre rendez-vous.</p>
              </div>

              {/* Bouton PayPal */}
              <div className="card p-6">
                <p className="text-sm text-ink-muted mb-4 text-center">
                  Paiement sécurisé via PayPal. Vous serez redirigé(e) vers PayPal pour finaliser.
                </p>
                <PayPalButtons
                  style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
                  createOrder={() => Promise.resolve(paypalOrderId)}
                  onApprove={onPaypalApprove}
                  onError={() => toast.error('Erreur PayPal. Veuillez réessayer.')}
                  onCancel={() => toast('Paiement annulé.')}
                />
              </div>

              <button onClick={() => setStep(2)} className="btn-secondary mt-4">
                <ChevronLeft size={17} /> Retour
              </button>
            </div>
          )}

          {/* ── Étape 4 : Confirmation ────────────────────── */}
          {step === 4 && (
            <div className="animate-slide-up text-center">
              <div className="w-20 h-20 rounded-full bg-olive/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={44} className="text-olive" />
              </div>
              <h2 className="font-display text-3xl text-ink mb-3">Réservation confirmée !</h2>
              <p className="text-ink-muted mb-2">
                Votre rendez-vous est bien enregistré. Un email de confirmation vous a été envoyé.
              </p>

              <div className="card p-6 my-8 text-left space-y-3 max-w-sm mx-auto">
                <h3 className="font-display text-lg text-ink mb-3">Votre rendez-vous</h3>
                <RecapRow label="Prestation" value={selectedService?.name} />
                <RecapRow label="Date"
                  value={selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                />
                <RecapRow label="Créneau" value={selectedSlot && PERIOD_CONFIG[selectedSlot.period]?.label} />
                <RecapRow label="Acompte réglé" value={`${Number(reservation?.deposit_amount).toFixed(2)} €`} />
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <button onClick={() => navigate('/compte')} className="btn-primary">
                  Voir mes réservations
                </button>
                <button onClick={() => navigate('/')} className="btn-secondary">
                  Retour à l'accueil
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </PayPalScriptProvider>
  );
}

/* ── Sous-composants ─────────────────────────────────────── */

function RecapRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium text-ink text-right">{value}</span>
    </div>
  );
}

function CalendarGrid({ month, slotsByDate, availableDates, selectedDate, onSelectDate }) {
  const [year, m]  = month.split('-').map(Number);
  const firstDay   = new Date(year, m - 1, 1).getDay(); // 0=dimanche
  const daysInMonth = new Date(year, m, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  // Décaler pour commencer lundi (0=lundi)
  const startOffset = (firstDay + 6) % 7;

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    cells.push(dateStr);
  }

  const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="card p-4">
      {/* En-têtes jours */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-ink-muted py-2">{d}</div>
        ))}
      </div>
      {/* Grille */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((dateStr, i) => {
          if (!dateStr) return <div key={`empty-${i}`} />;

          const isPast      = dateStr < today;
          const isAvailable = availableDates.includes(dateStr);
          const isSelected  = selectedDate === dateStr;
          const slots       = slotsByDate[dateStr] || [];
          const availCount  = slots.filter(s => s.is_available).length;

          return (
            <button
              key={dateStr}
              disabled={isPast || !isAvailable}
              onClick={() => onSelectDate(dateStr)}
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all duration-150
                ${isSelected    ? 'bg-olive text-ivory-100 shadow-soft' :
                  isAvailable && !isPast ? 'bg-olive/10 text-olive hover:bg-olive/20' :
                  'text-ink-muted opacity-40 cursor-not-allowed'}
              `}
            >
              <span>{parseInt(dateStr.split('-')[2])}</span>
              {isAvailable && !isPast && !isSelected && (
                <span className="text-[9px] opacity-60">{availCount} dispo</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
