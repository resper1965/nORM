"use client";

import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { logger } from '@/lib/utils/logger';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  React.useEffect(() => {
    logger.error('Component error boundary caught error', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Algo deu errado!</CardTitle>
          </div>
          <CardDescription>
            Um erro ocorreu neste componente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-mono text-muted-foreground">
                {error.message}
              </p>
            </div>
          )}
          <Button onClick={resetErrorBoundary} className="w-full">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

export function ErrorBoundary({
  children,
  fallback = ErrorFallback,
  onError,
}: ErrorBoundaryProps) {
  const handleError = (error: Error, info: React.ErrorInfo) => {
    logger.error('React Error Boundary', error, {
      componentStack: info.componentStack,
    });
    
    if (onError) {
      onError(error, info);
    }
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={fallback}
      onError={handleError}
      onReset={() => {
        // Reset qualquer estado que precise ser limpo
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

