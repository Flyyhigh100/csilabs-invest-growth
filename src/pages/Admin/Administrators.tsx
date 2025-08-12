import React, { useMemo, useState } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';
import { Copy, Shield } from 'lucide-react';

interface AdminWithProfile {
  id: string;
  email: string;
  role: string;
  created_at: string;
  profile?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
}

const AdministratorsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admins'],
    queryFn: async (): Promise<AdminWithProfile[]> => {
      const { data: admins, error } = await supabase
        .from('admins')
        .select('id,email,role,created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const ids = (admins || []).map(a => a.id).filter(Boolean);
      let profilesMap: Record<string, any> = {};
      if (ids.length) {
        const { data: profiles, error: pErr } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', ids);
        if (!pErr && profiles) {
          profilesMap = Object.fromEntries(profiles.map(p => [p.id, p]));
        }
      }

      return (admins || []).map(a => ({
        ...a,
        profile: profilesMap[a.id] || null,
      }));
    },
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data || [];
    return (data || []).filter(item => {
      const name = `${item.profile?.first_name ?? ''} ${item.profile?.last_name ?? ''}`.toLowerCase();
      return (
        item.email.toLowerCase().includes(q) ||
        name.includes(q) ||
        (item.profile?.email || '').toLowerCase().includes(q)
      );
    });
  }, [data, search]);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  return (
    <AdminLayout title="Administrators">
      <Helmet>
        <title>Administrators | Admin Portal</title>
        <meta name="description" content="View administrator accounts, roles, and linked profiles." />
        <link rel="canonical" href="/admin/admins" />
      </Helmet>

      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Shield className="h-5 w-5" /> Administrators
        </h1>
        <p className="text-muted-foreground mt-1">Read-only list of users with admin rights.</p>
      </header>

      <section className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="w-full sm:w-80 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Search administrators"
          />
          <div className="text-sm text-muted-foreground">
            {data ? `${filtered.length} of ${data.length} shown` : ''}
          </div>
        </div>
      </section>

      <main>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-destructive">
            Unable to load administrators. Please try again later.
          </div>
        ) : (filtered?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 pr-4 font-medium">Role</th>
                  <th className="py-2 pr-4 font-medium">User ID</th>
                  <th className="py-2 pr-4 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((admin) => {
                  const name = `${admin.profile?.first_name ?? ''} ${admin.profile?.last_name ?? ''}`.trim();
                  return (
                    <tr key={admin.id} className="border-b last:border-b-0">
                      <td className="py-2 pr-4">
                        {name || '—'}
                        {admin.profile?.email && (
                          <div className="text-xs text-muted-foreground">{admin.profile.email}</div>
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-2">
                          <span>{admin.email}</span>
                          <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Copy email" onClick={() => copy(admin.email)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                      <td className="py-2 pr-4 capitalize">{admin.role}</td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-muted-foreground break-all">{admin.id}</code>
                          <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Copy user id" onClick={() => copy(admin.id)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                      <td className="py-2 pr-4">
                        {new Date(admin.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground py-8">No administrators found.</div>
        ))}
      </main>
    </AdminLayout>
  );
};

export default AdministratorsPage;
