'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UI_TEXTS_JP } from '@/constants';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Uncaught error caught by global error.tsx:", error);
  }, [error]);

  return (
    <html lang="ja">
      <body>
        <div className="container mx-auto p-6 min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-700">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {UI_TEXTS_JP.error}
            </h1>
            <p className="text-gray-700 mb-4">
              {UI_TEXTS_JP.unknownError}
            </p>
            <Button onClick={() => reset()} variant="destructive" className="mb-4">
              {UI_TEXTS_JP.retry}
            </Button>
            {process.env.NODE_ENV === 'development' && error?.message && (
              <details className="mt-4 text-sm text-gray-600 text-left bg-gray-100 p-3 rounded">
                <summary className="cursor-pointer font-medium">{UI_TEXTS_JP.details}</summary>
                <pre className="mt-2 p-2 bg-gray-200 rounded overflow-auto text-xs whitespace-pre-wrap">
                  {error.message}
                  {error.digest && `\nDigest: ${error.digest}`}
                  {error.stack && `\nStack:\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
