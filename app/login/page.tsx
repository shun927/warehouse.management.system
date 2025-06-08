"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'; // Will be updated later to reflect Supabase auth state
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Added Input
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { ROUTE_PATHS, UI_TEXTS_JP } from '@/constants';
import { APP_NAME } from '@/config';
import { ArrowRightOnRectangleIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'; // Added icons
import { createSupabaseBrowserClient } from '@/lib/supabase/client'; // Added Supabase client

// Re-usable LoadingSpinner component (consider moving to a shared components directory if used elsewhere)
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

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Added loading state for form submission
  const { isAuthenticated, loading: authLoading } = useAuth(); // authLoading from useAuth is for initial auth check
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(ROUTE_PATHS.DASHBOARD);
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true); // Start loading

    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください。");
      setLoading(false);
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Supabase signInError:", signInError);
        if (signInError.message === "Invalid login credentials") {
          setError("メールアドレスまたはパスワードが正しくありません。");
        } else {
          setError(signInError.message || UI_TEXTS_JP.loginFailed);
        }
      } else {
        // router.replace(ROUTE_PATHS.DASHBOARD); // Redirection is now handled by the useEffect watching isAuthenticated
        // Forcing a reload or relying on onAuthStateChange to update context and trigger redirect
        // No explicit redirect here, as useAuth should pick up the change.
        // If useAuth is not yet updated for Supabase, this might not redirect immediately.
      }
    } catch (err) {
      console.error("Login failed on page:", err);
      setError(err instanceof Error ? err.message : UI_TEXTS_JP.unknownError);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  if (authLoading && !isAuthenticated) { // This authLoading is from useAuth, for initial session check
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner message={UI_TEXTS_JP.loading} /></div>;
  }
  
  if (isAuthenticated) { // If already authenticated (e.g. navigating back to /login)
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner message={UI_TEXTS_JP.redirecting} /></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-sky-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">
            {APP_NAME}
          </CardTitle>
          <CardDescription>{UI_TEXTS_JP.loginDescription || "システムにアクセスするにはログインしてください"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                {UI_TEXTS_JP.emailAddress || "メールアドレス"}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center text-sm font-medium text-gray-700">
                <LockClosedIcon className="h-5 w-5 text-gray-400 mr-2" />
                {UI_TEXTS_JP.password || "パスワード"}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={loading || !email || !password}>
                {loading ? (
                  <LoadingSpinner size="h-5 w-5" color="text-white" />
                ) : (
                  <>
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    {UI_TEXTS_JP.login}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
