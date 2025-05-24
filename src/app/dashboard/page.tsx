'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import StatsCard from '@/components/dashboard/StatsCard';
import ActivityList from '@/components/dashboard/ActivityList';
import UpcomingEvents from '@/components/dashboard/UpcomingEvents';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import QuickActions from '@/components/dashboard/QuickActions';
import {
  TrendingUp,
  FolderOpen,
  FileAudio,
  DollarSign,
  Calendar,
  Users,
  Activity,
  Zap,
} from 'lucide-react';

// Mock data - will be replaced with real data from Firestore
const mockStats = [
  {
    title: 'Active Projects',
    value: '12',
    change: '+2 this month',
    trend: 'up' as const,
    icon: FolderOpen,
    color: 'primary' as const,
  },
  {
    title: 'Total Content',
    value: '247',
    change: '+15 this week',
    trend: 'up' as const,
    icon: FileAudio,
    color: 'secondary' as const,
  },
  {
    title: 'Revenue (Monthly)',
    value: '$8,432',
    change: '+12.5%',
    trend: 'up' as const,
    icon: DollarSign,
    color: 'success' as const,
  },
  {
    title: 'Total Fans',
    value: '15.2K',
    change: '+523 this week',
    trend: 'up' as const,
    icon: Users,
    color: 'info' as const,
  },
];

const mockActivities = [
  {
    id: '1',
    type: 'project' as const,
    title: 'New album "Midnight Dreams" created',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    user: 'You',
  },
  {
    id: '2',
    type: 'content' as const,
    title: 'Uploaded 3 new demo tracks',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    user: 'You',
  },
  {
    id: '3',
    type: 'event' as const,
    title: 'Concert at Madison Square Garden scheduled',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    user: 'Sarah (Manager)',
  },
  {
    id: '4',
    type: 'finance' as const,
    title: 'Spotify royalty payment received',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    user: 'System',
  },
];

const mockEvents = [
  {
    id: '1',
    title: 'Studio Session - Track Recording',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    type: 'studio' as const,
    location: 'Abbey Road Studios',
  },
  {
    id: '2',
    title: 'Music Video Shoot',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    type: 'video' as const,
    location: 'Los Angeles',
  },
  {
    id: '3',
    title: 'Live Performance - Summer Festival',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    type: 'concert' as const,
    location: 'Central Park, NYC',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zam-text-primary">
          {greeting}, {user?.displayName || 'Artist'}!
        </h1>
        <p className="mt-2 text-zam-text-secondary">
          Here's an overview of your music career
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>

        {/* Quick Actions - Takes 1 column */}
        <div>
          <QuickActions />
        </div>

        {/* Activity List - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ActivityList activities={mockActivities} />
        </div>

        {/* Upcoming Events - Takes 1 column */}
        <div>
          <UpcomingEvents events={mockEvents} />
        </div>
      </div>

      {/* Zeus AI Assistant Float Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-zam-accent-primary to-zam-accent-secondary rounded-full shadow-lg hover:shadow-zam-lg transition-all duration-300 flex items-center justify-center group">
        <Zap className="h-6 w-6 text-zam-bg-primary" />
        <div className="absolute bottom-full right-0 mb-3 px-3 py-1.5 bg-zam-bg-secondary rounded-lg text-sm text-zam-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Ask Zeus AI
        </div>
      </button>
    </div>
  );
}