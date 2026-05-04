import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { authApi } from '../api';

export default function VerifyEmailPage() {
  const [searchParams]      = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const token = searchParams.get('token');
    if (!token) { setStatus('error'); setMessage('Lien invalide.'); return; }

    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Lien invalide ou déjà utilisé.');
      });
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center animate-fade-in">
        <div className="card p-10 flex flex-col items-center gap-5">

          {status === 'loading' && (
            <>
              <Loader size={44} className="text-olive animate-spin" />
              <p className="text-ink-muted">Vérification en cours…</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 rounded-full bg-olive/10 flex items-center justify-center">
                <CheckCircle size={44} className="text-olive" />
              </div>
              <div>
                <h1 className="font-display text-2xl text-ink mb-2">Email vérifié !</h1>
                <p className="text-ink-muted text-sm">
                  Votre compte est activé. Vous pouvez maintenant vous connecter.
                </p>
              </div>
              <Link to="/login" className="btn-primary justify-center w-full">
                Se connecter
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <XCircle size={44} className="text-red-500" />
              </div>
              <div>
                <h1 className="font-display text-2xl text-ink mb-2">Lien invalide</h1>
                <p className="text-ink-muted text-sm">{message}</p>
              </div>
              <Link to="/register" className="btn-primary justify-center w-full">
                Créer un nouveau compte
              </Link>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
