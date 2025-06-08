'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { ROUTE_PATHS, UI_TEXTS_JP, USER_AVATAR_URL } from '../constants';
import { APP_NAME } from '../config';
import { Button } from '@/components/ui/button';
import {
  ArrowLeftOnRectangleIcon,
  UserCircleIcon as ProfileIcon,
  ChevronDownIcon,
  Bars3Icon,
} from '@heroicons/react/24/solid';
import { NoSymbolIcon } from '@heroicons/react/24/outline';
import { Role } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const isOnline = useOnlineStatus();
  const router = useRouter();
  const pathname = usePathname();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push(ROUTE_PATHS.LOGIN);
  };

  const showLoginButton = hasMounted && !isAuthenticated && pathname !== ROUTE_PATHS.LOGIN;

  const navLinks = [
    { href: ROUTE_PATHS.DASHBOARD, label: UI_TEXTS_JP.dashboard },
    { href: ROUTE_PATHS.ITEMS_ALL, label: UI_TEXTS_JP.items },
    { href: ROUTE_PATHS.BOXES, label: UI_TEXTS_JP.boxes },
    { href: ROUTE_PATHS.SCAN_QR, label: UI_TEXTS_JP.scanQR },
  ];

  const adminNavLinks = [
    { href: ROUTE_PATHS.ADMIN_USERS, label: UI_TEXTS_JP.userManagement },
    { href: ROUTE_PATHS.RENTALS_ALL, label: UI_TEXTS_JP.allRentals },
    // Add other admin-specific links here
  ];

  if (!hasMounted) {
    return (
        <nav className="bg-background border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href={ROUTE_PATHS.DASHBOARD} className="flex-shrink-0 text-xl font-bold text-primary break-keep">
                        {APP_NAME}
                    </Link>
                    <div className="flex items-center">
                        <div className="h-8 w-8 bg-muted rounded-full animate-pulse md:hidden"></div> {/* Mobile menu placeholder */}
                        <div className="h-8 w-24 bg-muted rounded-md animate-pulse hidden md:block"></div> {/* Desktop user menu placeholder */}
                    </div>
                </div>
            </div>
        </nav>
    );
  }

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={ROUTE_PATHS.DASHBOARD} className="flex-shrink-0 text-xl font-bold text-primary break-keep">
            {APP_NAME}
          </Link>

          {/* Desktop Navigation - Hidden on small screens */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(link => (
                <Link key={link.href} href={link.href} passHref>
                    <Button variant={pathname === link.href ? "secondary" : "ghost"} size="sm">{link.label}</Button>
                </Link>
            ))}
            {isAuthenticated && user?.role === Role.ADMIN && adminNavLinks.map(link => (
                <Link key={link.href} href={link.href} passHref>
                    <Button variant={pathname === link.href ? "secondary" : "ghost"} size="sm">{link.label}</Button>
                </Link>
            ))}
          </div>
          
          <div className="flex items-center">
            {!isOnline && (
              <div className="mr-3 flex items-center text-sm text-destructive" title={UI_TEXTS_JP.offlineStatus}>
                <NoSymbolIcon className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">{UI_TEXTS_JP.offline}</span>
              </div>
            )}

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={USER_AVATAR_URL} alt={user.name || 'User avatar'} />
                      <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                    {/* Desktop: show name and chevron next to avatar */} 
                    <span className="hidden md:flex items-center ml-2">
                        <span className="text-foreground text-sm mr-1">
                            {user.name}
                        </span>
                        <ChevronDownIcon className="h-4 w-4 text-muted-foreground"/>
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground truncate">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground mt-0.5">
                        {user.role === Role.ADMIN ? UI_TEXTS_JP.admin : UI_TEXTS_JP.member}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={ROUTE_PATHS.PROFILE} className="flex items-center w-full cursor-pointer">
                      <ProfileIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                      {UI_TEXTS_JP.profile}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 flex items-center w-full cursor-pointer">
                    <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                    {UI_TEXTS_JP.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : showLoginButton ? (
              <Link href={ROUTE_PATHS.LOGIN} passHref>
                <Button variant="default" size="sm">{UI_TEXTS_JP.login}</Button>
              </Link>
            ) : null}

            {/* Mobile Menu Button - Hidden on medium and larger screens */}
            <div className="md:hidden ml-2">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Bars3Icon className="h-6 w-6" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                        <SheetHeader className="border-b pb-4 mb-4">
                            <SheetTitle>{APP_NAME} - {UI_TEXTS_JP.menu}</SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col space-y-1">
                            {navLinks.map(link => (
                                <SheetClose asChild key={`mobile-${link.href}`}>
                                    <Link href={link.href} passHref>
                                        <Button variant={pathname === link.href ? "secondary" : "ghost"} className="w-full justify-start text-base py-3">{link.label}</Button>
                                    </Link>
                                </SheetClose>
                            ))}
                            {isAuthenticated && user?.role === Role.ADMIN && adminNavLinks.map(link => (
                                <SheetClose asChild key={`mobile-admin-${link.href}`}>
                                    <Link href={link.href} passHref>
                                        <Button variant={pathname === link.href ? "secondary" : "ghost"} className="w-full justify-start text-base py-3">{link.label}</Button>
                                    </Link>
                                </SheetClose>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
