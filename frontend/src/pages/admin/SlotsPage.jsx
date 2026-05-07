import { useState, useEffect, useCallback } from 'react';
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Lock, Unlock, Check } from 'lucide-react';
import { slotApi } from '../../api';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const PERIODS = [
  { key: 'morning',   label: 'Matin' },
  { key: 'afternoon', label: 'Après-midi' },
  { key: 'evening',   label: 'Soir' },
];

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 0, label: 'Dimanche' },
];

const toMonthStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const toDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getDaysInMonth = (monthStr) => {
  const [year, month] = monthStr.split('-').map(Number);
  const days = [];
  const d = new Date(year, month - 1, 1);
  while (d.getMonth() === month - 1) {
    days.push(toDateStr(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
};

const todayStr = () => toDateStr(new Date());

export default function AdminSlotsPage() {
  const [month, setMonth]           = useState(toMonthStr(new Date()));
  const [slotsByDate, setSlotsByDate] = useState({});
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    start_date: todayStr(),
    end_date:    '',
    closed_days: [0],
  });

  const fetchSlots = useCallback((m) => {
    setLoading(true);
    slotApi.getByMonth(m)
      .then(r => {
        const map = {};
        (r.data.data || []).forEach(slot => {
          if (!map[slot.date]) map[slot.date] = {};
          map[slot.date][slot.period] = slot;
        });
        setSlotsByDate(map);
      })
      .catch(() => toast.error('Impossible de charger les créneaux.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchSlots(month); }, [month, fetchSlots]);

  const changeMonth = (delta) => {
    const [y, m] = month.split('-').map(Number);
    setMonth(toMonthStr(new Date(y, m - 1 + delta, 1)));
  };

  const toggleBlock = async (slot) => {
    const newBlocked = !slot.is_blocked;
    try {
      await slotApi.block(slot.id, { is_blocked: newBlocked });
      setSlotsByDate(prev => ({
        ...prev,
        [slot.date]: {
          ...prev[slot.date],
          [slot.period]: { ...slot, is_blocked: newBlocked, is_available: !newBlocked },
        },
      }));
      toast.success(newBlocked ? 'Créneau bloqué.' : 'Créneau débloqué.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur.');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const r = await slotApi.generate(form);
      toast.success(`${r.data.data.created} créneaux générés.`);
      setModalOpen(false);
      fetchSlots(month);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la génération.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleClosedDay = (day) =>
    setForm(f => ({
      ...f,
      closed_days: f.closed_days.includes(day)
        ? f.closed_days.filter(d => d !== day)
        : [...f.closed_days, day],
    }));

  const days      = getDaysInMonth(month);
  const today     = todayStr();
  const monthLabel = new Date(month + '-15').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="p-4 sm:p-8">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl text-ink flex items-center gap-2">
          <CalendarDays size={22} className="text-olive" /> Créneaux
        </h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary py-2 px-3 sm:px-4 text-sm">
          <Plus size={16} />
          <span className="hidden sm:inline">Générer des créneaux</span>
        </button>
      </div>

      {/* Navigation mois */}
      <div className="flex items-center gap-4 mb-5">
        <button onClick={() => changeMonth(-1)}
          className="p-2 rounded-xl bg-cream-200 hover:bg-cream-300 transition-colors">
          <ChevronLeft size={18} className="text-ink" />
        </button>
        <span className="font-display text-lg text-ink capitalize min-w-[180px] text-center">
          {monthLabel}
        </span>
        <button onClick={() => changeMonth(1)}
          className="p-2 rounded-xl bg-cream-200 hover:bg-cream-300 transition-colors">
          <ChevronRight size={18} className="text-ink" />
        </button>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap gap-4 mb-5">
        {[
          { color: 'bg-green-400',  label: 'Disponible' },
          { color: 'bg-olive',      label: 'Réservé' },
          { color: 'bg-red-400',    label: 'Bloqué' },
          { color: 'bg-cream-300',  label: 'Non généré' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>

      {/* Grille des jours */}
      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {days.map(date => {
            const daySlots = slotsByDate[date] || {};
            const isToday  = date === today;
            const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', {
              weekday: 'short', day: 'numeric', month: 'short',
            });

            return (
              <div key={date} className={`card p-4 ${isToday ? 'ring-2 ring-olive' : ''}`}>
                <p className={`text-xs font-semibold mb-3 capitalize ${isToday ? 'text-olive' : 'text-ink-muted'}`}>
                  {dayLabel}{isToday && <span className="ml-1 text-[10px] uppercase tracking-wide">(aujourd'hui)</span>}
                </p>
                <div className="space-y-1.5">
                  {PERIODS.map(({ key, label }) => {
                    const slot = daySlots[key];

                    if (!slot) {
                      return (
                        <div key={key}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-cream-100 opacity-40">
                          <span className="text-xs text-ink-muted">{label}</span>
                          <span className="text-xs text-ink-muted">—</span>
                        </div>
                      );
                    }

                    const isReserved = !slot.is_available && !slot.is_blocked;

                    return (
                      <button
                        key={key}
                        onClick={() => !isReserved && toggleBlock(slot)}
                        disabled={isReserved}
                        title={slot.is_blocked ? 'Cliquer pour débloquer' : isReserved ? 'Réservé' : 'Cliquer pour bloquer'}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                          slot.is_blocked
                            ? 'bg-red-100 hover:bg-red-200 text-red-700'
                            : isReserved
                            ? 'bg-olive/20 text-olive cursor-default'
                            : 'bg-green-100 hover:bg-green-200 text-green-700'
                        }`}
                      >
                        <span className="text-xs font-medium">{label}</span>
                        {slot.is_blocked
                          ? <Lock size={11} />
                          : isReserved
                          ? <span className="text-[10px] font-semibold">Réservé</span>
                          : <Unlock size={11} className="opacity-40" />
                        }
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal génération */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Générer des créneaux">
        <form onSubmit={handleGenerate} className="space-y-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Date de début</label>
              <input type="date" className="input" required
                value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div>
              <label className="label">Date de fin</label>
              <input type="date" className="input" required
                value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="label">Jours fermés</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {DAYS_OF_WEEK.map(({ value, label }) => {
                const checked = form.closed_days.includes(value);
                return (
                  <label key={value}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-colors select-none ${
                      checked
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-cream-50 border-cream-300 text-ink-soft hover:bg-cream-100'
                    }`}>
                    <input type="checkbox" className="hidden"
                      checked={checked} onChange={() => toggleClosedDay(value)} />
                    <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                      checked ? 'bg-red-500' : 'bg-cream-300'
                    }`}>
                      {checked && <Check size={10} className="text-white" />}
                    </span>
                    <span className="text-sm">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl bg-cream-100 px-4 py-3">
            <p className="text-xs text-ink-muted">
              Les créneaux déjà existants ne seront pas dupliqués. Chaque jour génère 3 créneaux : Matin, Après-midi, Soir.
            </p>
          </div>

          <button type="submit" disabled={generating} className="btn-primary w-full justify-center">
            {generating
              ? <span className="w-4 h-4 rounded-full border-2 border-ivory-100/30 border-t-ivory-100 animate-spin" />
              : <><Plus size={15} /> Générer</>}
          </button>
        </form>
      </Modal>
    </div>
  );
}
