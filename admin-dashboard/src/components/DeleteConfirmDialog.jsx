import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

function DeleteConfirmDialog({ open, booking, onClose, onConfirm }) {
  const handleConfirm = () => {
    onConfirm(booking.id);
    onClose();
  };

  if (!booking) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, color: '#333' }}>
        Delete Booking?
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: '#555' }}>
          Are you sure you want to delete the booking for <strong>{booking.customer_name}</strong> on{' '}
          <strong>{booking.date}</strong> at <strong>{booking.time}</strong>?
          <br />
          <br />
          This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            color: '#666',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.04)'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            boxShadow: '0 4px 12px rgba(245, 87, 108, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #e082ea 0%, #e4465b 100%)',
              boxShadow: '0 6px 16px rgba(245, 87, 108, 0.5)',
            }
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteConfirmDialog;
