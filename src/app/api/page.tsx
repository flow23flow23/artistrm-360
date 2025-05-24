import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader, 
  Grid, 
  Button, 
  IconButton, 
  Divider, 
  Chip, 
  Avatar, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Tooltip,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Add as AddIcon,
  Link as LinkIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Sync as SyncIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  MoreVert as MoreVertIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useResponsiveUI } from '@/hooks/useResponsiveUI';
import { useFirestoreIntegration } from '@/hooks/useFirestoreIntegration';
import { db } from '@/utils/firebase';
import { doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

// Importar logos de plataformas
import spotifyLogo from '@/assets/logos/spotify.png';
import youtubeLogo from '@/assets/logos/youtube.png';
import instagramLogo from '@/assets/logos/instagram.png';
import tiktokLogo from '@/assets/logos/tiktok.png';
import soundcloudLogo from '@/assets/logos/soundcloud.png';
import appleMusicLogo from '@/assets/logos/apple-music.png';
import twitchLogo from '@/assets/logos/twitch.png';
import discordLogo from '@/assets/logos/discord.png';
import bandcampLogo from '@/assets/logos/bandcamp.png';
import nftLogo from '@/assets/logos/nft.png';

// Tipos para integraciones
interface Integration {
  id: string;
  platform: string;
  name: string;
  status: 'active' | 'inactive' | 'pending' | 'error';
  connectedAt: Date;
  lastSyncAt: Date;
  credentials: {
    clientId: string;
    clientSecret: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    scopes: string[];
  };
  settings: {
    autoSync: boolean;
    syncInterval: number;
    syncContent: string[];
    notifications: boolean;
  };
  stats: {
    followers: number;
    engagement: number;
    content: number;
    lastUpdated: Date;
  };
  error?: string;
}

// Tipos para flujos de trabajo
interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  trigger: {
    type: 'schedule' | 'event' | 'manual';
    schedule?: string;
    event?: string;
  };
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
  lastRunAt?: Date;
  nextRunAt?: Date;
  runCount: number;
  successCount: number;
  errorCount: number;
}

interface WorkflowStep {
  id: string;
  type: 'platform_action' | 'condition' | 'delay' | 'notification';
  name: string;
  platform?: string;
  action?: string;
  parameters?: any;
  condition?: {
    field: string;
    operator: string;
    value: any;
  };
  delay?: number;
  notification?: {
    channel: string;
    message: string;
  };
  status: 'pending' | 'success' | 'error' | 'skipped';
  result?: any;
  error?: string;
}

// Mapeo de logos por plataforma
const platformLogos: Record<string, string> = {
  'spotify': spotifyLogo,
  'youtube': youtubeLogo,
  'instagram': instagramLogo,
  'tiktok': tiktokLogo,
  'soundcloud': soundcloudLogo,
  'apple_music': appleMusicLogo,
  'twitch': twitchLogo,
  'discord': discordLogo,
  'bandcamp': bandcampLogo,
  'nft': nftLogo
};

