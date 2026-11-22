import SiteBrand from '../site-brand';
import { providerAvailability } from '../../lib/provider-auth';
import AuthOptions from './auth-options';
import { learningReturn } from '../../lib/login-return';

export const dynamic = 'force-dynamic';

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; returnTo?: string }> }) {
  const query = await searchParams;
  const { google, apple } = providerAvailability();
  return <>
    <div className="pilot beta-warning" role="note"><strong>NOT CURRENTLY APPROVED — BETA TESTING ONLY</strong><span className="pilot-detail">No certification or CE credit awarded.</span></div>
    <header className="auth-header"><SiteBrand /></header>
    <main className="auth-page">
      <h1>Keep your learning together.</h1>
      <p>Read every guide without an account. Sign in to save your practice and self-paced progress.</p>
      {query.error && <p role="alert">Sign-in did not complete. Use your existing provider or try again.</p>}
      <AuthOptions google={google} apple={apple} returnTo={learningReturn(query.returnTo)} />
      {!google && !apple && <p>Sign-in is unavailable until this site’s maintainer configures an identity provider.</p>}
      <a href="/">Back to the guides</a>
    </main>
  </>;
}
