'use client';

import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MOCK_USERS, updateUser as apiUpdateUser } from '@/services/api';
import { User, Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { UI_TEXTS_JP, ROUTE_PATHS } from '@/constants';

const LoadingSpinner: React.FC<{ size?: string; color?: string; message?: string }> = ({
  size = 'h-8 w-8',
  color = 'text-blue-600',
  message,
}) => (
  <div className={`flex flex-col items-center justify-center ${message ? 'space-y-2' : ''}`}>
    <svg
      className={`animate-spin ${size} ${color}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    {message && <p className="text-sm text-gray-600">{message}</p>}
  </div>
);

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string; // Assuming route is /admin/users/[userId]/edit

  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>(Role.MEMBER);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [initialName, setInitialName] = useState('');
  const [initialRole, setInitialRole] = useState<Role>(Role.MEMBER);

  const loadUserData = useCallback(async () => {
    if (!userId) {
      toast.error("ユーザーIDが指定されていません。");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const fetchedUser = MOCK_USERS.find(u => u.id === userId);
      
      if (fetchedUser) {
        setUser(fetchedUser);
        setName(fetchedUser.name);
        setSelectedRole(fetchedUser.role);
        setInitialName(fetchedUser.name);
        setInitialRole(fetchedUser.role);
      } else {
        toast.error("指定されたユーザーが見つかりませんでした。");
      }
    } catch (err) {
      console.error("Failed to load user data:", err);
      toast.error(UI_TEXTS_JP.error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!userId || !user) {
      toast.error("ユーザー情報が読み込まれていません。");
      return;
    }
    if (!name.trim()) {
      toast.error(UI_TEXTS_JP.name + "は必須です。");
      return;
    }

    const hasChanged = name !== initialName || selectedRole !== initialRole;

    if (!hasChanged) {
      toast.info("変更がありません。");
      return;
    }

    setFormLoading(true);

    const updatedUserData: Partial<Pick<User, 'name' | 'role'>> = {};
    if (name !== initialName) updatedUserData.name = name;
    if (selectedRole !== initialRole) updatedUserData.role = selectedRole;
    
    try {
      await apiUpdateUser(userId, updatedUserData);
      toast.success(UI_TEXTS_JP.updateUserSuccess);
      setInitialName(name);
      setInitialRole(selectedRole);
      setTimeout(() => {
        router.push(ROUTE_PATHS.ADMIN_USERS);
      }, 1500);
    } catch (err) {
      console.error("Failed to update user:", err);
      const errorMessage = err instanceof Error ? err.message : UI_TEXTS_JP.updateUserError;
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-[calc(100vh-150px)]"><LoadingSpinner message={UI_TEXTS_JP.loading} /></div>;
  }

  if (!user && !loading) {
    return (
        <div className="container mx-auto p-4 flex flex-col items-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-500 text-center text-lg">ユーザー情報が見つかりません。</p>
            <Button onClick={() => router.push(ROUTE_PATHS.ADMIN_USERS)} variant="outline" className="mt-6">
                ユーザー一覧へ戻る
            </Button>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Button variant="ghost" onClick={handleBack} className="mb-6 text-blue-600 hover:text-blue-800">
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        {UI_TEXTS_JP.back}
      </Button>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">{UI_TEXTS_JP.pageTitleEditUser}</CardTitle>
        </CardHeader>
        <CardContent>
          {user && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  {UI_TEXTS_JP.email}
                </label>
                <Input
                    type="email"
                    id="userEmail"
                    value={user.email}
                    readOnly
                    disabled
                    className="bg-gray-100 text-gray-500"
                    title={UI_TEXTS_JP.emailCannotBeChanged}
                />
              </div>
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                  {UI_TEXTS_JP.name} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  id="userName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="例: 山田 太郎"
                />
              </div>
              
              <div>
                <label htmlFor="userRole" className="block text-sm font-medium text-gray-700 mb-1">
                  {UI_TEXTS_JP.role} <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => setSelectedRole(value as Role)}
                  required
                >
                  <SelectTrigger id="userRole">
                    <SelectValue placeholder="役割を選択..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Role).map((roleValue) => (
                      <SelectItem key={roleValue} value={roleValue}>
                        {roleValue === Role.ADMIN ? UI_TEXTS_JP.admin : UI_TEXTS_JP.member}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <CardFooter className="pt-8 flex justify-end">
                <Button type="submit" disabled={formLoading || loading} className="w-full sm:w-auto">
                  {formLoading ? <LoadingSpinner size="h-5 w-5" /> : UI_TEXTS_JP.saveUserChanges}
                </Button>
              </CardFooter>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
