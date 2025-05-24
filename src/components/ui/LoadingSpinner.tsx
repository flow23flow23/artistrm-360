import { cn } from '@/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export default function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn(
        'animate-spin text-zam-accent-primary',
        sizeClasses[size],
        className
      )}
    />
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zam-bg-primary">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-zam-text-secondary">Loading...</p>
      </div>
    </div>
  );
}

export function LoadingSection() {
  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner />
    </div>
  );
}