import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  Link as MuiLink,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Google } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signInWithGoogle, loading, error, clearError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Image
            src="/logo.png"
            alt="ArtistRM Logo"
            width={120}
            height={120}
            priority
          />
          <Typography component="h1" variant="h4" sx={{ mt: 2, fontWeight: 600, color: 'primary.main' }}>
            ArtistRM
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Tu Plataforma 360 de Road Management Artístico
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            backgroundColor: 'background.paper',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <Typography component="h2" variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 500 }}>
            Iniciar Sesión
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ 
                py: 1.5, 
                mb: 2,
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 4px 6px rgba(255, 215, 0, 0.25)',
                '&:hover': {
                  boxShadow: '0 6px 10px rgba(255, 215, 0, 0.35)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={handleGoogleSignIn}
              disabled={loading}
              startIcon={<Google />}
              sx={{ 
                py: 1.5, 
                mb: 3,
                fontWeight: 500,
                fontSize: '1rem',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                }
              }}
            >
              Continuar con Google
            </Button>

            <Grid container spacing={1}>
              <Grid item xs>
                <Link href="/forgot-password" passHref>
                  <MuiLink variant="body2" color="primary.main">
                    ¿Olvidaste tu contraseña?
                  </MuiLink>
                </Link>
              </Grid>
              <Grid item>
                <Link href="/register" passHref>
                  <MuiLink variant="body2" color="primary.main">
                    ¿No tienes cuenta? Regístrate
                  </MuiLink>
                </Link>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
