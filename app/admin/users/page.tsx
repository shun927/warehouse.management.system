'use client';

import React, { useEffect, useState, useCallback, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Role } from '@/types'; // Adjusted path
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UI_TEXTS_JP, ROUTE_PATHS } from '@/constants';
import { ArrowLeftIcon, UserGroupIcon, ShieldCheckIcon, UserIcon as MemberIcon, PencilSquareIcon, UserPlusIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth'; // Adjusted path
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added Card imports

// Mock API calls - Replace with actual API calls later
const mockFetchUsers = async (): Promise<User[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    { id: '1', name: '管理者 太郎', email: 'admin@example.com', role: Role.ADMIN, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '2', name: 'メンバー 次郎', email: 'member@example.com', role: Role.MEMBER, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
};

const mockInviteUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  // In a real app, this would interact with your backend to invite/create a user
  console.log("Inviting user:", userData);
  return { ...userData, id: String(Math.random()), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isAdmin } = useAuth(); // This hook might need adjustment for App Router
  const [hasMounted, setHasMounted] = useState(false);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [inviteForm, setInviteForm] = useState({ email: '', name: '', role: Role.MEMBER });
  const [inviteLoading, setInviteLoading] = useState<boolean>(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const loadUsers = useCallback(async () => {
    if (!hasMounted) return;
    setLoading(true);
    setError(null);
    try {
      const data = await mockFetchUsers(); // Replace with actual API call
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(UI_TEXTS_JP.errorFetchingUsers);
      toast.error(UI_TEXTS_JP.errorFetchingUsers);
    } finally {
      setLoading(false);
    }
  }, [hasMounted]);

  useEffect(() => {
    if (hasMounted) {
      loadUsers();
    }
  }, [loadUsers, hasMounted]);

  const handleOpenInviteModal = () => {
    setInviteForm({ email: '', name: '', role: Role.MEMBER });
    setIsInviteModalOpen(true);
  };

  const handleInviteFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInviteForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setInviteForm(prev => ({ ...prev, role: value as Role }));
  };

  const handleInviteSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email.trim() || !inviteForm.name.trim()) {
        toast.error(UI_TEXTS_JP.fillRequiredFields);
        return;
    }
    
    setInviteLoading(true);
    try {
        await mockInviteUser({ 
            email: inviteForm.email, 
            name: inviteForm.name, 
            role: inviteForm.role 
        });
        toast.success(UI_TEXTS_JP.inviteUserSuccess);
        await loadUsers(); // Refresh user list
        setIsInviteModalOpen(false);
    } catch (err: any) {
        toast.error(err.message || UI_TEXTS_JP.inviteUserErrorGeneral);
    } finally {
        setInviteLoading(false);
    }
  };

  if (!hasMounted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div role="status">
            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
            <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div role="status" className="flex flex-col items-center">
            <svg aria-hidden="true" className="w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
            <p className="mt-2 text-sm text-gray-500">{UI_TEXTS_JP.loadingUsers}</p>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return <p className="text-destructive text-center p-4">{error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 text-primary hover:text-primary/80 flex items-center">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          {UI_TEXTS_JP.back}
      </Button>
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center">
            <UserGroupIcon className="h-7 w-7 mr-2 text-primary" />
            {UI_TEXTS_JP.adminUsers}
        </h1>
        {isAdmin && (
             <Button onClick={handleOpenInviteModal} className="flex items-center justify-center w-full sm:w-auto">
                <UserPlusIcon className="h-5 w-5 mr-2" />
                {UI_TEXTS_JP.inviteUserTitle}
            </Button>
        )}
      </div>
      
      {error && !loading && <p className="text-destructive bg-red-100 p-3 rounded-md mb-4" role="alert">{error}</p>}
      
      {users.length === 0 && !loading ? (
        <div className="text-center py-10 border rounded-lg">
          <UserGroupIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg mb-2">{UI_TEXTS_JP.noUsersFound}</p>
          {isAdmin && <p className="text-sm text-muted-foreground">{UI_TEXTS_JP.inviteFirstUserPrompt}</p>}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{UI_TEXTS_JP.name}</TableHead>
                <TableHead>{UI_TEXTS_JP.email}</TableHead>
                <TableHead>{UI_TEXTS_JP.role}</TableHead>
                {isAdmin && <TableHead className="text-right">{UI_TEXTS_JP.actions}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === Role.ADMIN ? 'default' : 'secondary'} 
                           className={`${user.role === Role.ADMIN ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                      {user.role === Role.ADMIN ? (
                        <ShieldCheckIcon className="h-4 w-4 mr-1 inline"/>
                      ) : (
                        <MemberIcon className="h-4 w-4 mr-1 inline" />
                      )}
                      {user.role === Role.ADMIN ? UI_TEXTS_JP.admin : UI_TEXTS_JP.member}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                       <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => router.push(`${ROUTE_PATHS.ADMIN_USERS}/${user.id}/edit`)} // Updated path
                          aria-label={`ユーザー ${user.name} を編集`}
                        >
                          <PencilSquareIcon className="h-4 w-4 mr-1" /> {UI_TEXTS_JP.edit}
                       </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

        <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <PlusCircleIcon className="h-6 w-6 mr-2"/>
                        {UI_TEXTS_JP.inviteUserTitle}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleInviteSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="inviteEmail" className="mb-1">
                            {UI_TEXTS_JP.labelEmailRequired}
                        </Label>
                        <Input
                            type="email"
                            id="inviteEmail"
                            name="email"
                            value={inviteForm.email}
                            onChange={handleInviteFormChange}
                            required
                            placeholder="user@example.com"
                        />
                    </div>
                    <div>
                        <Label htmlFor="inviteName" className="mb-1">
                            {UI_TEXTS_JP.labelNameRequired}
                        </Label>
                        <Input
                            type="text"
                            id="inviteName"
                            name="name"
                            value={inviteForm.name}
                            onChange={handleInviteFormChange}
                            required
                            placeholder={UI_TEXTS_JP.placeholderUserName}
                        />
                    </div>
                    <div>
                        <Label htmlFor="inviteRole" className="mb-1">
                           {UI_TEXTS_JP.labelRoleRequired}
                        </Label>
                        <Select 
                            name="role" 
                            value={inviteForm.role} 
                            onValueChange={handleRoleChange}
                        >
                            <SelectTrigger id="inviteRole">
                                <SelectValue placeholder={UI_TEXTS_JP.selectRole} />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(Role).map(roleValue => (
                                    <SelectItem key={roleValue} value={roleValue}>
                                        {roleValue === Role.ADMIN ? UI_TEXTS_JP.admin : UI_TEXTS_JP.member}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={inviteLoading}>
                                {UI_TEXTS_JP.cancel}
                            </Button>
                        </DialogClose>
                        <Button type="submit" variant="default" disabled={inviteLoading}>
                            {inviteLoading ? (
                                <div className="flex items-center">
                                    <svg aria-hidden="true" className="w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                                    {UI_TEXTS_JP.invitingUser}
                                </div>
                            ) : UI_TEXTS_JP.inviteUserSubmit}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
  );
}
