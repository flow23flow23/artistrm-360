// User types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'artist' | 'manager' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    spotify?: string;
    youtube?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
  genres?: string[];
  skills?: string[];
  achievements?: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: Date;
  icon?: string;
}

// Project types
export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: 'album' | 'single' | 'ep' | 'tour' | 'music-video' | 'collaboration' | 'other';
  status: 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  teamMembers: string[];
  tasks?: Task[];
  milestones?: Milestone[];
  files?: ProjectFile[];
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string[];
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'review' | 'done';
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  date: Date;
  achieved: boolean;
}

export interface ProjectFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

// Content types
export interface Content {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: 'audio' | 'video' | 'image' | 'document';
  fileUrl: string;
  thumbnailUrl?: string;
  metadata?: ContentMetadata;
  tags?: string[];
  collections?: string[];
  sharedWith?: string[];
  isPublic: boolean;
  views?: number;
  downloads?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentMetadata {
  duration?: number; // in seconds
  format?: string;
  resolution?: string;
  bitrate?: number;
  fileSize: number;
  artist?: string;
  album?: string;
  year?: number;
  genre?: string;
  isrc?: string;
}

// Event types
export interface Event {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: 'concert' | 'release' | 'interview' | 'meeting' | 'deadline' | 'other';
  date: Date;
  endDate?: Date;
  location?: EventLocation;
  attendees?: string[];
  reminder?: EventReminder;
  linkedProject?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface EventLocation {
  venue?: string;
  address?: string;
  city?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isOnline?: boolean;
  onlineUrl?: string;
}

export interface EventReminder {
  enabled: boolean;
  time: number; // minutes before event
  type: 'email' | 'push' | 'both';
}

// Analytics types
export interface Analytics {
  id: string;
  userId: string;
  platform: 'spotify' | 'youtube' | 'instagram' | 'tiktok' | 'soundcloud' | 'apple-music';
  date: Date;
  metrics: PlatformMetrics;
  contentId?: string;
  createdAt: Date;
}

export interface PlatformMetrics {
  plays?: number;
  views?: number;
  likes?: number;
  shares?: number;
  comments?: number;
  followers?: number;
  saves?: number;
  revenue?: number;
  demographics?: {
    age?: Record<string, number>;
    gender?: Record<string, number>;
    location?: Record<string, number>;
  };
}

// Finance types
export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  description?: string;
  date: Date;
  projectId?: string;
  eventId?: string;
  attachments?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  name: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'quarterly' | 'yearly' | 'project';
  projectId?: string;
  categories?: BudgetCategory[];
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetCategory {
  name: string;
  allocated: number;
  spent: number;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Zeus AI types
export interface ZeusCommand {
  id: string;
  userId: string;
  input: string;
  type: 'text' | 'voice';
  response?: ZeusResponse;
  context?: Record<string, any>;
  createdAt: Date;
}

export interface ZeusResponse {
  text: string;
  type: 'text' | 'action' | 'visualization' | 'error';
  data?: any;
  actions?: ZeusAction[];
  suggestions?: string[];
}

export interface ZeusAction {
  type: string;
  label: string;
  payload: Record<string, any>;
}