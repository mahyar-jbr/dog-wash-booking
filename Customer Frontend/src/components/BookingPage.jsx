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
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import PetsIcon from '@mui/icons-material/Pets';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import EventIcon from '@mui/icons-material/Event';
import dayjs from 'dayjs';
import axios from 'axios';

// API base URL - update this when backend is deployed
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function BookingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    customerName: '',
    customerContact: '',
    date: null,
    time: '',
    duration: 60,
    duration2: 60, // For second dog in sequential washing
    numberOfDogs: 1,
    washingMethod: 'simultaneous', // 'simultaneous' or 'sequential'
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [showLastSlotWarning, setShowLastSlotWarning] = useState(false);

  // Store bookings in state (in production, this would be in a database)
  const [bookings, setBookings] = useState(() => {
    // Load bookings from localStorage if available
    const saved = localStorage.getItem('petvalu_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  // Duration options
  const durations = [
    { value: 30, label: '30 minutes - Quick Wash' },
    { value: 60, label: '60 minutes - Standard Wash' },
    { value: 90, label: '90 minutes - Premium Spa' },
  ];

  // Number of dogs options
  const dogOptions = [
    { value: 1, label: '1 Dog', description: 'Single wash station' },
    { value: 2, label: '2 Dogs', description: 'Choose washing method next' },
  ];

  // Washing method options (for 2 dogs)
  const washingMethods = [
    { value: 'simultaneous', label: 'Both Tubs at Same Time', description: 'Wash both dogs simultaneously using 2 tubs' },
    { value: 'sequential', label: 'Same Tub, One After Another', description: 'Wash dogs sequentially in one tub' },
  ];

  // Constants
  const CLEANUP_TIME = 15; // minutes
  const MAX_TUBS = 2;
  const DOG_WASH_CLOSES_BEFORE_STORE = 1; // hours before store closes

  const STORE_HOURS = {
    weekday: {
      storeOpen: 9,
      storeClose: 21,      // 9 PM
      dogWashClose: 20     // 8 PM (1 hour before store closes)
    },
    saturday: {
      storeOpen: 9,
      storeClose: 19,      // 7 PM
      dogWashClose: 18     // 6 PM (1 hour before store closes)
    },
    sunday: {
      storeOpen: 10,
      storeClose: 19,      // 7 PM
      dogWashClose: 18     // 6 PM (1 hour before store closes)
    },
  };

  // Calculate available time slots when date, duration, or numberOfDogs changes
  useEffect(() => {
    if (formData.date) {
      calculateAvailableSlots();
    }
  }, [formData.date, formData.duration, formData.duration2, formData.numberOfDogs, formData.washingMethod, bookings]);

  // Helper: Convert time string to minutes since midnight
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper: Convert minutes since midnight to time string
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Helper: Get store hours for a specific date
  const getStoreHours = (date) => {
    const dayOfWeek = dayjs(date).day();
    if (dayOfWeek === 0) {
      // Sunday
      return STORE_HOURS.sunday;
    } else if (dayOfWeek === 6) {
      // Saturday
      return STORE_HOURS.saturday;
    } else {
      // Monday-Friday
      return STORE_HOURS.weekday;
    }
  };

  // Check if a tub is available for a given time range
  const isTubAvailable = (tubNumber, date, startMinutes, endMinutes) => {
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const dayBookings = bookings.filter(b => b.date === dateStr);

    for (const booking of dayBookings) {
      // Check if this booking uses the specified tub
      if (!booking.tubsUsed.includes(tubNumber)) continue;

      const bookingStart = timeToMinutes(booking.time);
      const bookingEnd = bookingStart + booking.duration;
      const cleanupEnd = bookingEnd + CLEANUP_TIME;

      // Check for overlap (including cleanup time)
      if (startMinutes < cleanupEnd && endMinutes > bookingStart) {
        return false;
      }
    }
    return true;
  };

  // Calculate available slots based on bookings and business rules
  const calculateAvailableSlots = () => {
    setFetchingSlots(true);
    setError('');

    try {
      const dateStr = dayjs(formData.date).format('YYYY-MM-DD');
      const hours = getStoreHours(formData.date);
      const { numberOfDogs, duration, duration2, washingMethod } = formData;

      // Determine tubs needed and total duration
      let tubsNeeded;
      let totalDuration;

      if (numberOfDogs === 1) {
        tubsNeeded = 1;
        totalDuration = duration;
      } else if (washingMethod === 'simultaneous') {
        tubsNeeded = 2; // Both tubs at same time
        totalDuration = duration;
      } else { // sequential
        tubsNeeded = 1; // One tub, one after another
        totalDuration = duration + duration2;
      }

      const slots = [];
      const startMinutes = hours.storeOpen * 60;
      const dogWashCloseMinutes = hours.dogWashClose * 60;

      // Generate slots every 30 minutes
      for (let currentMinutes = startMinutes; currentMinutes < dogWashCloseMinutes; currentMinutes += 30) {
        const slotEndMinutes = currentMinutes + totalDuration;

        // Check if service would finish before dog wash closes (not store closes!)
        if (slotEndMinutes > dogWashCloseMinutes) continue;

        // Check tub availability
        let availableTubs = 0;
        const availableTubNumbers = [];

        for (let tub = 1; tub <= MAX_TUBS; tub++) {
          if (isTubAvailable(tub, formData.date, currentMinutes, slotEndMinutes)) {
            availableTubs++;
            availableTubNumbers.push(tub);
          }
        }

        // Check if we have enough tubs
        if (availableTubs >= tubsNeeded) {
          slots.push({
            time: minutesToTime(currentMinutes),
            endTime: minutesToTime(slotEndMinutes),
            totalDuration,
            availableTubs,
            availableTubNumbers,
            isLastSlot: false, // Will mark the last one after loop
          });
        }
      }

      // Mark the last slot
      if (slots.length > 0) {
        slots[slots.length - 1].isLastSlot = true;
      }

      setAvailableSlots(slots);
    } catch (err) {
      console.error('Error calculating slots:', err);
      setError('Error calculating available time slots');
    } finally {
      setFetchingSlots(false);
    }
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
    setShowLastSlotWarning(false); // Reset warning when date changes
  };

  const handleTimeSlotClick = (slot) => {
    setFormData(prev => ({ ...prev, time: slot.time }));

    // Show warning if this is the last slot of the day
    if (slot.isLastSlot) {
      setShowLastSlotWarning(true);
    } else {
      setShowLastSlotWarning(false);
    }
  };

  // Step navigation
  const getTotalSteps = () => {
    // Step 1: Info, Step 2: Dogs, Step 3: Method (if 2 dogs), Step 4: Duration, Step 5: Date, Step 6: Time
    return formData.numberOfDogs === 2 ? 6 : 5;
  };

  const canGoNext = () => {
    if (formData.numberOfDogs === 1) {
      // For 1 dog: Info -> Dogs -> Duration -> Date -> Time
      switch (currentStep) {
        case 1: // Info
          return formData.customerName && formData.customerContact &&
                 (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerContact) ||
                  /^[\d\s()-]+$/.test(formData.customerContact));
        case 2: // Dogs
          return formData.numberOfDogs > 0;
        case 3: // Duration
          return formData.duration > 0;
        case 4: // Date
          return formData.date !== null;
        case 5: // Time
          return formData.time !== '';
        default:
          return false;
      }
    } else {
      // For 2 dogs: Info -> Dogs -> Washing Method -> Duration -> Date -> Time
      switch (currentStep) {
        case 1: // Info
          return formData.customerName && formData.customerContact &&
                 (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerContact) ||
                  /^[\d\s()-]+$/.test(formData.customerContact));
        case 2: // Dogs
          return formData.numberOfDogs > 0;
        case 3: // Washing Method
          return formData.washingMethod !== '';
        case 4: // Duration
          return formData.duration > 0 &&
                 (formData.washingMethod !== 'sequential' || formData.duration2 > 0);
        case 5: // Date
          return formData.date !== null;
        case 6: // Time
          return formData.time !== '';
        default:
          return false;
      }
    }
  };

  const handleNext = () => {
    setError('');
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
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
      // Find which tubs to assign
      const selectedSlot = availableSlots.find(slot => slot.time === formData.time);

      let tubsToUse;
      let totalDuration;

      if (formData.numberOfDogs === 1) {
        tubsToUse = [selectedSlot?.availableTubNumbers[0] || 1];
        totalDuration = formData.duration;
      } else if (formData.washingMethod === 'simultaneous') {
        tubsToUse = [1, 2];
        totalDuration = formData.duration;
      } else { // sequential
        tubsToUse = [selectedSlot?.availableTubNumbers[0] || 1];
        totalDuration = formData.duration + formData.duration2;
      }

      // Create booking object
      const newBooking = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        customerName: formData.customerName,
        customerContact: formData.customerContact,
        date: dayjs(formData.date).format('YYYY-MM-DD'),
        time: formData.time,
        duration: totalDuration,
        duration1: formData.duration,
        duration2: formData.numberOfDogs === 2 && formData.washingMethod === 'sequential' ? formData.duration2 : null,
        numberOfDogs: formData.numberOfDogs,
        washingMethod: formData.numberOfDogs === 2 ? formData.washingMethod : null,
        tubsUsed: tubsToUse,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };

      // Save to state and localStorage
      const updatedBookings = [...bookings, newBooking];
      setBookings(updatedBookings);
      localStorage.setItem('petvalu_bookings', JSON.stringify(updatedBookings));

      // Try to sync with backend if available
      try {
        await axios.post(`${API_BASE_URL}/api/bookings`, {
          customer_name: newBooking.customerName,
          customer_contact: newBooking.customerContact,
          date: newBooking.date,
          time: newBooking.time,
          duration: newBooking.duration,
          number_of_dogs: newBooking.numberOfDogs,
          tubs_used: newBooking.tubsUsed,
          status: 'confirmed',
        });
      } catch (backendErr) {
        console.log('Backend not available, using local storage only');
      }

      // Navigate to confirmation page with booking details
      const selectedTimeSlot = availableSlots.find(s => s.time === formData.time);
      navigate('/confirmation', {
        state: {
          booking: newBooking,
          customerName: formData.customerName,
          date: dayjs(formData.date).format('MMMM D, YYYY'),
          time: formData.time,
          endTime: selectedTimeSlot?.endTime,
          duration: totalDuration,
          duration1: formData.duration,
          duration2: formData.numberOfDogs === 2 && formData.washingMethod === 'sequential' ? formData.duration2 : null,
          numberOfDogs: formData.numberOfDogs,
          washingMethod: formData.numberOfDogs === 2 ? formData.washingMethod : null,
        }
      });
    } catch (err) {
      console.error('Booking error:', err);
      setError('An error occurred while creating your booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render step content - dynamically maps based on number of dogs
  const renderStepContent = () => {
    if (formData.numberOfDogs === 1) {
      // For 1 dog: Info -> Dogs -> Duration -> Date -> Time (5 steps)
      switch (currentStep) {
        case 1: return renderStep1(); // Info
        case 2: return renderStep2(); // Dogs
        case 3: return renderStep4(); // Duration (skip washing method)
        case 4: return renderStep5(); // Date
        case 5: return renderStep6(); // Time
        default: return null;
      }
    } else {
      // For 2 dogs: Info -> Dogs -> Washing Method -> Duration -> Date -> Time (6 steps)
      switch (currentStep) {
        case 1: return renderStep1(); // Info
        case 2: return renderStep2(); // Dogs
        case 3: return renderStep3(); // Washing Method
        case 4: return renderStep4(); // Duration
        case 5: return renderStep5(); // Date
        case 6: return renderStep6(); // Time
        default: return null;
      }
    }
  };

  // Step 1: Personal Information
  const renderStep1 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
        Let's Start With Your Information
      </Typography>
      <Box sx={{ width: '100%', maxWidth: '500px' }}>
        <TextField
          fullWidth
          required
          label="Your Name"
          name="customerName"
          value={formData.customerName}
          onChange={handleInputChange}
          variant="outlined"
          size="large"
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              fontSize: '1.25rem',
            },
            '& .MuiInputLabel-root': {
              fontSize: '1.25rem',
            },
            '& .MuiOutlinedInput-input': {
              padding: '18px 14px',
            }
          }}
        />
        <TextField
          fullWidth
          required
          label="Email or Phone Number"
          name="customerContact"
          value={formData.customerContact}
          onChange={handleInputChange}
          placeholder="email@example.com or (555) 123-4567"
          variant="outlined"
          size="large"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              fontSize: '1.25rem',
            },
            '& .MuiInputLabel-root': {
              fontSize: '1.25rem',
            },
            '& .MuiOutlinedInput-input': {
              padding: '18px 14px',
            }
          }}
        />
      </Box>
    </Box>
  );

  // Step 2: Number of Dogs
  const renderStep2 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
        How Many Dogs?
      </Typography>
      <Box sx={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {dogOptions.map(option => (
          <Paper
            key={option.value}
            elevation={0}
            sx={{
              p: 4,
              cursor: 'pointer',
              borderRadius: 3,
              border: 3,
              borderColor: formData.numberOfDogs === option.value ? 'primary.main' : 'grey.300',
              backgroundColor: formData.numberOfDogs === option.value ? 'primary.main' : 'white',
              color: formData.numberOfDogs === option.value ? 'white' : 'text.primary',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: 3,
              }
            }}
            onClick={() => setFormData(prev => ({ ...prev, numberOfDogs: option.value, time: '' }))}
          >
            <Typography variant="h5" gutterBottom fontWeight={700}>
              {option.label}
            </Typography>
            <Typography variant="body1">
              {option.description}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );

  // Step 3: Washing Method (only for 2 dogs)
  const renderStep3 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
        How Would You Like to Wash Them?
      </Typography>
      <Box sx={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {washingMethods.map(method => (
          <Paper
            key={method.value}
            elevation={0}
            sx={{
              p: 4,
              cursor: 'pointer',
              borderRadius: 3,
              border: 3,
              borderColor: formData.washingMethod === method.value ? 'primary.main' : 'grey.300',
              backgroundColor: formData.washingMethod === method.value ? 'primary.main' : 'white',
              color: formData.washingMethod === method.value ? 'white' : 'text.primary',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: 3,
              }
            }}
            onClick={() => setFormData(prev => ({ ...prev, washingMethod: method.value, time: '' }))}
          >
            <Typography variant="h5" gutterBottom fontWeight={700}>
              {method.label}
            </Typography>
            <Typography variant="body1">
              {method.description}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );

  // Step 4: Service Duration
  const renderStep4 = () => {
    const isSequential = formData.numberOfDogs === 2 && formData.washingMethod === 'sequential';

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
          {isSequential ? 'Choose Service for Each Dog' : 'Choose Your Service'}
        </Typography>

        {isSequential ? (
          <Box sx={{ width: '100%', maxWidth: '700px' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
              First Dog
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 5, justifyContent: 'center' }}>
              {durations.map(duration => (
                <Paper
                  key={duration.value}
                  elevation={0}
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    borderRadius: 3,
                    border: 3,
                    flex: 1,
                    borderColor: formData.duration === duration.value ? 'primary.main' : 'grey.300',
                    backgroundColor: formData.duration === duration.value ? 'primary.main' : 'white',
                    color: formData.duration === duration.value ? 'white' : 'text.primary',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 3,
                    }
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, duration: duration.value, time: '' }))}
                >
                  <Typography variant="h4" gutterBottom fontWeight={700}>
                    {duration.value}
                  </Typography>
                  <Typography variant="body1">
                    minutes
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                    {duration.label.split(' - ')[1]}
                  </Typography>
                </Paper>
              ))}
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
              Second Dog
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              {durations.map(duration => (
                <Paper
                  key={`dog2-${duration.value}`}
                  elevation={0}
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    borderRadius: 3,
                    border: 3,
                    flex: 1,
                    borderColor: formData.duration2 === duration.value ? 'primary.main' : 'grey.300',
                    backgroundColor: formData.duration2 === duration.value ? 'primary.main' : 'white',
                    color: formData.duration2 === duration.value ? 'white' : 'text.primary',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 3,
                    }
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, duration2: duration.value, time: '' }))}
                >
                  <Typography variant="h4" gutterBottom fontWeight={700}>
                    {duration.value}
                  </Typography>
                  <Typography variant="body1">
                    minutes
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                    {duration.label.split(' - ')[1]}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 3, maxWidth: '700px', justifyContent: 'center' }}>
            {durations.map(duration => (
              <Paper
                key={duration.value}
                elevation={0}
                sx={{
                  p: 4,
                  cursor: 'pointer',
                  borderRadius: 3,
                  border: 3,
                  flex: 1,
                  borderColor: formData.duration === duration.value ? 'primary.main' : 'grey.300',
                  backgroundColor: formData.duration === duration.value ? 'primary.main' : 'white',
                  color: formData.duration === duration.value ? 'white' : 'text.primary',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 3,
                  }
                }}
                onClick={() => setFormData(prev => ({ ...prev, duration: duration.value, time: '' }))}
              >
                <Typography variant="h3" gutterBottom fontWeight={700}>
                  {duration.value}
                </Typography>
                <Typography variant="h6">
                  minutes
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {duration.label.split(' - ')[1]}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  // Step 5: Date Selection
  const renderStep5 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
        Pick Your Date
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <StaticDatePicker
          displayStaticWrapperAs="desktop"
          value={formData.date}
          onChange={handleDateChange}
          minDate={dayjs()}
          maxDate={dayjs().add(30, 'day')}
          slotProps={{
            layout: {
              sx: {
                '& .MuiPickersCalendarHeader-root': {
                  padding: '16px',
                },
                '& .MuiPickersCalendarHeader-label': {
                  fontSize: '1.5rem',
                  fontWeight: 700,
                },
                '& .MuiPickersArrowSwitcher-button': {
                  width: '48px',
                  height: '48px',
                },
                '& .MuiDayCalendar-header': {
                  gap: '8px',
                },
                '& .MuiDayCalendar-weekContainer': {
                  margin: '4px 0',
                },
                '& .MuiPickersDay-root': {
                  fontSize: '1.25rem',
                  width: '52px',
                  height: '52px',
                  margin: '4px',
                },
                '& .MuiPickersDay-today': {
                  border: '2px solid',
                },
                backgroundColor: 'white',
                borderRadius: 3,
              }
            },
            actionBar: {
              actions: [],
            }
          }}
        />
      </Box>
    </Box>
  );

  // Step 6: Time Selection
  const renderStep6 = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
          Choose Your Time
        </Typography>
        {fetchingSlots ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : availableSlots.length > 0 ? (
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            justifyContent: 'center',
            maxWidth: '800px'
          }}>
            {availableSlots.map(slot => {
              const isSelected = formData.time === slot.time;
              return (
                <Paper
                  key={slot.time}
                  elevation={0}
                  onClick={() => handleTimeSlotClick(slot)}
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    borderRadius: 3,
                    border: 3,
                    minWidth: '160px',
                    borderColor: isSelected ? 'primary.main' : 'grey.300',
                    backgroundColor: isSelected ? 'primary.main' : 'white',
                    color: isSelected ? 'white' : 'text.primary',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 3,
                    }
                  }}
                >
                  <Typography variant="h5" fontWeight={700}>
                    {slot.time}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    to {slot.endTime}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        ) : (
          <Alert severity="info" sx={{ maxWidth: '600px', mx: 'auto' }}>
            No available slots for this date. Please go back and select another date.
          </Alert>
        )}

        {showLastSlotWarning && formData.time && (
          <Alert severity="warning" sx={{ mt: 4, maxWidth: '600px', mx: 'auto' }}>
            <Typography variant="body1" fontWeight={600}>
              This is the last appointment of the day
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Dog wash closes at {minutesToTime(getStoreHours(formData.date).dogWashClose * 60)}
            </Typography>
          </Alert>
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
      {/* Simple Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <PetsIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'white', fontWeight: 700 }}>
          PetValu Dog Wash
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)' }}>
          Book Your Appointment
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 6 },
          borderRadius: 3,
          background: 'white',
        }}
      >
        {/* Progress Indicator */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            {[1, 2, 3, 4, 5, 6].slice(0, getTotalSteps()).map((step) => (
              <Box
                key={step}
                sx={{
                  width: `${100 / getTotalSteps()}%`,
                  height: 8,
                  backgroundColor: step <= currentStep ? 'secondary.main' : 'grey.200',
                  borderRadius: 1,
                  mx: 0.5,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Box>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Step {currentStep} of {getTotalSteps()}
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 4 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Render Current Step */}
          <Box sx={{ minHeight: '400px', mb: 5 }}>
            {renderStepContent()}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, maxWidth: '600px', mx: 'auto', width: '100%' }}>
            {currentStep > 1 && (
              <Button
                variant="outlined"
                size="large"
                color="secondary"
                onClick={handleBack}
                sx={{
                  py: 2.5,
                  px: 6,
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  borderWidth: 2,
                  minWidth: '150px',
                  '&:hover': {
                    borderWidth: 2,
                  }
                }}
              >
                Back
              </Button>
            )}
            {currentStep < getTotalSteps() ? (
              <Button
                variant="contained"
                size="large"
                color="secondary"
                onClick={handleNext}
                disabled={!canGoNext()}
                sx={{
                  py: 2.5,
                  px: 6,
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  minWidth: '200px',
                  flex: currentStep === 1 ? 1 : undefined,
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                size="large"
                color="secondary"
                disabled={loading || !formData.time}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{
                  py: 2.5,
                  px: 6,
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  minWidth: '200px',
                }}
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </Button>
            )}
          </Box>
        </form>

        {/* Simple footer */}
        <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'grey.200', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Questions? Call us at +1 (905) 773-1939
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            13239 Yonge St, Richmond Hill, ON
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default BookingPage;