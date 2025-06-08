"use client"; // DashboardPage uses client-side hooks

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth'; // Adjusted path
import { fetchNotifications, fetchUserRentals, fetchAllRentals, fetchItems, fetchBoxes, fetchUsers } from '@/services/api'; // Adjusted path
import { Notification, Rental, Role, Item, Box, User as UserType } from '@/types'; // Adjusted path
import { UI_TEXTS_JP, ROUTE_PATHS, DEFAULT_IMAGE_URL } from '@/constants'; // Adjusted path
import { ADMIN_DASHBOARD_RENTAL_LIMIT } from '@/config'; // Adjusted path
import { 
    BellIcon, 
    ArchiveBoxIcon, 
    QrCodeIcon,
    ListBulletIcon,
    UserCircleIcon, 
    ExclamationTriangleIcon,
    ShoppingBagIcon, 
    ClockIcon,
    UsersIcon 
} from '@heroicons/react/24/outline'; 
import { UserGroupIcon as AdminUserIcon } from '@heroicons/react/24/outline'; 
import Link from 'next/link'; // Use Next.js Link
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // shadcn/ui
import { Button } from "@/components/ui/button"; // shadcn/ui
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // shadcn/ui
import { Badge } from "@/components/ui/badge"; // shadcn/ui

// Content from pages/DashboardPage.tsx, adapted for Next.js
export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dashboardRentals, setDashboardRentals] = useState<Rental[]>([]); 
  const [notificationsLoading, setNotificationsLoading] = useState<boolean>(true);
  const [rentalsLoading, setRentalsLoading] = useState<boolean>(true); 

  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalBoxes, setTotalBoxes] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [hasMounted, setHasMounted] = useState(false); // New state for hydration fix

  useEffect(() => {
    setHasMounted(true); // Set to true after component mounts on client
  }, []);

  useEffect(() => {
    if (user && hasMounted) { // Check hasMounted here
      const loadNotifications = async () => {
        setNotificationsLoading(true);
        try {
          const notifs = await fetchNotifications(user.id);
          setNotifications(notifs);
        } catch (error) {
          console.error("Failed to load notifications:", error);
        } finally {
          setNotificationsLoading(false);
        }
      };

      const loadRentalsData = async () => {
        setRentalsLoading(true);
        try {
            if (isAdmin) {
                const allRentals = await fetchAllRentals();
                const memberRentals = allRentals
                    .filter(r => r.user?.role === Role.MEMBER)
                    .sort((a, b) => new Date(b.rentedAt).getTime() - new Date(a.rentedAt).getTime())
                    .slice(0, ADMIN_DASHBOARD_RENTAL_LIMIT);
                setDashboardRentals(memberRentals);
            } else {
                const rentals = await fetchUserRentals(user.id);
                setDashboardRentals(rentals);
            }
        } catch (error) {
            console.error("Failed to load rentals data:", error);
        } finally {
            setRentalsLoading(false);
        }
      };
      
      const loadAdminStats = async () => {
        if (isAdmin) {
            setStatsLoading(true);
            try {
                const [itemsData, boxesData, usersData] = await Promise.all([fetchItems(), fetchBoxes(), fetchUsers()]);
                setTotalItems(itemsData.length);
                setTotalBoxes(boxesData.length);
                setTotalUsers(usersData.length);
            } catch (error) {
                console.error("Failed to load admin stats:", error);
            } finally {
                setStatsLoading(false);
            }
        }
      };

      loadNotifications();
      loadRentalsData();
      if(isAdmin) loadAdminStats();
    }
  }, [user, isAdmin, hasMounted]); // Add hasMounted to dependency array

  if (!hasMounted || (notificationsLoading && rentalsLoading && (isAdmin ? statsLoading : true))) { 
    return (
      <div className="flex justify-center items-center h-[calc(100vh-150px)]">
        <div role="status">
            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
            <span className="sr-only">{UI_TEXTS_JP.loading}...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    // In Next.js, redirects are often handled by middleware or page-level logic
    // For now, just showing a message. Proper auth flow would redirect to login.
    return <p>ログインしてください。</p>; 
  }
  
  const renderRentalItem = (rental: Rental, isForAdminView: boolean) => {
    const isOverdue = rental.dueDate ? !rental.returnedAt && new Date(rental.dueDate) < new Date() : false;
    return (
        <Card key={rental.id} className={`${isOverdue ? 'border-red-400' : (rental.returnedAt ? 'border-gray-300' : 'border-blue-300')} border-l-4`}>
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center space-x-0 sm:space-x-4">
                <Avatar className="w-20 h-20 rounded-md mb-3 sm:mb-0 flex-shrink-0">
                    <AvatarImage src={rental.item.imageUrl || DEFAULT_IMAGE_URL} alt={rental.item.name} />
                    <AvatarFallback>{rental.item.name.substring(0,2)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <Button variant="link" asChild className="p-0 h-auto font-semibold text-blue-600 hover:underline">
                        <Link href={`${ROUTE_PATHS.ITEMS}/${rental.item.id}`}>
                            {rental.item.name}
                        </Link>
                    </Button>
                    <p className="text-sm text-muted-foreground">{UI_TEXTS_JP.quantity}: {rental.quantity}</p>
                    {isForAdminView && rental.user && (
                        <p className="text-sm text-muted-foreground">{UI_TEXTS_JP.rentedByLabel}: {rental.user.name}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{UI_TEXTS_JP.rentedAtLabel}: {new Date(rental.rentedAt).toLocaleDateString()}</p>
                    {!rental.returnedAt && rental.dueDate && (
                        <p className={`text-sm flex items-center ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                            <ClockIcon className={`h-4 w-4 mr-1 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`} />
                            {UI_TEXTS_JP.dueDateLabel}: {new Date(rental.dueDate).toLocaleDateString()}
                            {isOverdue && <Badge variant="destructive" className="ml-1">期限超過</Badge>}
                        </p>
                    )}
                    {!rental.returnedAt && !rental.dueDate && (
                        <p className="text-sm text-muted-foreground flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                            {UI_TEXTS_JP.dueDateLabel}: 未設定
                        </p>
                    )}
                    {rental.returnedAt && (
                        <p className="text-sm text-green-600">{UI_TEXTS_JP.statusReturned} ({UI_TEXTS_JP.returnedOnLabel}: {new Date(rental.returnedAt).toLocaleDateString()})</p>
                    )}
                    {!isForAdminView && rental.returnedAt && ( 
                        <p className="text-sm text-green-600">この貸出は返却済みです。</p>
                    )}
                </div>
                {isForAdminView && !rental.returnedAt && (
                    <Badge variant="default" className="mt-2 sm:mt-0 self-start sm:self-center">
                        {UI_TEXTS_JP.statusRented}
                    </Badge>
                )}
            </CardContent>
        </Card>
    );
  };

  // Main Dashboard Content (Admin View)
  const AdminDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{UI_TEXTS_JP.totalItems}</CardTitle>
            <ShoppingBagIcon className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{UI_TEXTS_JP.totalBoxes}</CardTitle>
            <ArchiveBoxIcon className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBoxes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{UI_TEXTS_JP.totalUsers}</CardTitle>
            <UsersIcon className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{UI_TEXTS_JP.quickActions}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <Button variant="outline" asChild className="flex flex-col items-center h-auto p-4">
            <Link href={ROUTE_PATHS.ITEMS_ADD}>
              <ShoppingBagIcon className="h-10 w-10 text-blue-500 mb-2" />
              <span className="text-sm text-center">{UI_TEXTS_JP.addNewItem}</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex flex-col items-center h-auto p-4">
            <Link href={ROUTE_PATHS.BOXES_ADD}>
              <ArchiveBoxIcon className="h-10 w-10 text-green-500 mb-2" />
              <span className="text-sm text-center">{UI_TEXTS_JP.addNewBox}</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex flex-col items-center h-auto p-4">
            <Link href={ROUTE_PATHS.SCAN_QR}>
              <QrCodeIcon className="h-10 w-10 text-indigo-500 mb-2" />
              <span className="text-sm text-center">{UI_TEXTS_JP.scanQrCode}</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex flex-col items-center h-auto p-4">
            <Link href={ROUTE_PATHS.ADMIN_USERS}>
              <AdminUserIcon className="h-10 w-10 text-red-500 mb-2" />
              <span className="text-sm text-center">{UI_TEXTS_JP.manageUsers}</span>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Member Rentals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{UI_TEXTS_JP.recentMemberRentals}</CardTitle>
            <Button variant="link" asChild>
                <Link href={ROUTE_PATHS.RENTALS_ALL}>
                    {UI_TEXTS_JP.viewAllRentals}
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
        {rentalsLoading ? (
          <p>{UI_TEXTS_JP.loading}</p> // Simplified loading
        ) : dashboardRentals.length > 0 ? (
          <div className="space-y-4">
            {dashboardRentals.map(rental => renderRentalItem(rental, true))}
          </div>
        ) : (
          <p className="text-muted-foreground">{UI_TEXTS_JP.noRecentMemberRentals}</p>
        )}
        </CardContent>
      </Card>
    </div>
  );

  // Main Dashboard Content (Member View)
  const MemberDashboard = () => (
    <div className="space-y-6">
      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BellIcon className="h-6 w-6 mr-2 text-yellow-500" />
            {UI_TEXTS_JP.notifications}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notificationsLoading ? (
            <p>{UI_TEXTS_JP.loading}</p> // Simplified loading
          ) : notifications.length > 0 ? (
            <ul className="space-y-3">
              {notifications.map((notif) => (
                <li key={notif.id} className={`p-3 rounded-md flex items-start space-x-3 ${
                  notif.type === 'overdue' ? 'bg-destructive/10 border-l-4 border-destructive' : 
                  notif.type === 'long_rental' ? 'bg-yellow-400/10 border-l-4 border-yellow-400' : 'bg-blue-400/10 border-l-4 border-blue-400'
                }`}>
                  {notif.type === 'overdue' && <ExclamationTriangleIcon className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />}
                  {notif.type === 'long_rental' && <ClockIcon className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />}
                  {notif.type !== 'overdue' && notif.type !== 'long_rental' && <BellIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />}
                  <div>
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-muted-foreground">{notif.message}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">{new Date(notif.date).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">{UI_TEXTS_JP.noNotifications}</p>
          )}
        </CardContent>
      </Card>

      {/* My Rentals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{UI_TEXTS_JP.myRentals}</CardTitle>
            <Button variant="link" asChild>
                <Link href={ROUTE_PATHS.RENTALS_MY}>
                    {UI_TEXTS_JP.viewAllMyRentals}
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
          {rentalsLoading ? (
            <p>{UI_TEXTS_JP.loading}</p> // Simplified loading
          ) : dashboardRentals.length > 0 ? (
            <div className="space-y-4">
              {dashboardRentals.map(rental => renderRentalItem(rental, false))}
            </div>
          ) : (
            <p className="text-muted-foreground">{UI_TEXTS_JP.noCurrentRentals}</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{UI_TEXTS_JP.quickActions}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Button variant="outline" asChild className="flex flex-col items-center h-auto p-4">
            <Link href={ROUTE_PATHS.ITEMS_ALL}>
              <ListBulletIcon className="h-10 w-10 text-green-500 mb-2" />
              <span className="text-sm text-center">{UI_TEXTS_JP.viewAllItems}</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex flex-col items-center h-auto p-4">
            <Link href={ROUTE_PATHS.BOXES}> {/* Changed from ROUTE_PATHS.BOXES_ALL */}
              <ArchiveBoxIcon className="h-10 w-10 text-blue-500 mb-2" />
              <span className="text-sm text-center">{UI_TEXTS_JP.viewAllBoxes}</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex flex-col items-center h-auto p-4">
            <Link href={ROUTE_PATHS.SCAN_QR}>
              <QrCodeIcon className="h-10 w-10 text-indigo-500 mb-2" />
              <span className="text-sm text-center">{UI_TEXTS_JP.scanQrCode}</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex flex-col items-center h-auto p-4">
            <Link href={ROUTE_PATHS.PROFILE}>
              <UserCircleIcon className="h-10 w-10 text-purple-500 mb-2" />
              <span className="text-sm text-center">{UI_TEXTS_JP.myProfile}</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Render Admin or Member dashboard based on role
  // Ensure this part is also only rendered after hasMounted is true
  if (!hasMounted) {
    // This will be caught by the loading spinner at the top, but as a safeguard:
    return <div className="flex justify-center items-center h-[calc(100vh-150px)]"><p>{UI_TEXTS_JP.loading}</p></div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {isAdmin ? UI_TEXTS_JP.adminDashboard : UI_TEXTS_JP.memberDashboard}
      </h1>
      {isAdmin ? <AdminDashboard /> : <MemberDashboard />}
    </div>
  );
}
