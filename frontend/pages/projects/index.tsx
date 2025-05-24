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
  Folder as FolderIcon,
  Event as EventIcon,
  MusicNote as MusicNoteIcon,
  CalendarMonth as CalendarIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Place as PlaceIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, orderBy, getDocs, doc, setDoc, deleteDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

// Interfaz para el tipo de proyecto
interface Project {
  id: string;
  title: string;
  description: string;
  artistId: string;
  artistName?: string;
  type: string;
  status: string;
  startDate: any;
  endDate: any;
  budget?: number;
  completionPercentage?: number;
  team?: string[];
  createdAt?: any;
  updatedAt?: any;
}

const Projects = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [artists, setArtists] = useState<{id: string, name: string}[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sortOption, setSortOption] = useState('recent');
  const [filterArtist, setFilterArtist] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { user } = useAuth();
  const router = useRouter();

  // Formulario de proyecto
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    artistId: '',
    type: 'album',
    status: 'planning',
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    budget: '',
    completionPercentage: 0,
    team: ''
  });
  const [formErrors, setFormErrors] = useState({
    title: '',
    description: '',
    artistId: ''
  });

  useEffect(() => {
    fetchArtists().then(() => {
      fetchProjects();
    });
  }, [user]);

  useEffect(() => {
    if (projects.length > 0) {
      filterAndSortProjects();
    }
  }, [searchTerm, projects, tabValue, sortOption, filterArtist, filterStatus]);

  const fetchArtists = async () => {
    if (!user) return;
    
    try {
      // Obtener artistas a los que tiene acceso el usuario
      const userArtistsQuery = query(
        collection(db, 'user_artists'),
        where('userId', '==', user.uid)
      );
      const userArtistsSnapshot = await getDocs(userArtistsQuery);
      
      const artistIds = userArtistsSnapshot.docs.map(doc => doc.data().artistId);
      
      if (artistIds.length === 0) {
        setArtists([]);
        return;
      }
      
      // Obtener detalles de los artistas
      const artistsQuery = query(
        collection(db, 'artists'),
        where('id', 'in', artistIds)
      );
      const artistsSnapshot = await getDocs(artistsQuery);
      const artistsData = artistsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
      
      setArtists(artistsData);
      
      // Si hay artistas, establecer el primero como predeterminado en el formulario
      if (artistsData.length > 0 && !formData.artistId) {
        setFormData(prev => ({
          ...prev,
          artistId: artistsData[0].id
        }));
      }
    } catch (error) {
      console.error('Error al obtener artistas:', error);
    }
  };

  const fetchProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Obtener artistas a los que tiene acceso el usuario
      const userArtistsQuery = query(
        collection(db, 'user_artists'),
        where('userId', '==', user.uid)
      );
      const userArtistsSnapshot = await getDocs(userArtistsQuery);
      
      const artistIds = userArtistsSnapshot.docs.map(doc => doc.data().artistId);
      
      if (artistIds.length === 0) {
        setProjects([]);
        setFilteredProjects([]);
        setLoading(false);
        return;
      }
      
      // Obtener proyectos de esos artistas
      const projectsQuery = query(
        collection(db, 'projects'),
        where('artistId', 'in', artistIds)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projectsData = await Promise.all(projectsSnapshot.docs.map(async doc => {
        const data = doc.data();
        // Obtener nombre del artista
        const artistDoc = await getDoc(doc(db, 'artists', data.artistId));
        return {
          id: doc.id,
          ...data,
          artistName: artistDoc.exists() ? artistDoc.data().name : 'Artista desconocido'
        };
      })) as Project[];
      
      setProjects(projectsData);
      setFilteredProjects(projectsData);
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProjects = () => {
    let filtered = [...projects];
    
    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por tab
    if (tabValue === 1) { // En progreso
      filtered = filtered.filter(project => project.status === 'in-progress');
    } else if (tabValue === 2) { // Completados
      filtered = filtered.filter(project => project.status === 'completed');
    } else if (tabValue === 3) { // Planificados
      filtered = filtered.filter(project => project.status === 'planning');
    }
    
    // Filtrar por artista
    if (filterArtist !== 'all') {
      filtered = filtered.filter(project => project.artistId === filterArtist);
    }
    
    // Filtrar por estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter(project => project.status === filterStatus);
    }
    
    // Ordenar
    filtered.sort((a, b) => {
      if (sortOption === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortOption === 'recent') {
        return b.updatedAt?.seconds - a.updatedAt?.seconds;
      } else if (sortOption === 'startDate') {
        return a.startDate?.seconds - b.startDate?.seconds;
      } else if (sortOption === 'endDate') {
        return a.endDate?.seconds - b.endDate?.seconds;
      }
      return 0;
    });
    
    setFilteredProjects(filtered);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSortChange = (option: string) => {
    setSortOption(option);
    handleCloseMenu();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterArtistChange = (event: SelectChangeEvent) => {
    setFilterArtist(event.target.value);
  };

  const handleFilterStatusChange = (event: SelectChangeEvent) => {
    setFilterStatus(event.target.value);
  };

  const handleOpenDialog = (project: Project | null = null) => {
    if (project) {
      setCurrentProject(project);
      setFormData({
        title: project.title,
        description: project.description,
        artistId: project.artistId,
        type: project.type,
        status: project.status,
        startDate: project.startDate?.toDate() || new Date(),
        endDate: project.endDate?.toDate() || new Date(),
        budget: project.budget?.toString() || '',
        completionPercentage: project.completionPercentage || 0,
        team: project.team?.join(', ') || ''
      });
    } else {
      setCurrentProject(null);
      setFormData({
        title: '',
        description: '',
        artistId: artists.length > 0 ? artists[0].id : '',
        type: 'album',
        status: 'planning',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        budget: '',
        completionPercentage: 0,
        team: ''
      });
    }
    setFormErrors({
      title: '',
      description: '',
      artistId: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error al editar
    if (name in formErrors) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error al editar
    if (name in formErrors) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleDateChange = (name: string, date: Date | null) => {
    if (date) {
      setFormData({
        ...formData,
        [name]: date
      });
    }
  };

  const validateForm = () => {
    const errors = {
      title: '',
      description: '',
      artistId: ''
    };
    let isValid = true;
    
    if (!formData.title.trim()) {
      errors.title = 'El título es obligatorio';
      isValid = false;
    }
    
    if (!formData.description.trim()) {
      errors.description = 'La descripción es obligatoria';
      isValid = false;
    } else if (formData.description.length < 10) {
      errors.description = 'La descripción debe tener al menos 10 caracteres';
      isValid = false;
    }
    
    if (!formData.artistId) {
      errors.artistId = 'Debes seleccionar un artista';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Procesar equipo
      const teamArray = formData.team
        ? formData.team.split(',').map(member => member.trim()).filter(member => member)
        : [];
      
      const projectData: Partial<Project> = {
        title: formData.title,
        description: formData.description,
        artistId: formData.artistId,
        type: formData.type,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        completionPercentage: formData.completionPercentage,
        team: teamArray,
        updatedAt: serverTimestamp()
      };
      
      if (currentProject) {
        // Actualizar proyecto existente
        await setDoc(doc(db, 'projects', currentProject.id), projectData, { merge: true });
      } else {
        // Crear nuevo proyecto
        const newProjectRef = doc(collection(db, 'projects'));
        const newProjectData = {
          ...projectData,
          id: newProjectRef.id,
          createdAt: serverTimestamp(),
          createdBy: user?.uid
        };
        
        await setDoc(newProjectRef, newProjectData);
      }
      
      handleCloseDialog();
      fetchProjects();
    } catch (error) {
      console.error('Error al guardar proyecto:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setLoading(true);
    try {
      // Eliminar proyecto
      await deleteDoc(doc(db, 'projects', projectId));
      
      fetchProjects();
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'info';
      case 'in-progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning':
        return 'Planificación';
      case 'in-progress':
        return 'En Progreso';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'album':
        return <MusicNoteIcon />;
      case 'single':
        return <MusicNoteIcon />;
      case 'tour':
        return <PlaceIcon />;
      case 'event':
        return <EventIcon />;
      case 'video':
        return <FolderIcon />;
      default:
        return <FolderIcon />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'album':
        return 'Álbum';
      case 'single':
        return 'Single';
      case 'tour':
        return 'Gira';
      case 'event':
        return 'Evento';
      case 'video':
        return 'Video';
      default:
        return type;
    }
  };

  if (loading && projects.length === 0) {
    return (
      <Layout title="Proyectos">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress color="primary" />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Proyectos">
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom>
              Proyectos
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Gestiona tus proyectos musicales y eventos
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ 
                py: 1.2,
                px: 3,
                fontWeight: 600,
                boxShadow: '0 4px 6px rgba(255, 215, 0, 0.25)',
                '&:hover': {
                  boxShadow: '0 6px 10px rgba(255, 215, 0, 0.35)',
                }
              }}
            >
              Nuevo Proyecto
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Paper 
        elevation={0}
        sx={{ 
          p: 2, 
          mb: 4,
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={handleSearchChange}
              variant="outlined"
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="filter-artist-label">Artista</InputLabel>
              <Select
                labelId="filter-artist-label"
                id="filter-artist"
                value={filterArtist}
                onChange={handleFilterArtistChange}
                label="Artista"
              >
                <MenuItem value="all">Todos los artistas</MenuItem>
                {artists.map(artist => (
                  <MenuItem key={artist.id} value={artist.id}>{artist.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="filter-status-label">Estado</InputLabel>
              <Select
                labelId="filter-status-label"
                id="filter-status"
                value={filterStatus}
                onChange={handleFilterStatusChange}
                label="Estado"
              >
                <MenuItem value="all">Todos los estados</MenuItem>
                <MenuItem value="planning">Planificación</MenuItem>
                <MenuItem value="in-progress">En Progreso</MenuItem>
                <MenuItem value="completed">Completado</MenuItem>
                <MenuItem value="cancelled">Cancelado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              startIcon={<SortIcon />}
              onClick={handleOpenMenu}
              fullWidth
            >
              Ordenar
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem 
                onClick={() => handleSortChange('title')}
                selected={sortOption === 'title'}
              >
                Por título
              </MenuItem>
              <MenuItem 
                onClick={() => handleSortChange('recent')}
                selected={sortOption === 'recent'}
              >
                Más recientes
              </MenuItem>
              <MenuItem 
                onClick={() => handleSortChange('startDate')}
                selected={sortOption === 'startDate'}
              >
                Por fecha de inicio
              </MenuItem>
              <MenuItem 
                onClick={() => handleSortChange('endDate')}
                selected={sortOption === 'endDate'}
              >
                Por fecha de finalización
              </MenuItem>
            </Menu>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            '& .MuiTab-root': {
              minWidth: 100,
              fontWeight: 500,
            },
          }}
        >
          <Tab label="Todos" />
          <Tab label="En Progreso" />
          <Tab label="Completados" />
          <Tab label="Planificados" />
        </Tabs>
      </Box>

      {filteredProjects.length === 0 ? (
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <FolderIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No se encontraron proyectos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || filterArtist !== 'all' || filterStatus !== 'all'
              ? 'No hay resultados para tu búsqueda. Intenta con otros filtros.'
              : 'Crea tu primer proyecto para comenzar a gestionar la carrera de tus artistas.'}
          </Typography>
          {!searchTerm && filterArtist === 'all' && filterStatus === 'all' && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Nuevo Proyecto
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map(project => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                  }
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main'
                      }}
                    >
                      {getTypeIcon(project.type)}
                    </Avatar>
                  }
                  action={
                    <IconButton 
                      aria-label="settings"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog(project);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  }
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {project.title}
                    </Typography>
                  }
                  subheader={
                    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {project.artistName}
                      </Typography>
                      <Box sx={{ display: 'flex', mt: 1 }}>
                        <Chip 
                          label={getTypeText(project.type)} 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                        <Chip 
                          label={getStatusText(project.status)} 
                          size="small" 
                          color={getStatusColor(project.status) as any}
                        />
                      </Box>
                    </Box>
                  }
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description.substring(0, 120)}
                    {project.description.length > 120 ? '...' : ''}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(project.startDate?.seconds * 1000).toLocaleDateString()} - {new Date(project.endDate?.seconds * 1000).toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  {project.budget && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <MoneyIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        Presupuesto: ${project.budget.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                  
                  {project.completionPercentage !== undefined && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Progreso
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {project.completionPercentage}%
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 1, height: 8 }}>
                        <Box
                          sx={{
                            width: `${project.completionPercentage}%`,
                            bgcolor: 'primary.main',
                            height: 8,
                            borderRadius: 1,
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog(project);
                      }}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleViewProject(project.id)}
                    >
                      Ver Detalles
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Botón flotante para añadir proyecto */}
      <Tooltip title="Nuevo Proyecto">
        <Fab 
          color="primary" 
          aria-label="add"
          onClick={() => handleOpenDialog()}
          sx={{ 
            position: 'fixed', 
            bottom: 24, 
            right: 24,
            boxShadow: '0 4px 10px rgba(255, 215, 0, 0.3)',
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      {/* Diálogo para crear/editar proyecto */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
        </DialogTitle>
        <DialogContent dividers>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Título del Proyecto"
                  fullWidth
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Descripción"
                  fullWidth
                  required
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="artist-label">Artista</InputLabel>
                  <Select
                    labelId="artist-label"
                    id="artistId"
                    name="artistId"
                    value={formData.artistId}
                    onChange={handleSelectChange}
                    label="Artista"
                    error={!!formErrors.artistId}
                  >
                    {artists.map(artist => (
                      <MenuItem key={artist.id} value={artist.id}>{artist.name}</MenuItem>
                    ))}
                  </Select>
                  {formErrors.artistId && (
                    <Typography variant="caption" color="error">
                      {formErrors.artistId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="type-label">Tipo de Proyecto</InputLabel>
                  <Select
                    labelId="type-label"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleSelectChange}
                    label="Tipo de Proyecto"
                  >
                    <MenuItem value="album">Álbum</MenuItem>
                    <MenuItem value="single">Single</MenuItem>
                    <MenuItem value="tour">Gira</MenuItem>
                    <MenuItem value="event">Evento</MenuItem>
                    <MenuItem value="video">Video</MenuItem>
                    <MenuItem value="other">Otro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="status-label">Estado</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleSelectChange}
                    label="Estado"
                  >
                    <MenuItem value="planning">Planificación</MenuItem>
                    <MenuItem value="in-progress">En Progreso</MenuItem>
                    <MenuItem value="completed">Completado</MenuItem>
                    <MenuItem value="cancelled">Cancelado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="budget"
                  label="Presupuesto ($)"
                  fullWidth
                  type="number"
                  value={formData.budget}
                  onChange={handleInputChange}
                  margin="normal"
                  InputProps={{
                    startAdornment: <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Fecha de Inicio"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  sx={{ width: '100%', mt: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Fecha de Finalización"
                  value={formData.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  sx={{ width: '100%', mt: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="completionPercentage"
                  label="Porcentaje de Completado"
                  fullWidth
                  type="number"
                  value={formData.completionPercentage}
                  onChange={handleInputChange}
                  margin="normal"
                  InputProps={{
                    inputProps: { min: 0, max: 100 },
                    endAdornment: <Typography variant="body2">%</Typography>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="team"
                  label="Equipo (separado por comas)"
                  fullWidth
                  value={formData.team}
                  onChange={handleInputChange}
                  margin="normal"
                  placeholder="Ej: Juan Pérez, María López, Carlos Gómez"
                  InputProps={{
                    startAdornment: <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancelar
          </Button>
          {currentProject && (
            <Button 
              color="error" 
              onClick={() => {
                handleCloseDialog();
                handleDeleteProject(currentProject.id);
              }}
              startIcon={<DeleteIcon />}
            >
              Eliminar
            </Button>
          )}
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Projects;
