"use client";
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button'; // Changed to shadcn/ui button

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
    // You could log this to an error reporting service here
  }

  private handleResetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Potentially navigate to a safe route or reload, depending on desired behavior.
    // For now, just reloading the page.
    window.location.reload();
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto p-6 min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-700">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              エラーが発生しました
            </h1>
            <p className="text-gray-700 mb-4">
              {this.props.fallbackMessage || "申し訳ありませんが、アプリケーションの処理中に予期せぬエラーが発生しました。"}
            </p>
            <Button onClick={this.handleResetError} variant="destructive" className="mb-4"> // Changed variant to destructive
              ページを再読み込み
            </Button>
            {this.state.error && (
              <details className="mt-4 text-sm text-gray-600 text-left bg-gray-100 p-3 rounded">
                <summary className="cursor-pointer font-medium">エラー詳細 (開発者向け)</summary>
                <pre className="mt-2 p-2 bg-gray-200 rounded overflow-auto text-xs whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo && `\nComponent Stack:\n${this.state.errorInfo.componentStack}`}
                  {this.state.error.stack && `\nError Stack:\n${this.state.error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;