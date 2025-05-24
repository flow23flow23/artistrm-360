import { z } from 'zod';

// User schema
export const userSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
  role: z.enum(['admin', 'manager', 'artist']),
  createdAt: z.date(),
  updatedAt: z.date(),
  settings: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    notifications: z.boolean().default(true),
    language: z.string().default('es'),
  }).optional(),
});

// Project schema
export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre del proyecto es requerido"),
  description: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  artistId: z.string(),
  managerId: z.string(),
  status: z.enum(['draft', 'active', 'completed', 'archived']),
  milestones: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      dueDate: z.date(),
      completed: z.boolean().default(false),
    })
  ).optional(),
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      assignedTo: z.string().optional(),
      dueDate: z.date().optional(),
      status: z.enum(['pending', 'in_progress', 'completed', 'blocked']),
      priority: z.enum(['low', 'medium', 'high']).default('medium'),
    })
  ).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
});

// Content Asset schema
export const contentAssetSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre del asset es requerido"),
  type: z.enum(['image', 'audio', 'video', 'document', 'other']),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  metadata: z.object({
    size: z.number(),
    duration: z.number().optional(),
    dimensions: z.object({
      width: z.number().optional(),
      height: z.number().optional(),
    }).optional(),
    format: z.string().optional(),
  }).optional(),
  tags: z.array(z.string()).optional(),
  projectId: z.string().optional(),
  artistId: z.string(),
  versions: z.array(
    z.object({
      id: z.string(),
      url: z.string().url(),
      createdAt: z.date(),
      createdBy: z.string(),
      notes: z.string().optional(),
    })
  ).optional(),
  permissions: z.record(z.string(), z.object({
    view: z.boolean().default(true),
    edit: z.boolean().default(false),
    delete: z.boolean().default(false),
  })).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
});

// Analytics schema
export const analyticsSchema = z.object({
  id: z.string(),
  entityType: z.enum(['artist', 'project', 'content']),
  entityId: z.string(),
  metrics: z.record(z.string(), z.number()),
  period: z.string(),
  source: z.string(),
  timestamp: z.date(),
});

// Export types derived from schemas
export type User = z.infer<typeof userSchema>;
export type Project = z.infer<typeof projectSchema>;
export type ContentAsset = z.infer<typeof contentAssetSchema>;
export type Analytics = z.infer<typeof analyticsSchema>;
