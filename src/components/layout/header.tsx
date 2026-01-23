// src/components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button, Avatar } from '@/components/ui';
import { UnreadBadge } from '@/components/messages/unread-badge';
import {
  Menu,
  X,
  Search,
  MessageSquare,
  User,
  LogOut,
  PlusCircle,
  Briefcase,
  ClipboardList,
} from 'lucide-react';
import { useState } from 'react';
import type { Session } from 'next-auth';

interface HeaderProps {
  session: Session | null;
}

export function Header({ session }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.redirected) {
        window.location.href = response.url;
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      window.location.href = '/';
    }
  };

  // Simplified navigation
  const getNavItems = () => {
    if (!isLoggedIn) return [];

    if (userRole === 'CLIENT') {
      return [
        { href: '/client/jobs', label: 'Mijn klussen', icon: Briefcase },
        { href: '/messages', label: 'Berichten', icon: MessageSquare, showBadge: true },
      ];
    }

    if (userRole === 'PRO') {
      return [
        { href: '/pro/jobs', label: 'Zoeken', icon: Search },
        { href: '/pro/leads', label: 'Mijn klussen', icon: ClipboardList },
        { href: '/messages', label: 'Berichten', icon: MessageSquare, showBadge: true },
        { href: '/pro/profile', label: 'Profiel', icon: User },
      ];
    }

    if (userRole === 'ADMIN') {
      return [
        { href: '/admin', label: 'Admin', icon: Briefcase },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  // Check if current path matches nav item
  const isActiveLink = (href: string) => {
    if (href === '/pro/jobs') {
      return pathname === '/pro/jobs' || pathname.startsWith('/pro/jobs/');
    }
    if (href === '/pro/leads') {
      return pathname === '/pro/leads' || pathname.startsWith('/pro/leads/');
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={isLoggedIn ? (userRole === 'PRO' ? '/pro/jobs' : '/client/jobs') : '/'} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500">
            <span className="text-lg font-bold text-white">V</span>
          </div>
          <span className="text-xl font-bold text-surface-900">VakSpot</span>
        </Link>

        {/* Desktop Navigation */}
        {isLoggedIn && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActiveLink(item.href)
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.showBadge && <UnreadBadge className="ml-1" />}
              </Link>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {/* Client: Add job button */}
              {userRole === 'CLIENT' && (
                <Link href="/client/jobs/new" className="hidden sm:block">
                  <Button size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
                    Nieuwe klus
                  </Button>
                </Link>
              )}
              
              {/* User dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-surface-50 transition-colors">
                  <Avatar
                    src={session.user.image}
                    name={session.user.name}
                    size="sm"
                  />
                  <span className="hidden sm:block text-sm font-medium text-surface-700 max-w-[100px] truncate">
                    {session.user.name?.split(' ')[0]}
                  </span>
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 top-full mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="rounded-xl border border-surface-200 bg-white shadow-lg py-2">
                    <hr className="my-1 border-surface-200" />
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
              <Link href="/login">
                <Button variant="ghost" size="sm">Inloggen</Button>
              </Link>
              <Link href="/" className="hidden sm:block">
                <Button size="sm">Aan de slag</Button>
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          {isLoggedIn && (
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
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isLoggedIn && mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-200 bg-white">
          <nav className="flex flex-col p-4 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActiveLink(item.href)
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-surface-600 hover:bg-surface-50'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {item.showBadge && <UnreadBadge className="ml-auto" />}
              </Link>
            ))}
            
            {userRole === 'CLIENT' && (
              <Link
                href="/client/jobs/new"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2"
              >
                <Button className="w-full" leftIcon={<PlusCircle className="h-4 w-4" />}>
                  Nieuwe klus
                </Button>
              </Link>
            )}

            <hr className="my-2 border-surface-200" />
            
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
          </nav>
        </div>
      )}
    </header>
  );
}
