import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import PetsIcon from '@mui/icons-material/Pets';
import PrintIcon from '@mui/icons-material/Print';
import EmailIcon from '@mui/icons-material/Email';

function ConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingDetails = location.state;

  // If no booking details, redirect to home
  useEffect(() => {
    if (!bookingDetails) {
      navigate('/');
    }
  }, [bookingDetails, navigate]);

  // Don't render if no booking details
  if (!bookingDetails) {
    return null;
  }

  const { customerName, date, time, endTime, duration, duration1, duration2, numberOfDogs = 1, washingMethod, booking } = bookingDetails;

  const getDurationLabel = (minutes) => {
    switch(minutes) {
      case 30: return 'Quick Wash';
      case 60: return 'Standard Wash';
      case 90: return 'Premium Spa';
      default: return `${minutes} minutes`;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewBooking = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 6 } }}>
      {/* Success Header */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            mb: 3,
            boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)',
            animation: 'scaleIn 0.5s ease',
            '@keyframes scaleIn': {
              '0%': { transform: 'scale(0)', opacity: 0 },
              '50%': { transform: 'scale(1.1)' },
              '100%': { transform: 'scale(1)', opacity: 1 },
            }
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 60, color: 'white' }} />
        </Box>
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'white', fontWeight: 800 }}>
          Booking Confirmed!
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 400 }}>
          Your furry friend's spa day is all set
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Booking Reference */}
        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '2px solid #10b981',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <PetsIcon sx={{ color: 'success.main', fontSize: 32 }} />
            <Typography variant="subtitle1" fontWeight={700} color="success.dark">
              Booking Reference Number
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'success.dark' }}>
            #{booking?.id || 'PV-' + Math.random().toString(36).substr(2, 9).toUpperCase()}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Appointment Details */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200',
                boxShadow: 2,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 700, color: 'primary.main' }}>
                  Appointment Details
                </Typography>

                <List sx={{ p: 0 }}>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      <PersonIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Customer Name"
                      secondary={customerName}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.secondary' }}
                      secondaryTypographyProps={{ fontWeight: 600, fontSize: '1.125rem', color: 'text.primary' }}
                    />
                  </ListItem>
                  <Divider />

                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      <EventIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Date"
                      secondary={date}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.secondary' }}
                      secondaryTypographyProps={{ fontWeight: 600, fontSize: '1.125rem', color: 'text.primary' }}
                    />
                  </ListItem>
                  <Divider />

                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      <AccessTimeIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={numberOfDogs === 2 && washingMethod === 'sequential' ? 'Time Range' : 'Time & Service'}
                      secondary={
                        numberOfDogs === 2 && washingMethod === 'sequential'
                          ? `${time} - ${endTime} (${duration} min total)`
                          : `${time} • ${getDurationLabel(duration)}`
                      }
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.secondary' }}
                      secondaryTypographyProps={{ fontWeight: 600, fontSize: '1.125rem', color: 'text.primary' }}
                    />
                  </ListItem>
                  <Divider />

                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      <PetsIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Dogs & Method"
                      secondary={
                        numberOfDogs === 2 && washingMethod === 'sequential'
                          ? `2 dogs • Sequential (${duration1} + ${duration2} min)`
                          : numberOfDogs === 2
                            ? '2 dogs • Both tubs at same time'
                            : '1 dog'
                      }
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.secondary' }}
                      secondaryTypographyProps={{ fontWeight: 600, fontSize: '1.125rem', color: 'text.primary' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* What's Next */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200',
                boxShadow: 2,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 700, color: 'primary.main' }}>
                  What to Expect
                </Typography>

                <List sx={{ p: 0 }}>
                  <ListItem sx={{ px: 0, py: 1.5, alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                      <CheckCircleIcon sx={{ color: 'success.main', fontSize: 24 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Your appointment is confirmed and saved"
                      primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }}
                    />
                  </ListItem>

                  <ListItem sx={{ px: 0, py: 1.5, alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                      <CheckCircleIcon sx={{ color: 'success.main', fontSize: 24 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Arrive 5 minutes early to check in"
                      primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }}
                    />
                  </ListItem>

                  <ListItem sx={{ px: 0, py: 1.5, alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                      <CheckCircleIcon sx={{ color: 'success.main', fontSize: 24 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Bring your dog on a leash for safety"
                      primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }}
                    />
                  </ListItem>

                  <ListItem sx={{ px: 0, py: 1.5, alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                      <CheckCircleIcon sx={{ color: 'success.main', fontSize: 24 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Our team will pamper your furry friend!"
                      primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Dog Wash Rules */}
        <Box
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 3,
            backgroundColor: 'warning.50',
            border: '2px solid',
            borderColor: 'warning.main',
          }}
        >
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: 'warning.dark' }}>
            Dog Wash Rules
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>KEEP</strong> pet on leash when moving around the dog wash area
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>ONLY</strong> furry friends allowed on steps and in tubs
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>NO</strong> washing skunked pets
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>NO</strong> gland expression
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>NO</strong> nail or fur trimming
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>NO</strong> washing pets with fleas or ticks
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
            <strong>TIP:</strong> Ask your Animal Care Experts for at-home treatments
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, fontWeight: 600, color: 'warning.dark' }}>
            Pet parents are responsible for the safety of their dogs while in store and at the Dog Wash.
          </Typography>
        </Box>

        {/* Cancellation Policy */}
        <Alert
          severity="info"
          sx={{
            mt: 4,
            borderRadius: 3,
            py: 2,
            border: '1px solid',
            borderColor: 'info.light',
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Cancellation Policy
          </Typography>
          <Typography variant="body2">
            Need to reschedule? No problem! Just call us at least 2 hours before your appointment at +1 (905) 773-1939.
          </Typography>
        </Alert>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', mt: 5 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              minWidth: 200,
              py: 1.75,
              borderRadius: 2,
              fontSize: '1rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
              '&:hover': {
                boxShadow: '0 12px 32px rgba(99, 102, 241, 0.5)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Print Confirmation
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<HomeIcon />}
            onClick={handleNewBooking}
            sx={{
              minWidth: 200,
              py: 1.75,
              borderRadius: 2,
              fontSize: '1rem',
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Book Another Appointment
          </Button>
        </Box>

        {/* Contact Information */}
        <Box sx={{ mt: 5, p: 3, bgcolor: 'primary.50', borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom fontWeight={700}>
            Need Help?
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                <strong>Phone:</strong> +1 (905) 773-1939
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                <EmailIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                <strong>Email:</strong> PVF2413@petvalu.biz
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                <strong>Address:</strong> 13239 Yonge St, Richmond Hill, ON L4E 1B6
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default ConfirmationPage;