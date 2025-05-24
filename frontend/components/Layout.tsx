import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Avatar, 
  Menu, 
  MenuItem, 
  Container,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Folder as ProjectsIcon,
  PermMedia as ContentIcon,
  BarChart as AnalyticsIcon,
  Psychology as ZeusIcon,
  Link as IntegrationsIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

const drawerWidth = 260;

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logOut } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Cerrar drawer en móvil automáticamente
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationsAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    try {
      await logOut();
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const navigateTo = (path: string) => {
    router.push(path);
    if (isMobile) {
      setOpen(false);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Artistas', icon: <PeopleIcon />, path: '/artists' },
    { text: 'Proyectos', icon: <ProjectsIcon />, path: '/projects' },
    { text: 'Contenido', icon: <ContentIcon />, path: '/content' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
    { text: 'Zeus', icon: <ZeusIcon />, path: '/zeus' },
    { text: 'Integraciones', icon: <IntegrationsIcon />, path: '/integrations' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          
          {/* Botón de notificaciones */}
          <Tooltip title="Notificaciones">
            <IconButton 
              color="inherit" 
              onClick={handleNotificationsMenuOpen}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Botón de ayuda */}
          <Tooltip title="Ayuda">
            <IconButton 
              color="inherit"
              onClick={() => navigateTo('/help')}
              sx={{ mr: 2 }}
            >
              <HelpIcon />
            </IconButton>
          </Tooltip>
          
          {/* Perfil de usuario */}
          <Box>
            <Tooltip title="Perfil">
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                {user?.photoURL ? (
                  <Avatar 
                    src={user.photoURL} 
                    alt={user.displayName || 'Usuario'} 
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Menú de perfil */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar 
            src={user?.photoURL || ''} 
            alt={user?.displayName || 'Usuario'} 
            sx={{ width: 60, height: 60, mb: 1 }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {user?.displayName || 'Usuario'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { handleMenuClose(); navigateTo('/profile'); }}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Mi Perfil
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); navigateTo('/settings'); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Configuración
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Cerrar Sesión
        </MenuItem>
      </Menu>
      
      {/* Menú de notificaciones */}
      <Menu
        anchorEl={notificationsAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(notificationsAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Notificaciones
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Nuevo comentario en tu proyecto
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Hace 5 minutos
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Contenido publicado exitosamente
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Hace 2 horas
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Recordatorio: Evento próximo
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Hace 1 día
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ justifyContent: 'center' }}>
          <Typography variant="body2" color="primary">
            Ver todas las notificaciones
          </Typography>
        </MenuItem>
      </Menu>
      
      {/* Drawer lateral */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'background.paper',
            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          },
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: [1],
            py: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <Image
              src="/logo.png"
              alt="ArtistRM Logo"
              width={60}
              height={60}
              priority
            />
            <Typography variant="h6" sx={{ mt: 1, fontWeight: 600, color: 'primary.main' }}>
              ArtistRM
            </Typography>
          </Box>
        </Toolbar>
        <Divider />
        <List component="nav">
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text}
              onClick={() => navigateTo(item.path)}
              selected={router.pathname === item.path}
              sx={{
                my: 0.5,
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 215, 0, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 215, 0, 0.25)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: router.pathname === item.path ? 'primary.main' : 'text.secondary',
                minWidth: 40
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: router.pathname === item.path ? 600 : 400,
                  color: router.pathname === item.path ? 'primary.main' : 'text.primary'
                }}
              />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ mt: 'auto' }} />
        <List>
          <ListItem 
            button 
            onClick={() => navigateTo('/settings')}
            selected={router.pathname === '/settings'}
            sx={{
              my: 0.5,
              mx: 1,
              borderRadius: 1,
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 215, 0, 0.15)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 215, 0, 0.25)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: router.pathname === '/settings' ? 'primary.main' : 'text.secondary',
              minWidth: 40
            }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Configuración" 
              primaryTypographyProps={{ 
                fontWeight: router.pathname === '/settings' ? 600 : 400,
                color: router.pathname === '/settings' ? 'primary.main' : 'text.primary'
              }}
            />
          </ListItem>
        </List>
      </Drawer>
      
      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          backgroundColor: 'background.default',
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          pt: 8,
        }}
      >
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
