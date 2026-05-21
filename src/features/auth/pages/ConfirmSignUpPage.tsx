import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { AuthShell } from '@/features/auth/components/AuthShell';

export function ConfirmSignUpPage(): React.ReactElement {
  const { confirm, resendCode } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      await confirm(email, code.trim());
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Confirmation failed.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    try {
      await resendCode(email);
      setInfo('A new code has been sent to your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code.');
    }
  }

  return (
    <AuthShell tag="One last step" title="Confirm your email">
      <p className="auth-hint">Enter the 6-digit code we just emailed you.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label>
          Confirmation code
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="one-time-code"
            placeholder="123456"
            required
          />
        </label>
        {error && <p className="auth-error">{error}</p>}
        {info && <p className="auth-info">{info}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Confirming…' : 'Confirm'}
        </button>
        <p className="auth-foot">
          Didn&apos;t get a code?{' '}
          <button type="button" className="link-button" onClick={handleResend}>
            Resend
          </button>
          {' · '}
          <Link to="/login">Back to sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
