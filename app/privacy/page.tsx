import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="border border-neutral-900 bg-white p-5 sm:p-6">
        <div className="border-b border-neutral-900 pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-700">Privacy Policy</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">Privacy Policy</h1>
          <p className="mt-2 text-sm text-neutral-700">Last updated: April 5, 2026</p>
        </div>

        <div className="mt-6 space-y-6 text-sm leading-6 text-neutral-800">
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-700">1. Who we are</h2>
            <p>This website is operated by:</p>
            <p className="font-semibold text-neutral-950">Utku Gaspak</p>
            <p>Email: <a className="underline decoration-neutral-400 underline-offset-2 hover:decoration-neutral-900" href="mailto:utkugaspak@gmail.com">utkugaspak@gmail.com</a></p>
            <p>Website: <a className="underline decoration-neutral-400 underline-offset-2 hover:decoration-neutral-900" href="https://tolstackup.com" target="_blank" rel="noreferrer">https://tolstackup.com</a></p>
            <p>If you have questions about this Privacy Policy or your personal data, you can contact us using the email above.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-700">2. What this policy covers</h2>
            <p>This Privacy Policy explains how we handle personal data when you visit and use this website.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-700">3. Data we process</h2>
            <p>When you use this website, we may process limited technical and usage information, for example:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>information about pages viewed</li>
              <li>general interaction and usage data</li>
              <li>basic technical/browser information</li>
              <li>consent choices related to analytics</li>
            </ul>
            <p>We do not intentionally use this website to collect directly identifying information for analytics purposes.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-700">4. Google Analytics</h2>
            <p>We use Google Analytics 4 to understand how visitors use the website and to improve the product.</p>
            <p>Google Analytics is activated only if you give consent through our consent banner. If you reject non-essential analytics, Google Analytics is not loaded.</p>
            <p>Google Analytics may use cookies or similar technologies to measure website usage. We use analytics only to understand traffic and product usage trends.</p>
            <p>For more information about how Google processes data, please review Google&apos;s privacy information.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-700">5. Legal basis</h2>
            <p>Where required by applicable law, we process analytics data on the basis of your consent.</p>
            <p>You can refuse consent, and if you have previously given consent, you can withdraw it at any time through the Privacy settings option available on the website footer.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-700">6. Consent choices</h2>
            <p>When you first visit the website, you are asked whether you want to allow analytics.</p>
            <p>Your choice is stored locally so the website can remember your preference. You can change your choice later using Privacy settings in the footer.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-700">7. Data sharing</h2>
            <p>We do not sell your personal data.</p>
            <p>If analytics is enabled, data may be processed by Google as our analytics service provider.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-700">8. Data retention</h2>
            <p>We keep analytics-related data only for as long as necessary for measurement and product improvement, subject to the settings configured in Google Analytics and applicable legal requirements.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-700">9. Your rights</h2>
            <p>Depending on where you are located, you may have rights regarding your personal data, including the right to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>access your data</li>
              <li>request correction or deletion</li>
              <li>object to certain processing</li>
              <li>withdraw consent where processing is based on consent</li>
            </ul>
            <p>To exercise any applicable rights, contact us at: <a className="underline decoration-neutral-400 underline-offset-2 hover:decoration-neutral-900" href="mailto:utkugaspak@gmail.com">utkugaspak@gmail.com</a></p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-700">10. Changes to this policy</h2>
            <p>We may update this Privacy Policy from time to time. If we make material changes, we will update the &ldquo;Last updated&rdquo; date above.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-700">11. Contact</h2>
            <p>If you have privacy-related questions, contact:</p>
            <p className="font-semibold text-neutral-950">Utku Gaspak</p>
            <p>Email: <a className="underline decoration-neutral-400 underline-offset-2 hover:decoration-neutral-900" href="mailto:utkugaspak@gmail.com">utkugaspak@gmail.com</a></p>
          </section>

          <div className="border-t border-neutral-900 pt-4">
            <Link href="/" className="font-medium text-neutral-950 underline decoration-neutral-400 decoration-1 underline-offset-2 hover:decoration-neutral-900">
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
