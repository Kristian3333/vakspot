// src/components/layout/Footer.tsx
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-surface-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Platform Role */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
                <span className="text-sm font-bold text-white">V</span>
              </div>
              <span className="text-lg font-bold text-surface-900">VakSpot</span>
            </Link>
            <p className="mt-4 text-sm text-surface-600 leading-relaxed">
              VakSpot is een <strong>bemiddelingsplatform</strong> dat opdrachtgevers verbindt met vakmensen.
              Wij zijn geen aannemer en voeren zelf geen werkzaamheden uit.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900 mb-4">Platform</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/how-it-works" className="text-surface-600 hover:text-brand-600 transition-colors">
                  Hoe werkt het?
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-surface-600 hover:text-brand-600 transition-colors">
                  Veelgestelde vragen
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-surface-600 hover:text-brand-600 transition-colors">
                  Help center
                </Link>
              </li>
              <li>
                <Link href="/ranking" className="text-surface-600 hover:text-brand-600 transition-colors">
                  Rangschikkingscriteria
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900 mb-4">Juridisch</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/terms" className="text-surface-600 hover:text-brand-600 transition-colors">
                  Algemene voorwaarden
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-surface-600 hover:text-brand-600 transition-colors">
                  Privacybeleid
                </Link>
              </li>
              <li>
                <Link href="/complaints" className="text-surface-600 hover:text-brand-600 transition-colors">
                  Klachtenprocedure
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-surface-600 hover:text-brand-600 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Entity Info */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900 mb-4">Bedrijfsgegevens</h3>
            <address className="not-italic text-sm text-surface-600 space-y-1">
              <p className="font-medium text-surface-900">VakSpot B.V.</p>
              <p>Herengracht 123</p>
              <p>1015 BH Amsterdam</p>
              <p className="pt-2">KvK: 12345678</p>
              <p>BTW: NL123456789B01</p>
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-surface-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-surface-500">
              © {currentYear} VakSpot B.V. Alle rechten voorbehouden.
            </p>
            <p className="text-xs text-surface-400 text-center sm:text-right max-w-md">
              VakSpot fungeert uitsluitend als bemiddelaar tussen opdrachtgevers en vakmensen.
              Wij zijn geen partij bij de overeenkomst tussen opdrachtgever en vakman.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
