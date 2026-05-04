import { useState, useEffect } from 'react';
import { Users, Search, UserCheck, UserX, Trash2 } from 'lucide-react';
import { userApi } from '../../api';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function AdminClientesPage() {
  const [users, setUsers]     = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);

  const fetch = (s = search, p = page) => {
    setLoading(true);
    const params = { page: p, limit: 15 };
    if (s) params.search = s;
    userApi.getAll(params)
      .then(r => { setUsers(r.data.data); setPagination(r.data.pagination); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, [page]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetch(search, 1); };

  const toggleActive = async (id, current) => {
    try {
      await userApi.toggleActive(id);
      setUsers(u => u.map(usr => usr.id === id ? { ...usr, is_active: !current } : usr));
      toast.success(current ? 'Compte désactivé.' : 'Compte activé.');
    } catch { toast.error('Erreur.'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer définitivement le compte de ${name} ? Cette action est irréversible.`)) return;
    try {
      await userApi.deleteUser(id);
      setUsers(u => u.filter(usr => usr.id !== id));
      toast.success('Compte supprimé.');
    } catch (err) { toast.error(err.response?.data?.message || 'Impossible de supprimer ce compte.'); }
  };

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl text-ink mb-6 flex items-center gap-2">
        <Users size={22} className="text-olive" /> Clientes
      </h1>

      {/* Recherche */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email…" className="input pl-9 py-2" />
        </div>
        <button type="submit" className="btn-primary py-2 px-4 text-sm">Rechercher</button>
        {search && (
          <button type="button" onClick={() => { setSearch(''); fetch('', 1); }} className="btn-secondary py-2 px-4 text-sm">
            Réinitialiser
          </button>
        )}
      </form>

      {loading ? <Spinner /> : users.length === 0 ? (
        <EmptyState icon={Users} title="Aucune cliente trouvée" />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-cream-100 border-b border-cream-300">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider hidden lg:table-cell">Téléphone</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider hidden sm:table-cell">Inscrite le</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Statut</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-cream-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-olive/20 flex items-center justify-center shrink-0">
                            <span className="text-olive text-sm font-semibold">{u.full_name?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-ink truncate">{u.full_name}</p>
                            <p className="text-xs text-ink-muted truncate md:hidden">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-muted hidden md:table-cell">{u.email}</td>
                      <td className="px-4 py-3 text-ink-muted hidden lg:table-cell">{u.phone || '—'}</td>
                      <td className="px-4 py-3 text-ink-muted hidden sm:table-cell whitespace-nowrap">
                        {new Date(u.createdAt || u.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {u.is_active ? 'Active' : 'Désactivée'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleActive(u.id, u.is_active)}
                            className={`p-1.5 rounded-lg transition-colors ${u.is_active ? 'bg-red-100 hover:bg-red-200' : 'bg-green-100 hover:bg-green-200'}`}
                            title={u.is_active ? 'Désactiver' : 'Activer'}
                          >
                            {u.is_active
                              ? <UserX size={15} className="text-red-600" />
                              : <UserCheck size={15} className="text-green-700" />}
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.full_name)}
                            className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                            title="Supprimer le compte"
                          >
                            <Trash2 size={15} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination pagination={pagination} onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </>
      )}
    </div>
  );
}
