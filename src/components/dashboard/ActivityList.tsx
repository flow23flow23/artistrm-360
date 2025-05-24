import { formatRelativeDate } from '@/utils';
import { FolderOpen, FileAudio, Calendar, DollarSign, Activity } from 'lucide-react';

interface Activity {
  id: string;
  type: 'project' | 'content' | 'event' | 'finance' | 'other';
  title: string;
  timestamp: Date;
  user: string;
}

interface ActivityListProps {
  activities: Activity[];
}

const typeIcons = {
  project: FolderOpen,
  content: FileAudio,
  event: Calendar,
  finance: DollarSign,
  other: Activity,
};

const typeColors = {
  project: 'text-zam-accent-primary',
  content: 'text-zam-accent-secondary',
  event: 'text-zam-accent-tertiary',
  finance: 'text-zam-accent-success',
  other: 'text-zam-accent-info',
};

export default function ActivityList({ activities }: ActivityListProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zam-text-primary">Recent Activity</h2>
        <button className="text-sm text-zam-accent-primary hover:underline">
          View all
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = typeIcons[activity.type];
          const color = typeColors[activity.type];
          
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`mt-0.5 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zam-text-primary">
                  {activity.title}
                </p>
                <p className="text-xs text-zam-text-tertiary mt-1">
                  {activity.user} • {formatRelativeDate(activity.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}