import React from 'react';
import { Layout } from '@/components/layout/Layout';
import ZeusChat from '@/components/zeus/ZeusChat';
import { Box, Grid, Paper, Typography, Container } from '@mui/material';

export default function ZeusPage() {
  return (
    <Layout>
      <Container maxWidth="xl">
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Zeus IA - Tu asistente inteligente
          </Typography>
          <Typography variant="body1" paragraph>
            Zeus te ayuda a analizar tu carrera musical y tomar decisiones estratégicas basadas en datos.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <ZeusChat />
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Sugerencias
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Paper 
                    elevation={1} 
                    sx={{ p: 2, mb: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <Typography variant="body1">
                      ¿Cómo ha sido el rendimiento de mi último lanzamiento?
                    </Typography>
                  </Paper>
                  <Paper 
                    elevation={1} 
                    sx={{ p: 2, mb: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <Typography variant="body1">
                      ¿Cuáles son mis próximos eventos?
                    </Typography>
                  </Paper>
                  <Paper 
                    elevation={1} 
                    sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <Typography variant="body1">
                      Genera un informe de mis ingresos del último trimestre
                    </Typography>
                  </Paper>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Layout>
  );
}
