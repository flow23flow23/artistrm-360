import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader, 
  Avatar, 
  IconButton, 
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tabs,
  Tab,
  Fab,
  Tooltip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent
} from '@mui/material';
import { 
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  Link as LinkIcon,
  Sync as SyncIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Mic as MicIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useZeus } from '@/contexts/ZeusContext';
import { collection, query, where, orderBy, getDocs, doc, getDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    artists: 0,
    projects: 0,
    content: 0,
    platforms: 0,
    followers: 0,
    engagement: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [contentPerformance, setContentPerformance] = useState([]);
  const [isZeusListening, setIsZeusListening] = useState(false);
  const [zeusResponse, setZeusResponse] = useState('');
  const [zeusDialogOpen, setZeusDialogOpen] = useState(false);
  
  const { user } = useAuth();
  const { activateZeus, processVoiceCommand, zeusState } = useZeus();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // En una implementación real, estos datos vendrían de Firebase
      // Simulamos datos para la demostración
      setTimeout(() => {
        setStats({
          artists: 5,
          projects: 12,
          content: 48,
          platforms: 6,
          followers: 25840,
          engagement: 8.7
        });
        
        setRecentActivity([
          { id: 1, type: 'project', action: 'created', name: 'Lanzamiento Álbum "Renacimiento"', timestamp: new Date(Date.now() - 3600000), user: 'Carlos Mendoza' },
          { id: 2, type: 'content', action: 'uploaded', name: 'Video "Amanecer" - YouTube', timestamp: new Date(Date.now() - 7200000), user: 'María López' },
          { id: 3, type: 'artist', action: 'updated', name: 'Perfil de Luna Azul', timestamp: new Date(Date.now() - 10800000), user: 'Carlos Mendoza' },
          { id: 4, type: 'integration', action: 'connected', name: 'Spotify API', timestamp: new Date(Date.now() - 86400000), user: 'Sistema' },
          { id: 5, type: 'analytics', action: 'report', name: 'Informe mensual generado', timestamp: new Date(Date.now() - 172800000), user: 'Sistema' }
        ]);
        
        setUpcomingEvents([
          { id: 1, name: 'Lanzamiento single "Despertar"', date: new Date(Date.now() + 604800000), type: 'release', status: 'scheduled' },
          { id: 2, name: 'Entrevista Radio Nacional', date: new Date(Date.now() + 259200000), type: 'interview', status: 'confirmed' },
          { id: 3, name: 'Sesión de fotos promocional', date: new Date(Date.now() + 432000000), type: 'photoshoot', status: 'pending' },
          { id: 4, name: 'Concierto Teatro Municipal', date: new Date(Date.now() + 1209600000), type: 'concert', status: 'confirmed' }
        ]);
        
        setContentPerformance([
          { id: 1, title: 'Amanecer (Video)', platform: 'YouTube', views: 12500, engagement: 9.2, trend: 'up' },
          { id: 2, title: 'Renacimiento (Álbum)', platform: 'Spotify', streams: 45000, engagement: 8.5, trend: 'up' },
          { id: 3, title: 'Entrevista Backstage', platform: 'Instagram', views: 8700, engagement: 7.8, trend: 'stable' },
          { id: 4, title: 'Tutorial de Guitarra', platform: 'TikTok', views: 15300, engagement: 9.7, trend: 'up' }
        ]);
        
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error);
      setLoading(false);
    }
  };

  const handleZeusActivation = () => {
    setIsZeusListening(true);
    setZeusDialogOpen(true);
    
    // Simular activación de Zeus
    setTimeout(() => {
      setZeusResponse('Hola, soy Zeus. ¿En qué puedo ayudarte hoy?');
      
      // Simular escucha
      setTimeout(() => {
        setZeusResponse('Procesando: "Muéstrame las estadísticas de Spotify del último mes"');
        
        // Simular respuesta
        setTimeout(() => {
          setZeusResponse('Aquí tienes las estadísticas de Spotify del último mes. Tus streams han aumentado un 15% respecto al mes anterior. Tu canción más popular ha sido "Amanecer" con 12,500 reproducciones.');
          setIsZeusListening(false);
        }, 2000);
      }, 3000);
    }, 1000);
  };

  const handleCloseZeusDialog = () => {
    setZeusDialogOpen(false);
    setIsZeusListening(false);
    setZeusResponse('');
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'project':
        return '📋';
      case 'content':
        return '🎬';
      case 'artist':
        return '🎤';
      case 'integration':
        return '🔗';
      case 'analytics':
        return '📊';
      default:
        return '📝';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'release':
        return '🎵';
      case 'interview':
        return '🎙️';
      case 'photoshoot':
        return '📸';
      case 'concert':
        return '🎸';
      default:
        return '📅';
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'YouTube':
        return '📹';
      case 'Spotify':
        return '🎵';
      case 'Instagram':
        return '📸';
      case 'TikTok':
        return '🎬';
      default:
        return '🌐';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      case 'stable':
        return '📊';
      default:
        return '📊';
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress color="primary" />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Bienvenido de nuevo, {user?.displayName || 'Usuario'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<RefreshIcon />}
              onClick={fetchDashboardData}
              sx={{ mr: 2 }}
            >
              Actualizar
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Estadísticas Principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.05)',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
            }}
          >
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Artistas
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.artists}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Activos en la plataforma
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.05)',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
            }}
          >
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Proyectos
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.projects}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En desarrollo
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.05)',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
            }}
          >
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Contenido
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.content}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Piezas publicadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.05)',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
            }}
          >
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Plataformas
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.platforms}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Conectadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.05)',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
            }}
          >
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Seguidores
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatNumber(stats.followers)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total en plataformas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.05)',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
            }}
          >
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Engagement
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.engagement}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Promedio
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Contenido Principal */}
      <Grid container spacing={3}>
        {/* Actividad Reciente */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.05)',
              height: '100%',
              minHeight: 400
            }}
          >
            <CardHeader
              title="Actividad Reciente"
              action={
                <IconButton aria-label="settings">
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <Divider />
            <List sx={{ p: 0 }}>
              {recentActivity.map((activity) => (
                <React.Fragment key={activity.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 2 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.dark' }}>
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.name}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
                          </Typography>
                          {` — ${activity.timestamp.toLocaleString()} por ${activity.user}`}
                        </>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Button color="primary">Ver Todas las Actividades</Button>
            </Box>
          </Card>
        </Grid>

        {/* Próximos Eventos */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.05)',
              height: '100%',
              minHeight: 400
            }}
          >
            <CardHeader
              title="Próximos Eventos"
              action={
                <IconButton aria-label="settings">
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <Divider />
            <List sx={{ p: 0 }}>
              {upcomingEvents.map((event) => (
                <React.Fragment key={event.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 2 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.dark' }}>
                        {getEventIcon(event.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={event.name}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {event.date.toLocaleDateString()}
                          </Typography>
                          {` — ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}`}
                        </>
                      }
                    />
                    <Chip 
                      label={event.status.charAt(0).toUpperCase() + event.status.slice(1)} 
                      color={event.status === 'confirmed' ? 'success' : event.status === 'pending' ? 'warning' : 'info'} 
                      size="small" 
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Button color="primary">Ver Todos los Eventos</Button>
            </Box>
          </Card>
        </Grid>

        {/* Rendimiento de Contenido */}
        <Grid item xs={12}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            <CardHeader
              title="Rendimiento de Contenido"
              action={
                <IconButton aria-label="settings">
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <Divider />
            <Box sx={{ p: 2, overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Contenido</TableCell>
                    <TableCell>Plataforma</TableCell>
                    <TableCell align="right">Vistas/Streams</TableCell>
                    <TableCell align="right">Engagement</TableCell>
                    <TableCell align="right">Tendencia</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contentPerformance.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell component="th" scope="row">
                        {content.title}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {getPlatformIcon(content.platform)}
                          </Typography>
                          {content.platform}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {formatNumber(content.views || content.streams)}
                      </TableCell>
                      <TableCell align="right">
                        {content.engagement}%
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {getTrendIcon(content.trend)}
                          </Typography>
                          {content.trend === 'up' ? 'Subiendo' : content.trend === 'down' ? 'Bajando' : 'Estable'}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Divider />
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Button color="primary">Ver Análisis Completo</Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Botón flotante de Zeus */}
      <Tooltip title="Activar Zeus - Asistente por voz">
        <Fab 
          color="primary" 
          aria-label="zeus"
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20,
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #FFA500 0%, #FFD700 100%)',
            }
          }}
          onClick={handleZeusActivation}
        >
          <MicIcon />
        </Fab>
      </Tooltip>

      {/* Diálogo de Zeus */}
      <Dialog 
        open={zeusDialogOpen} 
        onClose={handleCloseZeusDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                mr: 2
              }}
            >
              <MicIcon />
            </Avatar>
            <Typography variant="h6">
              Zeus - Asistente Inteligente
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {isZeusListening ? (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <CircularProgress color="primary" sx={{ mb: 2 }} />
                <Typography variant="body1">
                  Escuchando...
                </Typography>
              </Box>
            ) : (
              zeusResponse && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {zeusResponse}
                </Typography>
              )
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseZeusDialog}>
            Cerrar
          </Button>
          <Button 
            variant="contained" 
            startIcon={<MicIcon />}
            onClick={() => setIsZeusListening(true)}
            disabled={isZeusListening}
            sx={{ 
              py: 1,
              px: 3,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #FFA500 0%, #FFD700 100%)',
              }
            }}
          >
            Hablar con Zeus
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

// Componente Table para el rendimiento de contenido
const Table = ({ children }) => (
  <Box sx={{ width: '100%', overflow: 'hidden' }}>
    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
      {children}
    </Box>
  </Box>
);

const TableHead = ({ children }) => (
  <Box component="thead" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
    {children}
  </Box>
);

const TableBody = ({ children }) => (
  <Box component="tbody">
    {children}
  </Box>
);

const TableRow = ({ children }) => (
  <Box 
    component="tr" 
    sx={{ 
      '&:hover': { 
        backgroundColor: 'rgba(255, 255, 255, 0.05)' 
      },
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    }}
  >
    {children}
  </Box>
);

const TableCell = ({ children, component, scope, align }) => (
  <Box 
    component={component || "td"} 
    scope={scope}
    sx={{ 
      padding: '16px', 
      textAlign: align || 'left',
      whiteSpace: 'nowrap'
    }}
  >
    {children}
  </Box>
);

export default Dashboard;
