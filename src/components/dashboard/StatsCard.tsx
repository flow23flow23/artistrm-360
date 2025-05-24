import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
}

const colorClasses = {
  primary: 'bg-zam-accent-primary/20 text-zam-accent-primary',
  secondary: 'bg-zam-accent-secondary/20 text-zam-accent-secondary',
  success: 'bg-zam-accent-success/20 text-zam-accent-success',
  warning: 'bg-zam-accent-warning/20 text-zam-accent-warning',
  danger: 'bg-zam-accent-danger/20 text-zam-accent-danger',
  info: 'bg-zam-accent-info/20 text-zam-accent-info',
};

export default function StatsCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
}: StatsCardProps) {
  return (
    <div className="card card-hover group">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-zam-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-zam-text-primary">{value}</p>
          <div className="flex items-center gap-1">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-zam-accent-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-zam-accent-danger" />
            )}
            <span
              className={cn(
                'text-sm',
                trend === 'up' ? 'text-zam-accent-success' : 'text-zam-accent-danger'
              )}
            >
              {change}
            </span>
          </div>
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110',
            colorClasses[color]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}