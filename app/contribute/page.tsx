import type { Metadata } from 'next';
import { env } from 'cloudflare:workers';
import { ContributionLayout } from '../contribution-ui';
import { SOURCE_DOWNLOAD, verifiedRepositoryUrl } from '../../lib/source-download';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Copy and contribute | Free Florida HOA Training' };

export default function ContributePage() {
  const repository = verifiedRepositoryUrl(env.PUBLIC_SOURCE_REPOSITORY_URL);
  return <ContributionLayout>
    <h1>Copy and contribute</h1>
    <p>Copy or adapt the original website code and course text, or help improve a lesson here.</p>
    <section className="panel">
      <h2>Copy the website</h2>
      <p>The source download includes setup instructions, readable exports of the twelve lessons, and contribution and license guidance.</p>
      <p><a className="primary" href={SOURCE_DOWNLOAD} download>Download the source ZIP</a></p>
      {repository ? <p><a href={repository}>View the public repository</a></p> : <p>A public repository link is pending.</p>}
    </section>
    <section className="panel">
      <h2>Reuse and attribution</h2>
      <ul>
        <li>Original website code is available under the <a href="https://opensource.org/license/mit">MIT License</a>. Keep the copyright and license notice with copies.</li>
        <li>Original course text is available under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Credit Free Florida HOA Training, link to the license and indicate what you changed.</li>
        <li>Embedded videos, external resources and other third-party material retain their own terms. This site grants rights only to its original materials. Preserve relevant third-party notices and avoid implying endorsement.</li>
      </ul>
    </section>
    <section className="panel">
      <h2>Help improve a lesson</h2>
      <p>Use the suggestion link on any monthly guide or self-paced module to carry over its exact edition. You can propose wording, give a supporting source or comment on a moderated suggestion without an account. the maintainer approves exact course changes before publication.</p>
      <p><a href="/suggestions#suggest">Suggest a correction or addition</a> · <a href="/suggestions?view=log">See the course change log</a></p>
      <p>Discuss the material respectfully and keep private information out of submissions. For security issues, contact the maintainer privately using the information on the <a href="/privacy">privacy page</a>.</p>
    </section>
  </ContributionLayout>;
}
