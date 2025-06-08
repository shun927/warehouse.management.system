'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Package, Users, ScanLine, Warehouse, History, BoxIcon } from 'lucide-react'; // Assuming lucide-react for icons
import { useAuth } from '@/hooks/useAuth';

const mainNavLinks = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/items', label: 'Items', icon: Package },
  { href: '/my-rentals', label: 'My Rentals', icon: History },
  { href: '/scan', label: 'Scan QR', icon: ScanLine },
  { href: '/boxes', label: 'Boxes & Locations', icon: BoxIcon }, // Changed from /locations to /boxes
];

const adminNavLinks = [
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/rentals', label: 'All Rentals', icon: History },
  { href: '/admin/movements', label: 'Movement Log', icon: Warehouse },
  // Add other admin-specific links here
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 border-r bg-background p-4 space-y-6 hidden md:block">
      <nav className="flex flex-col space-y-2">
        <h3 className="px-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Main Menu</h3>
        {mainNavLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium',
              isActive(link.href)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <link.icon className="h-5 w-5" />
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      {user?.role === 'ADMIN' && (
        <nav className="flex flex-col space-y-2">
          <h3 className="px-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Admin Tools</h3>
          {adminNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium',
                isActive(link.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <link.icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      )}
    </aside>
  );
}
