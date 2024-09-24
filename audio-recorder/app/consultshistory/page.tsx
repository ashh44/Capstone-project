"use client";

import React, { ErrorInfo, ReactNode } from 'react';
import dynamic from 'next/dynamic';

const UserHistory = dynamic(() => import('./UsersHistory'), { ssr: false });

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="mb-2">Error: {this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ConsultHistoryPage() {
  return (
    <ErrorBoundary>
      <UserHistory />
    </ErrorBoundary>
  );
}