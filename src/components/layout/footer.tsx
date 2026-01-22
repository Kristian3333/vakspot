// src/components/layout/Footer.tsx
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-surface-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
              <span className="text-sm font-bold text-white">V</span>
            </div>
            <span className="text-lg font-bold text-surface-900">VakSpot</span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-surface-500">
            <Link href="/privacy" className="hover:text-surface-900 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-surface-900 transition-colors">
              Voorwaarden
            </Link>
            <Link href="/contact" className="hover:text-surface-900 transition-colors">
              Contact
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-surface-400">
            © {currentYear} VakSpot
          </p>
        </div>
      </div>
    </footer>
  );
}
