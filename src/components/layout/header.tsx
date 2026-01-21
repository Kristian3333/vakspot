// src/components/layout/header.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button, Avatar } from '@/components/ui';
import {
  Menu,
  X,
  Home,
  Briefcase,
  MessageSquare,
  User,
  LogOut,
  Settings,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import type { Session } from 'next-auth';

interface HeaderProps {
  session: Session | null;
}

export function Header({ session }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role;

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Call the NextAuth signout endpoint
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Clear any client-side state and redirect
      if (response.redirected) {
        window.location.href = response.url;
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect anyway
      window.location.href = '/';
    }
  };

  // Navigation items based on role
  const getNavItems = () => {
    if (!isLoggedIn) {
      return [
        { href: '/', label: 'Home', icon: Home },
        { href: '/how-it-works', label: 'Hoe werkt het?', icon: null },
      ];
    }

    if (userRole === 'CLIENT') {
      return [
        { href: '/client/jobs', label: 'Mijn klussen', icon: Briefcase },
        { href: '/messages', label: 'Berichten', icon: MessageSquare },
      ];
    }

    if (userRole === 'PRO') {
      return [
        { href: '/pro/leads', label: 'Leads', icon: Briefcase },
        { href: '/pro/bids', label: 'Mijn offertes', icon: Briefcase },
        { href: '/messages', label: 'Berichten', icon: MessageSquare },
      ];
    }

    if (userRole === 'ADMIN') {
      return [
        { href: '/admin', label: 'Dashboard', icon: Shield },
        { href: '/admin/categories', label: 'Categorieën', icon: Settings },
        { href: '/admin/users', label: 'Gebruikers', icon: User },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500">
            <span className="text-lg font-bold text-white">V</span>
          </div>
          <span className="text-xl font-bold text-surface-900">VakSpot</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
              )}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {userRole === 'CLIENT' && (
                <Link href="/client/jobs/new" className="hidden sm:block">
                  <Button size="sm">Klus plaatsen</Button>
                </Link>
              )}
              
              {/* User menu */}
              <div className="relative group">
                <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-surface-50 transition-colors">
                  <Avatar
                    src={session.user.image}
                    name={session.user.name}
                    size="sm"
                  />
                  <span className="hidden sm:block text-sm font-medium text-surface-700">
                    {session.user.name?.split(' ')[0]}
                  </span>
                </button>
                
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="rounded-xl border border-surface-200 bg-white shadow-soft-lg py-2">
                    <Link
                      href={userRole === 'PRO' ? '/pro/profile' : '/profile'}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900"
                    >
                      <User className="h-4 w-4" />
                      Profiel
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900"
                    >
                      <Settings className="h-4 w-4" />
                      Instellingen
                    </Link>
                    <hr className="my-2 border-surface-200" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50 disabled:opacity-50"
                    >
                      <LogOut className="h-4 w-4" />
                      {isLoggingOut ? 'Uitloggen...' : 'Uitloggen'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  Inloggen
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Aan de slag</Button>
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-surface-50"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-surface-600" />
            ) : (
              <Menu className="h-5 w-5 text-surface-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-200 bg-white">
          <nav className="flex flex-col p-4 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-surface-600 hover:bg-surface-50'
                )}
              >
                {item.icon && <item.icon className="h-5 w-5" />}
                {item.label}
              </Link>
            ))}
            
            {isLoggedIn && (
              <>
                <Link
                  href={userRole === 'PRO' ? '/pro/profile' : '/profile'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50"
                >
                  <User className="h-5 w-5" />
                  Profiel
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50"
                >
                  <Settings className="h-5 w-5" />
                  Instellingen
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-error-600 hover:bg-error-50 disabled:opacity-50"
                >
                  <LogOut className="h-5 w-5" />
                  {isLoggingOut ? 'Uitloggen...' : 'Uitloggen'}
                </button>
              </>
            )}
            
            {isLoggedIn && userRole === 'CLIENT' && (
              <Link
                href="/client/jobs/new"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2"
              >
                <Button className="w-full">Klus plaatsen</Button>
              </Link>
            )}
            
            {!isLoggedIn && (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2"
              >
                <Button variant="outline" className="w-full">
                  Inloggen
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
