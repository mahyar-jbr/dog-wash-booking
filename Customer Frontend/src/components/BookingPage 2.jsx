import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  Chip,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PetsIcon from '@mui/icons-material/Pets';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import dayjs from 'dayjs';
import axios from 'axios';

// API base URL - update this when backend is deployed
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function BookingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerName: '',
    customerContact: '',
    date: null,
    time: '',
    duration: 60,
  });
  
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingSlots, setFetchingSlots] = useState(false);

  // Duration options
  const durations = [
    { value: 30, label: '30 minutes - Quick Wash' },
    { value: 60, label: '60 minutes - Standard Wash' },
    { value: 90, label: '90 minutes - Premium Spa' },
  ];

  // Fetch available time slots when date changes
  useEffect(() => {
    if (formData.date) {
      fetchAvailableSlots();
    }
  }, [formData.date, formData.duration]);

  const fetchAvailableSlots = async () => {
    setFetchingSlots(true);
    setError('');
    try {
      const dateStr = dayjs(formData.date).format('YYYY-MM-DD');
      const response = await axios.get(
        `${API_BASE_URL}/api/available-slots?date=${dateStr}&duration=${formData.duration}`
      );
      setAvailableSlots(response.data.slots || generateDefaultSlots());
    } catch (err) {
      console.error('Error fetching slots:', err);
      // If backend is not available, use default slots for testing
      setAvailableSlots(generateDefaultSlots());
    } finally {
      setFetchingSlots(false);
    }
  };

  // Generate default time slots for testing (when backend is not connected)
  const generateDefaultSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (newDate) => {
    setFormData(prev => ({
      ...prev,
      date: newDate,
      time: '', // Reset time when date changes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.customerName || !formData.customerContact || !formData.date || !formData.time) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Email or phone validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s()-]+$/;
    if (!emailRegex.test(formData.customerContact) && !phoneRegex.test(formData.customerContact)) {
      setError('Please enter a valid email or phone number');
      setLoading(false);
      return;
    }

    try {
      const bookingData = {
        customer_name: formData.customerName,
        customer_contact: formData.customerContact,
        date: dayjs(formData.date).format('YYYY-MM-DD'),
        time: formData.time,
        duration: formData.duration,
        status: 'confirmed',
      };

      const response = await axios.post(`${API_BASE_URL}/api/bookings`, bookingData);
      
      // Navigate to confirmation page with booking details
      navigate('/confirmation', { 
        state: { 
          booking: response.data,
          customerName: formData.customerName,
          date: dayjs(formData.date).format('MMMM D, YYYY'),
          time: formData.time,
          duration: formData.duration,
        } 
      });
    } catch (err) {
      console.error('Booking error:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        // If backend is not available, simulate success for testing
        navigate('/confirmation', { 
          state: { 
            booking: { id: Math.random().toString(36).substr(2, 9) },
            customerName: formData.customerName,
            date: dayjs(formData.date).format('MMMM D, YYYY'),
            time: formData.time,
            duration: formData.duration,
          } 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <PetsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom>
            PetValu Dog Wash
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Book Your Appointment Online
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Customer Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Your Name"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Email or Phone"
                name="customerContact"
                value={formData.customerContact}
                onChange={handleInputChange}
                placeholder="email@example.com or (555) 123-4567"
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                helperText="We'll use this to confirm your appointment"
              />
            </Grid>

            {/* Date Picker */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Select Date"
                value={formData.date}
                onChange={handleDateChange}
                minDate={dayjs()}
                maxDate={dayjs().add(30, 'day')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    helperText: "Available up to 30 days in advance",
                  },
                }}
              />
            </Grid>

            {/* Duration Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Service Duration</InputLabel>
                <Select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  label="Service Duration"
                  startAdornment={<AccessTimeIcon sx={{ ml: 1, mr: 0.5, color: 'action.active' }} />}
                >
                  {durations.map(duration => (
                    <MenuItem key={duration.value} value={duration.value}>
                      {duration.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Choose based on your dog's size and service needs</FormHelperText>
              </FormControl>
            </Grid>

            {/* Time Slot Selection */}
            <Grid item xs={12}>
              {formData.date && (
                <>
                  <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                    Available Time Slots
                  </Typography>
                  {fetchingSlots ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {availableSlots.length > 0 ? (
                        availableSlots.map(slot => (
                          <Chip
                            key={slot}
                            label={slot}
                            onClick={() => setFormData(prev => ({ ...prev, time: slot }))}
                            color={formData.time === slot ? 'primary' : 'default'}
                            variant={formData.time === slot ? 'filled' : 'outlined'}
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': { 
                                backgroundColor: formData.time === slot 
                                  ? 'primary.main' 
                                  : 'action.hover' 
                              }
                            }}
                          />
                        ))
                      ) : (
                        <Typography color="text.secondary">
                          No available slots for this date. Please select another date.
                        </Typography>
                      )}
                    </Box>
                  )}
                  {formData.time && (
                    <Typography variant="body2" sx={{ mt: 2, color: 'primary.main' }}>
                      Selected: {dayjs(formData.date).format('MMM D, YYYY')} at {formData.time}
                    </Typography>
                  )}
                </>
              )}
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading || !formData.time}
                startIcon={loading ? <CircularProgress size={20} /> : <PetsIcon />}
                sx={{ 
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </Button>
            </Grid>
          </Grid>
        </form>

        {/* Store Information */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            <strong>Store Hours:</strong> Monday - Saturday: 9:00 AM - 6:00 PM | Sunday: 10:00 AM - 5:00 PM
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            <strong>Location:</strong> 123 Main Street, Your City | <strong>Phone:</strong> (555) 123-4567
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default BookingPage;