// Componente principal de Integraciones
const Integrations: React.FC = () => {
  const theme = useTheme();
  const { isMobile, isTablet, responsiveValue } = useResponsiveUI();
  const { user } = useAuth();
  
  // Estados para integraciones y flujos de trabajo
  const [activeTab, setActiveTab] = useState<number>(0);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isAddIntegrationOpen, setIsAddIntegrationOpen] = useState<boolean>(false);
  const [isAddWorkflowOpen, setIsAddWorkflowOpen] = useState<boolean>(false);
  const [isEditIntegrationOpen, setIsEditIntegrationOpen] = useState<boolean>(false);
  const [isEditWorkflowOpen, setIsEditWorkflowOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [deleteItemId, setDeleteItemId] = useState<string>('');
  const [deleteItemType, setDeleteItemType] = useState<'integration' | 'workflow'>('integration');
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCredentials, setShowCredentials] = useState<boolean>(false);
  
  // Obtener integraciones de Firestore
  const { 
    data: integrations, 
    loading: integrationsLoading, 
    error: integrationsError,
    refresh: refreshIntegrations
  } = useFirestoreIntegration<Integration>('integrations', {
    queryConstraints: [
      // En una implementación real, filtrar por userId
    ],
    realtimeUpdates: true
  });
  
  // Obtener flujos de trabajo de Firestore
  const { 
    data: workflows, 
    loading: workflowsLoading, 
    error: workflowsError,
    refresh: refreshWorkflows
  } = useFirestoreIntegration<Workflow>('workflows', {
    queryConstraints: [
      // En una implementación real, filtrar por userId
    ],
    realtimeUpdates: true
  });
  
  // Efecto para cargar datos de demostración si no hay datos reales
  useEffect(() => {
    if (!integrationsLoading && integrations.length === 0) {
      // Cargar datos de demostración
      loadDemoData();
    }
  }, [integrationsLoading, integrations.length]);
  
  // Función para cargar datos de demostración
  const loadDemoData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Datos de demostración para integraciones
      const demoIntegrations: Integration[] = [
        {
          id: 'int_spotify_1',
          platform: 'spotify',
          name: 'Spotify - Luna Azul',
          status: 'active',
          connectedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          credentials: {
            clientId: 'demo_client_id',
            clientSecret: 'demo_client_secret',
            accessToken: 'demo_access_token',
            refreshToken: 'demo_refresh_token',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            scopes: ['user-read-private', 'user-read-email', 'playlist-modify-public']
          },
          settings: {
            autoSync: true,
            syncInterval: 6,
            syncContent: ['playlists', 'tracks', 'albums'],
            notifications: true
          },
          stats: {
            followers: 8500,
            engagement: 7.8,
            content: 45,
            lastUpdated: new Date()
          }
        },
        {
          id: 'int_youtube_1',
          platform: 'youtube',
          name: 'YouTube - Canal Oficial',
          status: 'active',
          connectedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          lastSyncAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          credentials: {
            clientId: 'demo_client_id',
            clientSecret: 'demo_client_secret',
            accessToken: 'demo_access_token',
            refreshToken: 'demo_refresh_token',
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            scopes: ['https://www.googleapis.com/auth/youtube', 'https://www.googleapis.com/auth/youtube.force-ssl']
          },
          settings: {
            autoSync: true,
            syncInterval: 12,
            syncContent: ['videos', 'playlists', 'comments'],
            notifications: true
          },
          stats: {
            followers: 12500,
            engagement: 8.2,
            content: 78,
            lastUpdated: new Date()
          }
        },
        {
          id: 'int_instagram_1',
          platform: 'instagram',
          name: 'Instagram - Luna Azul',
          status: 'active',
          connectedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          lastSyncAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          credentials: {
            clientId: 'demo_client_id',
            clientSecret: 'demo_client_secret',
            accessToken: 'demo_access_token',
            refreshToken: 'demo_refresh_token',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            scopes: ['user_profile', 'user_media']
          },
          settings: {
            autoSync: true,
            syncInterval: 4,
            syncContent: ['posts', 'stories', 'reels'],
            notifications: true
          },
          stats: {
            followers: 15000,
            engagement: 9.5,
            content: 120,
            lastUpdated: new Date()
          }
        },
        {
          id: 'int_tiktok_1',
          platform: 'tiktok',
          name: 'TikTok - Luna Azul',
          status: 'active',
          connectedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          lastSyncAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          credentials: {
            clientId: 'demo_client_id',
            clientSecret: 'demo_client_secret',
            accessToken: 'demo_access_token',
            refreshToken: 'demo_refresh_token',
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            scopes: ['user.info.basic', 'video.list', 'video.upload']
          },
          settings: {
            autoSync: true,
            syncInterval: 3,
            syncContent: ['videos', 'comments', 'likes'],
            notifications: true
          },
          stats: {
            followers: 9800,
            engagement: 10.2,
            content: 65,
            lastUpdated: new Date()
          }
        }
      ];
      
      // Datos de demostración para flujos de trabajo
      const demoWorkflows: Workflow[] = [
        {
          id: 'wf_content_sync_1',
          name: 'Sincronización de Contenido Diaria',
          description: 'Sincroniza contenido entre plataformas automáticamente cada día',
          status: 'active',
          trigger: {
            type: 'schedule',
            schedule: '0 9 * * *' // Todos los días a las 9 AM
          },
          steps: [
            {
              id: 'step_1',
              type: 'platform_action',
              name: 'Obtener últimos videos de YouTube',
              platform: 'youtube',
              action: 'get_videos',
              parameters: {
                limit: 5,
                sort: 'date'
              },
              status: 'success'
            },
            {
              id: 'step_2',
              type: 'condition',
              name: 'Verificar si hay videos nuevos',
              condition: {
                field: 'videos.length',
                operator: '>',
                value: 0
              },
              status: 'success'
            },
            {
              id: 'step_3',
              type: 'platform_action',
              name: 'Publicar en Instagram',
              platform: 'instagram',
              action: 'post_media',
              parameters: {
                mediaType: 'image',
                caption: '¡Nuevo video disponible! {{video.title}} - Ver en YouTube'
              },
              status: 'success'
            },
            {
              id: 'step_4',
              type: 'platform_action',
              name: 'Publicar en TikTok',
              platform: 'tiktok',
              action: 'post_video',
              parameters: {
                videoUrl: '{{video.url}}',
                description: '¡Nuevo video! {{video.title}}'
              },
              status: 'success'
            },
            {
              id: 'step_5',
              type: 'notification',
              name: 'Notificar al equipo',
              notification: {
                channel: 'email',
                message: 'Se ha sincronizado nuevo contenido entre plataformas'
              },
              status: 'success'
            }
          ],
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          lastRunAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          nextRunAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
          runCount: 25,
          successCount: 23,
          errorCount: 2
        },
        {
          id: 'wf_engagement_1',
          name: 'Respuesta Automática a Comentarios',
          description: 'Responde automáticamente a comentarios positivos en todas las plataformas',
          status: 'active',
          trigger: {
            type: 'event',
            event: 'new_comment'
          },
          steps: [
            {
              id: 'step_1',
              type: 'platform_action',
              name: 'Analizar sentimiento del comentario',
              platform: 'zeus',
              action: 'analyze_sentiment',
              parameters: {
                text: '{{comment.text}}'
              },
              status: 'pending'
            },
            {
              id: 'step_2',
              type: 'condition',
              name: 'Verificar si el sentimiento es positivo',
              condition: {
                field: 'sentiment.score',
                operator: '>',
                value: 0.7
              },
              status: 'pending'
            },
            {
              id: 'step_3',
              type: 'platform_action',
              name: 'Generar respuesta personalizada',
              platform: 'zeus',
              action: 'generate_response',
              parameters: {
                prompt: 'Genera una respuesta amable y personalizada al comentario: {{comment.text}}',
                tone: 'friendly',
                maxLength: 280
              },
              status: 'pending'
            },
            {
              id: 'step_4',
              type: 'platform_action',
              name: 'Publicar respuesta',
              platform: '{{comment.platform}}',
              action: 'reply_comment',
              parameters: {
                commentId: '{{comment.id}}',
                text: '{{response.text}}'
              },
              status: 'pending'
            }
          ],
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          lastRunAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          runCount: 42,
          successCount: 38,
          errorCount: 4
        }
      ];
      
      // Guardar datos de demostración en Firestore
      for (const integration of demoIntegrations) {
        await setDoc(doc(db, 'integrations', integration.id), {
          ...integration,
          userId: user.uid,
          connectedAt: serverTimestamp(),
          lastSyncAt: serverTimestamp(),
          credentials: {
            ...integration.credentials,
            expiresAt: serverTimestamp()
          },
          stats: {
            ...integration.stats,
            lastUpdated: serverTimestamp()
          }
        });
      }
      
      for (const workflow of demoWorkflows) {
        await setDoc(doc(db, 'workflows', workflow.id), {
          ...workflow,
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastRunAt: workflow.lastRunAt ? serverTimestamp() : null,
          nextRunAt: workflow.nextRunAt ? serverTimestamp() : null
        });
      }
      
      // Actualizar datos
      refreshIntegrations();
      refreshWorkflows();
      
      showSnackbar('Datos de demostración cargados correctamente', 'success');
    } catch (error) {
      console.error('Error al cargar datos de demostración:', error);
      showSnackbar('Error al cargar datos de demostración', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para mostrar snackbar
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  // Función para sincronizar una integración
  const syncIntegration = async (integrationId: string) => {
    setIsLoading(true);
    
    try {
      // En una implementación real, esto llamaría a una Cloud Function
      // Simulamos una sincronización exitosa
      setTimeout(async () => {
        const integration = integrations.find(i => i.id === integrationId);
        
        if (integration) {
          await updateDoc(doc(db, 'integrations', integrationId), {
            lastSyncAt: serverTimestamp(),
            stats: {
              ...integration.stats,
              followers: integration.stats.followers + Math.floor(Math.random() * 100),
              engagement: Math.min(10, integration.stats.engagement + (Math.random() * 0.5 - 0.25)),
              content: integration.stats.content + Math.floor(Math.random() * 3),
              lastUpdated: serverTimestamp()
            }
          });
          
          refreshIntegrations();
          showSnackbar(`Integración ${integration.name} sincronizada correctamente`, 'success');
        }
        
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error al sincronizar integración:', error);
      showSnackbar('Error al sincronizar integración', 'error');
      setIsLoading(false);
    }
  };
  
  // Función para ejecutar un flujo de trabajo
  const runWorkflow = async (workflowId: string) => {
    setIsLoading(true);
    
    try {
      // En una implementación real, esto llamaría a una Cloud Function
      // Simulamos una ejecución exitosa
      setTimeout(async () => {
        const workflow = workflows.find(w => w.id === workflowId);
        
        if (workflow) {
          await updateDoc(doc(db, 'workflows', workflowId), {
            lastRunAt: serverTimestamp(),
            nextRunAt: workflow.trigger.type === 'schedule' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
            runCount: workflow.runCount + 1,
            successCount: workflow.successCount + 1
          });
          
          refreshWorkflows();
          showSnackbar(`Flujo de trabajo ${workflow.name} ejecutado correctamente`, 'success');
        }
        
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error al ejecutar flujo de trabajo:', error);
      showSnackbar('Error al ejecutar flujo de trabajo', 'error');
      setIsLoading(false);
    }
  };
  
  // Función para eliminar una integración o flujo de trabajo
  const handleDelete = async () => {
    setIsLoading(true);
    
    try {
      if (deleteItemType === 'integration') {
        await deleteDoc(doc(db, 'integrations', deleteItemId));
        refreshIntegrations();
        showSnackbar('Integración eliminada correctamente', 'success');
      } else {
        await deleteDoc(doc(db, 'workflows', deleteItemId));
        refreshWorkflows();
        showSnackbar('Flujo de trabajo eliminado correctamente', 'success');
      }
    } catch (error) {
      console.error(`Error al eliminar ${deleteItemType}:`, error);
      showSnackbar(`Error al eliminar ${deleteItemType}`, 'error');
    } finally {
      setIsLoading(false);
      setIsDeleteConfirmOpen(false);
      setDeleteItemId('');
    }
  };
  
  // Función para confirmar eliminación
  const confirmDelete = (id: string, type: 'integration' | 'workflow') => {
    setDeleteItemId(id);
    setDeleteItemType(type);
    setIsDeleteConfirmOpen(true);
  };
  
  // Renderizar tarjeta de integración
  const renderIntegrationCard = (integration: Integration) => {
    const logo = platformLogos[integration.platform] || '';
    
    return (
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          height: '100%',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <CardHeader
          avatar={
            <Avatar 
              src={logo} 
              alt={integration.platform}
              sx={{ width: 40, height: 40 }}
            />
          }
          title={integration.name}
          subheader={`Conectado: ${integration.connectedAt.toLocaleDateString()}`}
          action={
            <Box>
              <Tooltip title="Sincronizar">
                <IconButton onClick={() => syncIntegration(integration.id)}>
                  <SyncIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Editar">
                <IconButton onClick={() => {
                  setSelectedIntegration(integration);
                  setIsEditIntegrationOpen(true);
                }}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton onClick={() => confirmDelete(integration.id, 'integration')}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={integration.status === 'active' ? 'Activo' : integration.status === 'inactive' ? 'Inactivo' : integration.status === 'pending' ? 'Pendiente' : 'Error'} 
              color={integration.status === 'active' ? 'success' : integration.status === 'inactive' ? 'default' : integration.status === 'pending' ? 'warning' : 'error'}
              size="small"
              sx={{ mr: 1 }}
            />
            <Typography variant="body2" color="text.secondary" component="span">
              Última sincronización: {integration.lastSyncAt.toLocaleString()}
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Seguidores
              </Typography>
              <Typography variant="h6">
                {integration.stats.followers.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Engagement
              </Typography>
              <Typography variant="h6">
                {integration.stats.engagement.toFixed(1)}%
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Contenido
              </Typography>
              <Typography variant="h6">
                {integration.stats.content}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Auto-Sync
              </Typography>
              <Typography variant="h6">
                {integration.settings.autoSync ? `Cada ${integration.settings.syncInterval}h` : 'Desactivado'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  // Renderizar tarjeta de flujo de trabajo
  const renderWorkflowCard = (workflow: Workflow) => {
    return (
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          height: '100%',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <CardHeader
          avatar={
            <Avatar 
              sx={{ 
                bgcolor: workflow.status === 'active' ? 'success.main' : workflow.status === 'inactive' ? 'text.disabled' : 'warning.main',
                width: 40, 
                height: 40 
              }}
            >
              {workflow.status === 'active' ? <PlayArrowIcon /> : workflow.status === 'inactive' ? <PauseIcon /> : <EditIcon />}
            </Avatar>
          }
          title={workflow.name}
          subheader={`Creado: ${workflow.createdAt.toLocaleDateString()}`}
          action={
            <Box>
              <Tooltip title="Ejecutar">
                <IconButton onClick={() => runWorkflow(workflow.id)}>
                  <PlayArrowIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Editar">
                <IconButton onClick={() => {
                  setSelectedWorkflow(workflow);
                  setIsEditWorkflowOpen(true);
                }}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton onClick={() => confirmDelete(workflow.id, 'workflow')}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {workflow.description}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={workflow.trigger.type === 'schedule' ? 'Programado' : workflow.trigger.type === 'event' ? 'Evento' : 'Manual'} 
              color={workflow.trigger.type === 'schedule' ? 'primary' : workflow.trigger.type === 'event' ? 'secondary' : 'default'}
              size="small"
              sx={{ mr: 1 }}
            />
            <Typography variant="body2" color="text.secondary" component="span">
              {workflow.trigger.type === 'schedule' 
                ? `Programación: ${workflow.trigger.schedule}` 
                : workflow.trigger.type === 'event' 
                  ? `Evento: ${workflow.trigger.event}` 
                  : 'Ejecución manual'}
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Ejecuciones
              </Typography>
              <Typography variant="h6">
                {workflow.runCount}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Éxito
              </Typography>
              <Typography variant="h6">
                {workflow.runCount > 0 ? `${Math.round((workflow.successCount / workflow.runCount) * 100)}%` : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Última ejecución
              </Typography>
              <Typography variant="h6">
                {workflow.lastRunAt ? workflow.lastRunAt.toLocaleDateString() : 'Nunca'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Próxima ejecución
              </Typography>
              <Typography variant="h6">
                {workflow.nextRunAt ? workflow.nextRunAt.toLocaleDateString() : 'N/A'}
              </Typography>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Pasos: {workflow.steps.length}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {workflow.steps.map((step, index) => (
                <Chip 
                  key={step.id}
                  label={`${index + 1}. ${step.name}`}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderColor: step.status === 'success' 
                      ? 'success.main' 
                      : step.status === 'error' 
                        ? 'error.main' 
                        : step.status === 'skipped' 
                          ? 'text.disabled' 
                          : 'primary.main'
                  }}
                />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  // Renderizar diálogo de detalles de integración
  const renderIntegrationDetails = () => {
    if (!selectedIntegration) return null;
    
    return (
      <Dialog
        open={isEditIntegrationOpen}
        onClose={() => setIsEditIntegrationOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalles de Integración: {selectedIntegration.name}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Información General
              </Typography>
              <Box sx={{ mb: 3 }}>
                <TextField
                  label="Nombre"
                  value={selectedIntegration.name}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedIntegration.status === 'active'}
                    />
                  }
                  label="Activo"
                />
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                Configuración de Sincronización
              </Typography>
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedIntegration.settings.autoSync}
                    />
                  }
                  label="Sincronización Automática"
                />
                <TextField
                  label="Intervalo de Sincronización (horas)"
                  type="number"
                  value={selectedIntegration.settings.syncInterval}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  disabled={!selectedIntegration.settings.autoSync}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedIntegration.settings.notifications}
                    />
                  }
                  label="Notificaciones"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">
                  Credenciales
                </Typography>
                <IconButton onClick={() => setShowCredentials(!showCredentials)}>
                  {showCredentials ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </Box>
              <Box sx={{ mb: 3 }}>
                <TextField
                  label="Client ID"
                  value={showCredentials ? selectedIntegration.credentials.clientId : '••••••••••••••••'}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  label="Client Secret"
                  value={showCredentials ? selectedIntegration.credentials.clientSecret : '••••••••••••••••'}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  label="Access Token"
                  value={showCredentials ? selectedIntegration.credentials.accessToken : '••••••••••••••••'}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  label="Refresh Token"
                  value={showCredentials ? selectedIntegration.credentials.refreshToken : '••••••••••••••••'}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  Expira: {selectedIntegration.credentials.expiresAt.toLocaleString()}
                </Typography>
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                Estadísticas
              </Typography>
              <Box>
                <Typography variant="body2">
                  Seguidores: {selectedIntegration.stats.followers.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  Engagement: {selectedIntegration.stats.engagement.toFixed(1)}%
                </Typography>
                <Typography variant="body2">
                  Contenido: {selectedIntegration.stats.content}
                </Typography>
                <Typography variant="body2">
                  Última actualización: {selectedIntegration.stats.lastUpdated.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditIntegrationOpen(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              // En una implementación real, guardar cambios
              setIsEditIntegrationOpen(false);
              showSnackbar('Cambios guardados correctamente', 'success');
            }}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Renderizar diálogo de confirmación de eliminación
  const renderDeleteConfirmation = () => {
    return (
      <Dialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
      >
        <DialogTitle>
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar este {deleteItemType === 'integration' ? 'integración' : 'flujo de trabajo'}? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteConfirmOpen(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleDelete}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Renderizar contenido principal
  const renderContent = () => {
    if (integrationsLoading || workflowsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress color="primary" />
        </Box>
      );
    }
    
    if (integrationsError || workflowsError) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          Error al cargar datos. Por favor, intenta de nuevo.
        </Alert>
      );
    }
    
    if (activeTab === 0) {
      // Pestaña de Integraciones
      return (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Plataformas Conectadas ({integrations.length})
            </Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => refreshIntegrations()}
                sx={{ mr: 1 }}
              >
                Actualizar
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsAddIntegrationOpen(true)}
              >
                Conectar Plataforma
              </Button>
            </Box>
          </Box>
          
          <Grid container spacing={3}>
            {integrations.map(integration => (
              <Grid item xs={12} sm={6} md={4} key={integration.id}>
                {renderIntegrationCard(integration)}
              </Grid>
            ))}
            
            {/* Tarjeta para añadir nueva integración */}
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 2,
                  border: '1px dashed rgba(255, 255, 255, 0.2)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-4px)'
                  }
                }}
                onClick={() => setIsAddIntegrationOpen(true)}
              >
                <AddIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" align="center" gutterBottom>
                  Conectar Nueva Plataforma
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Integra con SoundCloud, Twitch, Discord y más
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </>
      );
    } else {
      // Pestaña de Flujos de Trabajo
      return (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Flujos de Trabajo ({workflows.length})
            </Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => refreshWorkflows()}
                sx={{ mr: 1 }}
              >
                Actualizar
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsAddWorkflowOpen(true)}
              >
                Crear Flujo
              </Button>
            </Box>
          </Box>
          
          <Grid container spacing={3}>
            {workflows.map(workflow => (
              <Grid item xs={12} sm={6} md={4} key={workflow.id}>
                {renderWorkflowCard(workflow)}
              </Grid>
            ))}
            
            {/* Tarjeta para añadir nuevo flujo de trabajo */}
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 2,
                  border: '1px dashed rgba(255, 255, 255, 0.2)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-4px)'
                  }
                }}
                onClick={() => setIsAddWorkflowOpen(true)}
              >
                <AddIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" align="center" gutterBottom>
                  Crear Nuevo Flujo de Trabajo
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Automatiza tareas entre plataformas
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </>
      );
    }
  };
  
  // Renderizar diálogo para añadir nueva integración
  const renderAddIntegrationDialog = () => {
    return (
      <Dialog
        open={isAddIntegrationOpen}
        onClose={() => setIsAddIntegrationOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Conectar Nueva Plataforma
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" gutterBottom>
            Selecciona una plataforma para conectar
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Plataformas disponibles */}
            {[
              { id: 'soundcloud', name: 'SoundCloud', logo: soundcloudLogo },
              { id: 'twitch', name: 'Twitch', logo: twitchLogo },
              { id: 'discord', name: 'Discord', logo: discordLogo },
              { id: 'bandcamp', name: 'Bandcamp', logo: bandcampLogo },
              { id: 'nft', name: 'NFT Marketplace', logo: nftLogo },
              { id: 'apple_music', name: 'Apple Music', logo: appleMusicLogo }
            ].map(platform => (
              <Grid item xs={12} sm={6} md={4} key={platform.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      transform: 'translateY(-2px)'
                    }
                  }}
                  onClick={() => {
                    setIsAddIntegrationOpen(false);
                    // En una implementación real, iniciar flujo de OAuth
                    showSnackbar(`Iniciando conexión con ${platform.name}...`, 'info');
                  }}
                >
                  <Avatar 
                    src={platform.logo} 
                    alt={platform.name}
                    sx={{ width: 64, height: 64, mb: 2 }}
                  />
                  <Typography variant="subtitle1" align="center">
                    {platform.name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddIntegrationOpen(false)}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Renderizar diálogo para añadir nuevo flujo de trabajo
  const renderAddWorkflowDialog = () => {
    return (
      <Dialog
        open={isAddWorkflowOpen}
        onClose={() => setIsAddWorkflowOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Crear Nuevo Flujo de Trabajo
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" gutterBottom>
            Selecciona una plantilla o crea un flujo personalizado
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Plantillas de flujos de trabajo */}
            {[
              { 
                id: 'template_content_sync', 
                name: 'Sincronización de Contenido', 
                description: 'Sincroniza contenido automáticamente entre plataformas',
                icon: <SyncIcon sx={{ fontSize: 40 }} />
              },
              { 
                id: 'template_engagement', 
                name: 'Respuesta a Comentarios', 
                description: 'Responde automáticamente a comentarios en todas las plataformas',
                icon: <CloudDownloadIcon sx={{ fontSize: 40 }} />
              },
              { 
                id: 'template_analytics', 
                name: 'Informes Analíticos', 
                description: 'Genera y envía informes periódicos de rendimiento',
                icon: <HistoryIcon sx={{ fontSize: 40 }} />
              },
              { 
                id: 'template_custom', 
                name: 'Flujo Personalizado', 
                description: 'Crea un flujo de trabajo desde cero',
                icon: <AddIcon sx={{ fontSize: 40 }} />
              }
            ].map(template => (
              <Grid item xs={12} sm={6} key={template.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      transform: 'translateY(-2px)'
                    }
                  }}
                  onClick={() => {
                    setIsAddWorkflowOpen(false);
                    // En una implementación real, abrir editor de flujos
                    showSnackbar(`Creando flujo de trabajo: ${template.name}...`, 'info');
                  }}
                >
                  <Box sx={{ mr: 2, color: 'primary.main' }}>
                    {template.icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1">
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddWorkflowOpen(false)}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  return (
    <Layout title="Integraciones">
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom>
              Integraciones
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Gestiona conexiones con plataformas externas y automatiza flujos de trabajo
            </Typography>
          </Grid>
        </Grid>
      </Box>
      
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          mb: 4
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Plataformas Conectadas" />
          <Tab label="Flujos de Trabajo" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {renderContent()}
        </Box>
      </Paper>
      
      {/* Diálogos */}
      {renderIntegrationDetails()}
      {renderDeleteConfirmation()}
      {renderAddIntegrationDialog()}
      {renderAddWorkflowDialog()}
      
      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      {/* Overlay de carga */}
      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      )}
    </Layout>
  );
};

export default Integrations;
