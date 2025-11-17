import React from 'react';
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
  if (!bookingDetails) {
    navigate('/');
    return null;
  }

  const { customerName, date, time, duration, booking } = bookingDetails;

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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Success Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 72, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Booking Confirmed!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Thank you for booking with PetValu Dog Wash
          </Typography>
        </Box>

        {/* Booking Reference */}
        <Alert 
          severity="success" 
          sx={{ mb: 3, display: 'flex', alignItems: 'center' }}
          icon={<PetsIcon />}
        >
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              Booking Reference
            </Typography>
            <Typography variant="h6" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
              #{booking?.id || 'PV-' + Math.random().toString(36).substr(2, 9).toUpperCase()}
            </Typography>
          </Box>
        </Alert>

        {/* Booking Details Card */}
        <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Appointment Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Customer Name"
                  secondary={customerName}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <EventIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Date"
                  secondary={date}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <AccessTimeIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Time"
                  secondary={`${time} (${getDurationLabel(duration)})`}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* What's Next Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            What's Next?
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="• We've saved your appointment in our system"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="• Please arrive 5 minutes before your scheduled time"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="• Bring your dog on a leash for safety"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="• Our staff will be ready to welcome you and your furry friend!"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          </List>
        </Box>

        {/* Important Information */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Cancellation Policy
          </Typography>
          <Typography variant="body2">
            If you need to cancel or reschedule, please call us at least 2 hours before your appointment at (555) 123-4567.
          </Typography>
        </Alert>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ minWidth: 200 }}
          >
            Print Confirmation
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<HomeIcon />}
            onClick={handleNewBooking}
            sx={{ minWidth: 200 }}
          >
            Book Another
          </Button>
        </Box>

        {/* Contact Information */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Need Help?</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Call us at (555) 123-4567 or email support@petvaludogwash.com
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Location:</strong> 123 Main Street, Your City
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default ConfirmationPage;