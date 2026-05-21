import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { getIdToken } from '@/auth/authApi';
import { displayNameFor } from '@/auth/displayName';
import { config } from '@/api/config';

interface ProfileResponse {
  profile: { email?: string; userId?: string; createdAt?: string } | null;
  preferences: Record<string, unknown> | null;
}

function initialsFor(email: string | undefined): string {
  if (!email) return '?';
  const name = email.split('@')[0];
  const parts = name.split(/[.\-_]/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatJoined(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function AccountPage(): React.ReactElement {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const initials = useMemo(() => initialsFor(user?.email), [user?.email]);
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);
  const firstName = useMemo(() => displayNameFor(user?.email), [user?.email]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const token = await getIdToken();
        if (!token) throw new Error('No active session.');
        if (!config.apiBaseUrl) {
          throw new Error('VITE_GONOW_API_BASE_URL is not set.');
        }
        const res = await fetch(`${config.apiBaseUrl}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`GET /users/me → ${res.status}`);
        const data = (await res.json()) as ProfileResponse;
        if (!cancelled) setProfile(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load profile.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSignOut() {
    signOut();
    navigate('/login', { replace: true });
  }

  const joined = profile?.profile?.createdAt;

  return (
    <div className="account-dashboard">
      <div className="account-hero">
        <div className="account-hero-inner">
          <div className="account-avatar">{initials}</div>
          <div className="account-hero-greeting">
            <div className="eyebrow">Your travel dashboard</div>
            <h1>
              {greeting}, {firstName}.
            </h1>
            <p>Ready to plan your next adventure?</p>
          </div>
          <Link className="account-hero-cta" to="/">
            Plan a new trip <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      <div className="account-stats">
        <div className="account-stat-card">
          <span className="stat-icon">🧳</span>
          <div className="stat-num">0</div>
          <div className="stat-cap">Trips planned</div>
        </div>
        <div className="account-stat-card">
          <span className="stat-icon">🌍</span>
          <div className="stat-num">0</div>
          <div className="stat-cap">Countries visited</div>
        </div>
        <div className="account-stat-card">
          <span className="stat-icon">⭐</span>
          <div className="stat-num">0</div>
          <div className="stat-cap">Saved destinations</div>
        </div>
      </div>

      <div className="account-sections">
        <div className="account-panel">
          <h2>Recent trips</h2>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : (
            <div className="account-empty">
              <span className="emoji" aria-hidden>✈️</span>
              No trips yet — your first itinerary is one click away.
              <div style={{ marginTop: 14 }}>
                <Link className="account-hero-cta" to="/" style={{ background: 'var(--navy-900)', color: 'white' }}>
                  Start planning →
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="account-panel">
          <h2>Profile</h2>
          <dl className="account-field-row">
            <dt>Email</dt>
            <dd>{user?.email ?? '—'}</dd>
            <dt>Member since</dt>
            <dd>{formatJoined(joined)}</dd>
          </dl>
          {error && <p className="auth-error" style={{ marginTop: 12 }}>{error}</p>}
          <button type="button" className="account-signout" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
