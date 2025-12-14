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
        <>
      <Portal>
        <DASHModal
          // Modal z-index and style handled in LESS
          variant="info"
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
          className="kt-mall-client-tab-modal"
        >
          <div className="kt-mall-client-tab-modal-content">
            <TextField
              autoFocus
              margin="dense"
              id="customerName"
              label="Nombre"
              type="text"
              fullWidth
              variant="outlined"
              className="kt-mall-client-tab-customer-name-field"
            />
            <Card
              elevation={4}
              className="kt-mall-client-tab-table-card"
            >
              <TextField
                id="tableNumber"
                label="Mesa"
                type="number"
                variant="outlined"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="kt-mall-client-tab-table-number-field"
                inputProps={{
                  className: "kt-mall-client-tab-table-number-input"
                }}
              />
              <IconButton
                onClick={handleIncrement}
                size="large"
                className="kt-mall-client-tab-table-inc-btn"
              >
                <KeyboardArrowUp fontSize="large" />
              </IconButton>
              <IconButton
                onClick={handleDecrement}
                size="large"
                className="kt-mall-client-tab-table-dec-btn"
              >
                <KeyboardArrowDown fontSize="large" />
              </IconButton>
            </Card>
          </div>
        </DASHModal>
      </Portal>
      </>
    );
};


export default MallAppMediator;