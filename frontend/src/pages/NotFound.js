import React from 'react';
import { Box, Typography, Grid, Paper, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import NotFoundImage from '../assets/404.svg';

const NotFoundWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '80vh',
  padding: theme.spacing(3),
  textAlign: 'center'
}));

const NotFound = () => {
  return (
    <Container>
      <NotFoundWrapper>
        <Typography variant="h2" color="primary" gutterBottom>
          Página não encontrada
        </Typography>
        <Typography variant="h5" color="textSecondary" paragraph>
          A página que você está procurando não existe ou foi movida.
        </Typography>
        <Box sx={{ mt: 4, maxWidth: '400px' }}>
          <img src={NotFoundImage || '/static/404.svg'} alt="Página não encontrada" style={{ width: '100%' }} />
        </Box>
      </NotFoundWrapper>
    </Container>
  );
};

export default NotFound;
