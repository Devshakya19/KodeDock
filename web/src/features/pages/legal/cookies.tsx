import { StaticPageLayout } from "../shared/static-layout";

export default function CookiesPage() {
  return (
    <StaticPageLayout
      title="Cookie Policy"
      description="How we use cookies on CodeHaat."
    >
      <div className="space-y-8 text-sm text-slate-600 leading-relaxed">
        <p><em>Last updated: July 2026</em></p>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website.
            They help us remember your preferences and provide a better experience.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">2. Types of Cookies We Use</h2>
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-950 mb-1">Essential Cookies</h3>
              <p>Required for the platform to function. Cannot be disabled.</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-950 mb-1">Session Cookies</h3>
              <p>Temporary cookies that expire when you close your browser.</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-950 mb-1">Analytics Cookies</h3>
              <p>Help us understand how you use the platform (optional).</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">3. Specific Cookies</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3 text-sm font-semibold text-slate-950">Cookie</th>
                  <th className="p-3 text-sm font-semibold text-slate-950">Purpose</th>
                  <th className="p-3 text-sm font-semibold text-slate-950">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200">
                  <td className="p-3">sb-access-token</td>
                  <td className="p-3">Authentication session</td>
                  <td className="p-3">Session</td>
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="p-3">sb-refresh-token</td>
                  <td className="p-3">Keep user logged in</td>
                  <td className="p-3">30 days</td>
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="p-3">preferred-language</td>
                  <td className="p-3">Remember language preference</td>
                  <td className="p-3">1 year</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">4. Managing Cookies</h2>
          <p>
            You can control cookies through your browser settings. However, disabling
            essential cookies may affect platform functionality.
          </p>
        </section>
      </div>
    </StaticPageLayout>
  );
}
