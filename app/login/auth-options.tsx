'use client';

import { useState } from 'react';

export default function AuthOptions({ google, apple, returnTo }: { google: boolean; apple: boolean; returnTo: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function start(provider: 'google' | 'apple') {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth/csrf', { cache: 'no-store' });
      if (!response.ok) throw new Error();
      const { csrfToken } = await response.json() as { csrfToken?: string };
      if (!csrfToken) throw new Error();
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/api/auth/signin/' + provider;
      for (const [name, value] of Object.entries({ csrfToken, callbackUrl: window.location.origin + returnTo })) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    } catch {
      setError('Could not start secure sign-in. Try again.');
      setBusy(false);
    }
  }

  return <>
    <div className="auth-options">
      {google && <button disabled={busy} onClick={() => void start('google')}>Continue with Google</button>}
      {apple && <button className="apple" disabled={busy} onClick={() => void start('apple')}>Continue with Apple</button>}
    </div>
    {error && <p role="alert">{error}</p>}
  </>;
}
