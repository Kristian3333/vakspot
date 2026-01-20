// src/components/layout/footer.tsx
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { href: '/how-it-works', label: 'Hoe werkt het?' },
      { href: '/categories', label: 'Categorieën' },
      { href: '/register/pro', label: 'Vakman worden' },
    ],
    support: [
      { href: '/help', label: 'Help center' },
      { href: '/contact', label: 'Contact' },
      { href: '/faq', label: 'Veelgestelde vragen' },
    ],
    legal: [
      { href: '/privacy', label: 'Privacybeleid' },
      { href: '/terms', label: 'Algemene voorwaarden' },
      { href: '/cookies', label: 'Cookiebeleid' },
    ],
  };

  return (
    <footer className="border-t border-surface-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500">
                <span className="text-lg font-bold text-white">V</span>
              </div>
              <span className="text-xl font-bold text-surface-900">VakSpot</span>
            </Link>
            <p className="mt-4 text-sm text-surface-500">
              Vind betrouwbare vakmensen voor al uw klussen. Snel, makkelijk en veilig.
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900">Platform</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-surface-500 hover:text-surface-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900">Support</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-surface-500 hover:text-surface-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900">Juridisch</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-surface-500 hover:text-surface-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-surface-200 pt-8">
          <p className="text-center text-sm text-surface-500">
            © {currentYear} VakSpot. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  );
}
