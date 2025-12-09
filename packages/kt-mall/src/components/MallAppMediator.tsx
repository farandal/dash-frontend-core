import { useEffect, useState } from 'react';
import { TextField, IconButton, InputAdornment, Card, Box, Portal } from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import DASHModal from 'dash-modal';
import { dashStorage } from 'dash-utils';

interface CustomEventData {
  onConfirm?: () => void;
  confirmText?: string;
  onCancel?: () => void;
  cancelText?: string;
}

const MallAppMediator = () => {
    const [open, setOpen] = useState(false);
    const [tableNumber, setTableNumber] = useState('');
    const [customOnConfirm, setCustomOnConfirm] = useState<(() => void) | undefined>();
    const [customConfirmText, setCustomConfirmText] = useState<string | undefined>();
    const [customOnCancel, setCustomOnCancel] = useState<(() => void) | undefined>();
    const [customCancelText, setCustomCancelText] = useState<string | undefined>();
    
    const handleOpenDialog = () => {
        console.log("OPENING DIALOG")
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
      setCustomOnConfirm(undefined);
      setCustomConfirmText(undefined);
      setCustomOnCancel(undefined);
      setCustomCancelText(undefined);
    };

    const handleIncrement = () => {
      setTableNumber(prev => prev ? String(Number(prev) + 1) : '1');
    };

    const handleDecrement = () => {
      setTableNumber(prev => prev && Number(prev) > 0 ? String(Number(prev) - 1) : '0');
    };

    const handleSubmit = () => {
      const name = (document.getElementById('customerName') as HTMLInputElement).value;
      
      dashStorage.setItem('orderData', JSON.stringify({
        name,
        tableNumber
      }));
    
      handleClose();
    };

     const handleEnterPublicOrderData = (event: CustomEvent<CustomEventData>) => {
        // Always set a new function reference to force re-render
        if (event.detail?.onConfirm) {
          setCustomOnConfirm(() => () => event.detail.onConfirm && event.detail.onConfirm());
        } else {
          setCustomOnConfirm(undefined);
        }
        if (event.detail?.confirmText) {
          setCustomConfirmText(event.detail.confirmText);
        } else {
          setCustomConfirmText(undefined);
        }
        if (event.detail?.onCancel) {
          setCustomOnCancel(() => () => event.detail.onCancel && event.detail.onCancel());
        } else {
          setCustomOnCancel(undefined);
        }
        if (event.detail?.cancelText) {
          setCustomCancelText(event.detail.cancelText);
        } else {
          setCustomCancelText(undefined);
        }
        // Always close before open to allow repeated opening
        setOpen(false);
        setTimeout(() => {
          setOpen(true);
        }, 0);
      };


    useEffect(() => {
      window.addEventListener('enter-public-order-data', handleEnterPublicOrderData as EventListener);

      return () => {
        window.removeEventListener('enter-public-order-data', handleEnterPublicOrderData as EventListener);
      };
    }, []);

    return (
      <Portal>
        <DASHModal 
          sx={{ zIndex: 100000 }} // Ensure modal is on top
          variant='info'
          open={open}
          onCancel={() => {
            handleClose();
            customOnCancel && customOnCancel();
          }}
          onConfirm={() => {
            handleSubmit();
            customOnConfirm && customOnConfirm();
          }}
          title="Ingresa tus datos antes de continuar!"
          confirmText={customConfirmText || "Guardar Datos"}
          cancelText={customCancelText || "Cancelar"}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            textAlign: 'left'
          }}>
            <TextField
              autoFocus
              margin="dense"
              id="customerName"
              label="Nombre"
              type="text"
              fullWidth
              variant="outlined"
            />
            <Card
              sx={{
                position: 'relative',
                width: '100%',
                height: 180,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 2,
                mb: 2,
                mx: 'auto',
                boxSizing: 'border-box'
              }}
              elevation={4}
            >
              <TextField
                id="tableNumber"
                label="Mesa"
                type="number"
                variant="outlined"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                inputProps={{
                  style: {
                    height: '120px',
                    fontSize: '64px',
                    textAlign: 'center',
                    padding: 0,
                    // Hide native number input spinners
                    MozAppearance: 'textfield',
                  }
                }}
                sx={{
                  width: '100%',
                  '& .MuiInputBase-root': {
                    height: '120px',
                    fontSize: '64px',
                    textAlign: 'center',
                  },
                  '& input': {
                    textAlign: 'center',
                    // Hide native number input spinners for Chrome, Safari, Edge
                    '&::-webkit-outer-spin-button': {
                      WebkitAppearance: 'none',
                      margin: 0,
                    },
                    '&::-webkit-inner-spin-button': {
                      WebkitAppearance: 'none',
                      margin: 0,
                    },
                    // Hide for Firefox
                    MozAppearance: 'textfield',
                  }
                }}
              />
              <IconButton
                onClick={handleIncrement}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 2,
                  background: 'white',
                  boxShadow: 1,
                }}
                size="large"
              >
                <KeyboardArrowUp fontSize="large" />
              </IconButton>
              <IconButton
                onClick={handleDecrement}
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  zIndex: 2,
                  background: 'white',
                  boxShadow: 1,
                }}
                size="large"
              >
                <KeyboardArrowDown fontSize="large" />
              </IconButton>
            </Card>
          </div>
        </DASHModal>
     
       {/* <Card>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              id="customerName"
              label="Nombre"
              type="text"
              variant="outlined"
              size="small"
              sx={{ flex: 2 }}
            />
            <TextField
              id="tableNumber"
              label="Mesa"
              type="number"
              variant="outlined"
              size="small"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              sx={{ flex: 1 }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleIncrement}>
                        <KeyboardArrowUp />
                      </IconButton>
                      <IconButton size="small" onClick={handleDecrement}>
                        <KeyboardArrowDown />
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
            />
          </Box>
        </Card>*/}
      </Portal>
    );
};


export default MallAppMediator;