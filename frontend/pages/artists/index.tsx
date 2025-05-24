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
  MenuItem
} from '@mui/material';
import { 
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  MusicNote as MusicNoteIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, orderBy, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/utils/firebase';

// Interfaz para el tipo de artista
interface Artist {
  id: string;
  name: string;
  genre: string;
  bio: string;
  photoURL?: string;
  socialLinks?: {
    spotify?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  createdAt?: any;
  updatedAt?: any;
}

const Artists = () => {
  const [loading, setLoading] = useState(true);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sortOption, setSortOption] = useState('name');
  const { user } = useAuth();
  const router = useRouter();

  // Formulario de artista
  const [formData, setFormData] = useState({
    name: '',
    genre: '',
    bio: '',
    spotify: '',
    instagram: '',
    youtube: '',
    tiktok: ''
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    genre: '',
    bio: ''
  });

  useEffect(() => {
    fetchArtists();
  }, [user]);

  useEffect(() => {
    if (artists.length > 0) {
      filterAndSortArtists();
    }
  }, [searchTerm, artists, tabValue, sortOption]);

  const fetchArtists = async () => {
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
        setArtists([]);
        setFilteredArtists([]);
        setLoading(false);
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
        ...doc.data()
      })) as Artist[];
      
      setArtists(artistsData);
      setFilteredArtists(artistsData);
    } catch (error) {
      console.error('Error al obtener artistas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortArtists = () => {
    let filtered = [...artists];
    
    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(artist => 
        artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.genre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por tab
    if (tabValue === 1) { // Mis artistas
      filtered = filtered.filter(artist => artist.createdBy === user?.uid);
    } else if (tabValue === 2) { // Colaboraciones
      filtered = filtered.filter(artist => artist.createdBy !== user?.uid);
    }
    
    // Ordenar
    filtered.sort((a, b) => {
      if (sortOption === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortOption === 'genre') {
        return a.genre.localeCompare(b.genre);
      } else if (sortOption === 'recent') {
        return b.updatedAt?.seconds - a.updatedAt?.seconds;
      }
      return 0;
    });
    
    setFilteredArtists(filtered);
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

  const handleOpenDialog = (artist: Artist | null = null) => {
    if (artist) {
      setCurrentArtist(artist);
      setFormData({
        name: artist.name,
        genre: artist.genre,
        bio: artist.bio,
        spotify: artist.socialLinks?.spotify || '',
        instagram: artist.socialLinks?.instagram || '',
        youtube: artist.socialLinks?.youtube || '',
        tiktok: artist.socialLinks?.tiktok || ''
      });
    } else {
      setCurrentArtist(null);
      setFormData({
        name: '',
        genre: '',
        bio: '',
        spotify: '',
        instagram: '',
        youtube: '',
        tiktok: ''
      });
    }
    setFormErrors({
      name: '',
      genre: '',
      bio: ''
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

  const validateForm = () => {
    const errors = {
      name: '',
      genre: '',
      bio: ''
    };
    let isValid = true;
    
    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio';
      isValid = false;
    }
    
    if (!formData.genre.trim()) {
      errors.genre = 'El género es obligatorio';
      isValid = false;
    }
    
    if (!formData.bio.trim()) {
      errors.bio = 'La biografía es obligatoria';
      isValid = false;
    } else if (formData.bio.length < 10) {
      errors.bio = 'La biografía debe tener al menos 10 caracteres';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const artistData: Partial<Artist> = {
        name: formData.name,
        genre: formData.genre,
        bio: formData.bio,
        socialLinks: {
          spotify: formData.spotify,
          instagram: formData.instagram,
          youtube: formData.youtube,
          tiktok: formData.tiktok
        },
        updatedAt: serverTimestamp()
      };
      
      if (currentArtist) {
        // Actualizar artista existente
        await setDoc(doc(db, 'artists', currentArtist.id), artistData, { merge: true });
      } else {
        // Crear nuevo artista
        const newArtistRef = doc(collection(db, 'artists'));
        const newArtistData = {
          ...artistData,
          id: newArtistRef.id,
          createdAt: serverTimestamp(),
          createdBy: user?.uid
        };
        
        await setDoc(newArtistRef, newArtistData);
        
        // Asignar artista al usuario
        await setDoc(doc(collection(db, 'user_artists')), {
          userId: user?.uid,
          artistId: newArtistRef.id,
          role: 'owner',
          createdAt: serverTimestamp()
        });
      }
      
      handleCloseDialog();
      fetchArtists();
    } catch (error) {
      console.error('Error al guardar artista:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArtist = async (artistId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este artista? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setLoading(true);
    try {
      // Eliminar artista
      await deleteDoc(doc(db, 'artists', artistId));
      
      // Eliminar relación usuario-artista
      const userArtistsQuery = query(
        collection(db, 'user_artists'),
        where('artistId', '==', artistId),
        where('userId', '==', user?.uid)
      );
      const userArtistsSnapshot = await getDocs(userArtistsQuery);
      
      const deletePromises = userArtistsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      
      fetchArtists();
    } catch (error) {
      console.error('Error al eliminar artista:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewArtist = (artistId: string) => {
    router.push(`/artists/${artistId}`);
  };

  if (loading && artists.length === 0) {
    return (
      <Layout title="Artistas">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress color="primary" />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Artistas">
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom>
              Artistas
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Gestiona tus artistas y colaboraciones
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
              Nuevo Artista
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
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar artistas..."
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
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              startIcon={<FilterListIcon />}
              sx={{ mr: 1 }}
            >
              Filtrar
            </Button>
            <Button 
              startIcon={<SortIcon />}
              onClick={handleOpenMenu}
            >
              Ordenar
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem 
                onClick={() => handleSortChange('name')}
                selected={sortOption === 'name'}
              >
                Por nombre
              </MenuItem>
              <MenuItem 
                onClick={() => handleSortChange('genre')}
                selected={sortOption === 'genre'}
              >
                Por género
              </MenuItem>
              <MenuItem 
                onClick={() => handleSortChange('recent')}
                selected={sortOption === 'recent'}
              >
                Más recientes
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
          <Tab label="Mis artistas" />
          <Tab label="Colaboraciones" />
        </Tabs>
      </Box>

      {filteredArtists.length === 0 ? (
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No se encontraron artistas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm 
              ? 'No hay resultados para tu búsqueda. Intenta con otros términos.'
              : 'Crea tu primer artista para comenzar a gestionar su carrera.'}
          </Typography>
          {!searchTerm && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Nuevo Artista
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredArtists.map(artist => (
            <Grid item xs={12} sm={6} md={4} key={artist.id}>
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
                      src={artist.photoURL} 
                      sx={{ 
                        width: 56, 
                        height: 56,
                        bgcolor: 'primary.main'
                      }}
                    >
                      {artist.name.charAt(0)}
                    </Avatar>
                  }
                  action={
                    <IconButton aria-label="settings">
                      <MoreVertIcon />
                    </IconButton>
                  }
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {artist.name}
                    </Typography>
                  }
                  subheader={
                    <Chip 
                      label={artist.genre} 
                      size="small" 
                      sx={{ mt: 0.5 }}
                    />
                  }
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {artist.bio.substring(0, 120)}
                    {artist.bio.length > 120 ? '...' : ''}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(artist)}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleViewArtist(artist.id)}
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

      {/* Botón flotante para añadir artista */}
      <Tooltip title="Nuevo Artista">
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

      {/* Diálogo para crear/editar artista */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {currentArtist ? 'Editar Artista' : 'Nuevo Artista'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Nombre del Artista"
                fullWidth
                required
                value={formData.name}
                onChange={handleInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="genre"
                label="Género Musical"
                fullWidth
                required
                value={formData.genre}
                onChange={handleInputChange}
                error={!!formErrors.genre}
                helperText={formErrors.genre}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="bio"
                label="Biografía"
                fullWidth
                required
                multiline
                rows={4}
                value={formData.bio}
                onChange={handleInputChange}
                error={!!formErrors.bio}
                helperText={formErrors.bio}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Redes Sociales
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="spotify"
                label="Spotify URL"
                fullWidth
                value={formData.spotify}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="instagram"
                label="Instagram URL"
                fullWidth
                value={formData.instagram}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="youtube"
                label="YouTube URL"
                fullWidth
                value={formData.youtube}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="tiktok"
                label="TikTok URL"
                fullWidth
                value={formData.tiktok}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancelar
          </Button>
          {currentArtist && (
            <Button 
              color="error" 
              onClick={() => {
                handleCloseDialog();
                handleDeleteArtist(currentArtist.id);
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

export default Artists;
