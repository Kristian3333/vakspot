// src/app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <span className="text-[120px] font-bold text-surface-100 select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="h-16 w-16 text-brand-500 opacity-50" />
            </div>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-surface-900 mb-3">
          Pagina niet gevonden
        </h1>
        
        <p className="text-surface-600 mb-8">
          De pagina die u zoekt bestaat niet of is verplaatst.
          Controleer de URL of ga terug naar de homepage.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button leftIcon={<Home className="h-4 w-4" />}>
              Naar homepage
            </Button>
          </Link>
          <Link href="/categories">
            <Button variant="outline" leftIcon={<Search className="h-4 w-4" />}>
              Categorieën bekijken
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-surface-200">
          <p className="text-sm text-surface-500 mb-3">
            Populaire pagina's:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/how-it-works"
              className="text-sm text-brand-600 hover:text-brand-700 hover:underline"
            >
              Hoe werkt het?
            </Link>
            <span className="text-surface-300">•</span>
            <Link
              href="/help"
              className="text-sm text-brand-600 hover:text-brand-700 hover:underline"
            >
              Help Center
            </Link>
            <span className="text-surface-300">•</span>
            <Link
              href="/contact"
              className="text-sm text-brand-600 hover:text-brand-700 hover:underline"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
