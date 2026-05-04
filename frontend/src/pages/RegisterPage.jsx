import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();

  const [form, setForm]       = useState({ full_name: '', email: '', password: '', phone: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center animate-fade-in">
        <div className="card p-10 flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-olive/10 flex items-center justify-center">
            <Mail size={44} className="text-olive" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-ink mb-2">Vérifiez votre email !</h1>
            <p className="text-ink-muted text-sm leading-relaxed">
              Un email de confirmation a été envoyé à <strong className="text-ink">{form.email}</strong>.<br />
              Cliquez sur le lien dans l'email pour activer votre compte.
            </p>
          </div>
          <Link to="/login" className="text-sm text-olive hover:underline">
            Déjà vérifié ? Se connecter
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-ink mb-2">Créer un compte</h1>
          <p className="text-ink-muted text-sm">
            Rejoignez FaStyle pour réserver vos prestations
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Nom complet</label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Votre nom et prénom"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Adresse email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="vous@exemple.fr"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Téléphone <span className="text-ink-muted">(optionnel)</span></label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+33 6 12 34 56 78"
                className="input"
              />
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="8 caractères minimum"
                  required
                  className="input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-ink-muted mt-1">
                Au moins 8 caractères, une majuscule et un chiffre
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              {loading ? (
                <span className="w-5 h-5 rounded-full border-2 border-ivory-100/30 border-t-ivory-100 animate-spin" />
              ) : (
                <>
                  <UserPlus size={17} />
                  Créer mon compte
                </>
              )}
            </button>
          </form>

          <div className="divider" />

          <p className="text-center text-sm text-ink-muted">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-olive font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
