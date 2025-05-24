import Link from 'next/link';
import { Plus, Upload, Calendar, BarChart3, FileText, Users } from 'lucide-react';

const actions = [
  {
    title: 'New Project',
    description: 'Start a new music project',
    icon: Plus,
    href: '/dashboard/projects/new',
    color: 'bg-zam-accent-primary/20 text-zam-accent-primary hover:bg-zam-accent-primary/30',
  },
  {
    title: 'Upload Content',
    description: 'Add new tracks or media',
    icon: Upload,
    href: '/dashboard/content/upload',
    color: 'bg-zam-accent-secondary/20 text-zam-accent-secondary hover:bg-zam-accent-secondary/30',
  },
  {
    title: 'Schedule Event',
    description: 'Plan your next performance',
    icon: Calendar,
    href: '/dashboard/events/new',
    color: 'bg-zam-accent-tertiary/20 text-zam-accent-tertiary hover:bg-zam-accent-tertiary/30',
  },
  {
    title: 'View Analytics',
    description: 'Check your performance metrics',
    icon: BarChart3,
    href: '/dashboard/analytics',
    color: 'bg-zam-accent-info/20 text-zam-accent-info hover:bg-zam-accent-info/30',
  },
  {
    title: 'Generate Report',
    description: 'Create monthly summary',
    icon: FileText,
    href: '/dashboard/reports',
    color: 'bg-zam-accent-success/20 text-zam-accent-success hover:bg-zam-accent-success/30',
  },
  {
    title: 'Manage Team',
    description: 'Invite collaborators',
    icon: Users,
    href: '/dashboard/team',
    color: 'bg-zam-accent-warning/20 text-zam-accent-warning hover:bg-zam-accent-warning/30',
  },
];

export default function QuickActions() {
  return (
    <div className="card h-full">
      <h2 className="text-lg font-semibold text-zam-text-primary mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group p-4 rounded-lg bg-zam-bg-hover border border-zam-border-primary hover:border-zam-border-secondary transition-all"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-medium text-zam-text-primary group-hover:text-zam-accent-primary transition-colors">
              {action.title}
            </h3>
            <p className="text-xs text-zam-text-tertiary mt-1">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}