import { useState } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  IconButton,
  Button,
  TextField,
  Stack,
  Card,
  CardContent,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  FilterList as FilterIcon,
  Event as EventIcon,
  Pets as PetsIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import EditBookingModal from './EditBookingModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';

// Mock booking data
const mockBookings = [
  {
    id: 1,
    customer_name: "John Doe",
    customer_contact: "john@email.com",
    date: "2024-11-15",
    time: "14:00",
    duration: 60,
    status: "confirmed",
    created_at: "2024-11-10T10:30:00"
  },
  {
    id: 2,
    customer_name: "Sarah Smith",
    customer_contact: "416-555-1234",
    date: "2024-11-15",
    time: "15:30",
    duration: 45,
    status: "confirmed",
    created_at: "2024-11-10T11:15:00"
  },
  {
    id: 3,
    customer_name: "Mike Johnson",
    customer_contact: "mike.j@gmail.com",
    date: "2024-11-16",
    time: "10:00",
    duration: 60,
    status: "pending",
    created_at: "2024-11-11T09:00:00"
  },
  {
    id: 4,
    customer_name: "Emily Brown",
    customer_contact: "647-555-9876",
    date: "2024-11-16",
    time: "13:00",
    duration: 30,
    status: "confirmed",
    created_at: "2024-11-11T14:20:00"
  },
  {
    id: 5,
    customer_name: "David Lee",
    customer_contact: "david.lee@outlook.com",
    date: "2024-11-17",
    time: "11:30",
    duration: 45,
    status: "cancelled",
    created_at: "2024-11-12T08:45:00"
  },
];

function Dashboard({ onLogout }) {
  const [bookings, setBookings] = useState(mockBookings);
  const [filterDate, setFilterDate] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleEdit = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    setSelectedBooking(booking);
    setEditModalOpen(true);
  };

  const handleSaveBooking = (updatedBooking) => {
    setBookings(bookings.map(b =>
      b.id === updatedBooking.id ? updatedBooking : b
    ));
  };

  const handleDelete = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    setSelectedBooking(booking);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = (bookingId) => {
    setBookings(bookings.filter(b => b.id !== bookingId));
  };

  // Filter bookings by date
  const filteredBookings = filterDate
    ? bookings.filter(booking => booking.date === filterDate)
    : bookings;

  const handleClearFilter = () => {
    setFilterDate('');
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PetsIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  PetValu Admin
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Dog Wash Booking Management
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={onLogout}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Logout
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Stats Cards */}
        <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
          <Card
            sx={{
              flex: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Bookings
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {bookings.length}
                  </Typography>
                </Box>
                <EventIcon sx={{ fontSize: 60, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    {filterDate ? 'Filtered' : 'Today'}
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {filteredBookings.length}
                  </Typography>
                </Box>
                <ScheduleIcon sx={{ fontSize: 60, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Stack>

        {/* Bookings Table */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 3, pb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="600" sx={{ color: '#333' }}>
                Bookings
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center">
                <FilterIcon sx={{ color: '#667eea' }} />
                <TextField
                  type="date"
                  label="Filter by Date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{
                    minWidth: 200,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
                {filterDate && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleClearFilter}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      borderColor: '#667eea',
                      color: '#667eea',
                      '&:hover': {
                        borderColor: '#5568d3',
                        backgroundColor: 'rgba(102, 126, 234, 0.04)'
                      }
                    }}
                  >
                    Clear
                  </Button>
                )}
              </Stack>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#555' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#555' }}>Customer Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#555' }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#555' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#555' }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#555' }}>Duration</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#555' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow
                      key={booking.id}
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: '#f8f9fa',
                        },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell sx={{ color: '#666' }}>#{booking.id}</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: '#333' }}>{booking.customer_name}</TableCell>
                      <TableCell sx={{ color: '#666' }}>{booking.customer_contact}</TableCell>
                      <TableCell sx={{ color: '#666' }}>{booking.date}</TableCell>
                      <TableCell sx={{ color: '#666', fontWeight: 500 }}>{booking.time}</TableCell>
                      <TableCell sx={{ color: '#666' }}>{booking.duration} min</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit booking">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(booking.id)}
                            sx={{
                              mr: 1,
                              color: '#667eea',
                              '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.1)'
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete booking">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(booking.id)}
                            sx={{
                              color: '#f5576c',
                              '&:hover': {
                                backgroundColor: 'rgba(245, 87, 108, 0.1)'
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredBookings.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  {filterDate ? 'No bookings found for this date' : 'No bookings found'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {filterDate ? 'Try selecting a different date' : 'Bookings will appear here'}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        <EditBookingModal
          open={editModalOpen}
          booking={selectedBooking}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSaveBooking}
        />

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          booking={selectedBooking}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      </Container>
    </Box>
  );
}

export default Dashboard;
