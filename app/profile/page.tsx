"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { UI_TEXTS_JP, USER_AVATAR_URL, ROUTE_PATHS } from '../../constants';
import { Role } from '../../types';
import {
  ArrowLeftIcon,
  UserCircleIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  UserIcon as MemberRoleIcon,
} from '@heroicons/react/24/outline';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-150px)]">
        <p>{UI_TEXTS_JP.loading}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle className="text-center text-destructive">{UI_TEXTS_JP.error}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>ユーザー情報が見つかりません。ログインしてください。</p>
          <Button onClick={() => router.push(ROUTE_PATHS.LOGIN)} className="mt-4">
            {UI_TEXTS_JP.login}
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const handleBack = () => {
    router.back();
  };

  const profileItems = [
    { label: UI_TEXTS_JP.name, value: user.name, icon: <UserCircleIcon className="h-5 w-5 text-muted-foreground" /> },
    { label: UI_TEXTS_JP.email, value: user.email, icon: <EnvelopeIcon className="h-5 w-5 text-muted-foreground" /> },
    {
      label: UI_TEXTS_JP.role,
      value: user.role === Role.ADMIN ? UI_TEXTS_JP.admin : UI_TEXTS_JP.member,
      icon: user.role === Role.ADMIN 
        ? <ShieldCheckIcon className="h-5 w-5 text-muted-foreground" /> 
        : <MemberRoleIcon className="h-5 w-5 text-muted-foreground" />,
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={handleBack}
        className="mb-6 flex items-center text-primary hover:text-primary/80"
        aria-label={UI_TEXTS_JP.back}
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        {UI_TEXTS_JP.back}
      </Button>

      <Card className="max-w-xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">{UI_TEXTS_JP.profile}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center mb-8">
            <Avatar className="w-24 h-24 mb-3">
              <AvatarImage src={USER_AVATAR_URL} alt={user.name || 'User Avatar'} />
              <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-semibold text-foreground">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>

          <div className="space-y-4">
            {profileItems.map((item) => (
              <div key={item.label} className="flex items-start p-4 bg-muted/50 rounded-lg border">
                <div className="mr-4 flex-shrink-0 mt-1">{item.icon}</div>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                  <p className="text-lg text-foreground break-all">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
