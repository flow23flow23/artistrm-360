import { formatDate } from '@/utils';
import { Calendar, MapPin, Music, Video, Mic } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'concert' | 'studio' | 'video' | 'meeting' | 'other';
  location: string;
}

interface UpcomingEventsProps {
  events: Event[];
}

const typeIcons = {
  concert: Mic,
  studio: Music,
  video: Video,
  meeting: Calendar,
  other: Calendar,
};

const typeColors = {
  concert: 'bg-zam-accent-primary/20 text-zam-accent-primary',
  studio: 'bg-zam-accent-secondary/20 text-zam-accent-secondary',
  video: 'bg-zam-accent-tertiary/20 text-zam-accent-tertiary',
  meeting: 'bg-zam-accent-info/20 text-zam-accent-info',
  other: 'bg-zam-accent-info/20 text-zam-accent-info',
};

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zam-text-primary">Upcoming Events</h2>
        <button className="text-sm text-zam-accent-primary hover:underline">
          View calendar
        </button>
      </div>
      
      <div className="space-y-3">
        {events.map((event) => {
          const Icon = typeIcons[event.type];
          const colorClass = typeColors[event.type];
          
          return (
            <div key={event.id} className="p-3 rounded-lg bg-zam-bg-hover border border-zam-border-primary hover:border-zam-border-secondary transition-colors">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-zam-text-primary truncate">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-zam-text-secondary">
                      {formatDate(event.date, 'short')}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-zam-text-tertiary">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}