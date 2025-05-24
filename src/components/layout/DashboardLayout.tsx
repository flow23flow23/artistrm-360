'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils';
import {
  LayoutDashboard,
  FolderOpen,
  FileAudio,
  Calendar,
  DollarSign,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  Bell,
  Search,
  ChevronDown,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderOpen },
  { name: 'Content', href: '/dashboard/content', icon: FileAudio },
  { name: 'Events', href: '/dashboard/events', icon: Calendar },
  { name: 'Finances', href: '/dashboard/finances', icon: DollarSign },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Fans', href: '/dashboard/fans', icon: Users },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-zam-bg-primary">
      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          sidebarOpen ? 'block' : 'hidden'
        )}
      >
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-zam-bg-secondary">
          <div className="flex h-16 items-center justify-between px-6">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-zam-accent-primary" />
              <span className="text-xl font-bold text-zam-text-primary">
                ArtistRM <span className="text-gradient">360</span>
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-zam-text-secondary hover:text-zam-text-primary"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-zam-accent-primary/10 text-zam-accent-primary'
                      : 'text-zam-text-secondary hover:bg-zam-bg-hover hover:text-zam-text-primary'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-zam-bg-secondary border-r border-zam-border-primary">
        <div className="flex h-16 items-center px-6 border-b border-zam-border-primary">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-zam-accent-primary" />
            <span className="text-xl font-bold text-zam-text-primary">
              ArtistRM <span className="text-gradient">360</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-zam-accent-primary/10 text-zam-accent-primary'
                    : 'text-zam-text-secondary hover:bg-zam-bg-hover hover:text-zam-text-primary'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-zam-border-primary p-3">
          <Link
            href="/dashboard/settings"
            className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zam-text-secondary hover:bg-zam-bg-hover hover:text-zam-text-primary transition-all"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-zam-border-primary bg-zam-bg-primary/95 backdrop-blur px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-zam-text-secondary hover:text-zam-text-primary"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search bar */}
          <div className="flex-1 flex items-center">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zam-text-tertiary" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-zam-bg-secondary border border-zam-border-primary rounded-lg text-sm text-zam-text-primary placeholder:text-zam-text-tertiary focus:outline-none focus:ring-2 focus:ring-zam-accent-primary/50 focus:border-zam-accent-primary"
              />
            </div>
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-4">
            {/* Zeus AI Button */}
            <button className="relative p-2 text-zam-text-secondary hover:text-zam-text-primary transition-colors">
              <Zap className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-zam-accent-primary rounded-full animate-pulse" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-zam-text-secondary hover:text-zam-text-primary transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-zam-accent-danger rounded-full" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-zam-bg-hover transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zam-accent-primary to-zam-accent-secondary flex items-center justify-center text-zam-bg-primary font-medium">
                  {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-zam-text-primary">
                    {user?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-zam-text-secondary capitalize">
                    {user?.role || 'artist'}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-zam-text-secondary" />
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-zam-bg-secondary border border-zam-border-primary shadow-lg">
                  <div className="p-2">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-3 px-3 py-2 text-sm text-zam-text-secondary hover:bg-zam-bg-hover hover:text-zam-text-primary rounded-lg transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zam-accent-primary to-zam-accent-secondary flex items-center justify-center text-zam-bg-primary font-medium">
                        {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium">{user?.displayName}</p>
                        <p className="text-xs text-zam-text-tertiary">{user?.email}</p>
                      </div>
                    </Link>
                  </div>
                  <div className="border-t border-zam-border-primary">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-3 px-5 py-2.5 text-sm text-zam-text-secondary hover:bg-zam-bg-hover hover:text-zam-text-primary w-full transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}