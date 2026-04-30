import { useEffect, useState } from 'react';
import { TextField, IconButton, Card, Portal, ToggleButton, ToggleButtonGroup, Typography, Box } from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown, TableRestaurant, Storefront } from '@mui/icons-material';
import DASHModal from 'dash-modal';
import { dashStorage } from 'dash-utils';
import { useTranslate } from 'react-admin';

interface CustomEventData {
  onConfirm?: () => void;
  confirmText?: string;
  onCancel?: () => void;
  cancelText?: string;
}

type DeliveryMethod = 'TABLE' | 'COUNTER';

const MallAppMediator = () => {
    const translate = useTranslate();
    const [open, setOpen] = useState(false);
    const [tableNumber, setTableNumber] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('TABLE');
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

    const handleDeliveryMethodChange = (
      _event: React.MouseEvent<HTMLElement>,
      newMethod: DeliveryMethod | null
    ) => {
      if (newMethod !== null) {
        setDeliveryMethod(newMethod);
        // Clear table number when switching to counter
        if (newMethod === 'COUNTER') {
          setTableNumber('');
        }
      }
    };

    const handleSubmit = () => {
      const name = (document.getElementById('customerName') as HTMLInputElement).value;
      
      // Note: dashStorage.setItem already handles JSON.stringify internally
      dashStorage.setItem('orderData', {
        name,
        tableNumber: deliveryMethod === 'TABLE' ? tableNumber : null,
        deliveryMethod
      });

      console.log('[MallAppMediator] Saved orderData:', {
        name,
        tableNumber: deliveryMethod === 'TABLE' ? tableNumber : null,
        deliveryMethod
      });
    
      handleClose();
      
      // Dispatch event to notify that order data has been saved
      // This allows components like MallOrderSummaryDrawer to retry form submission
      window.dispatchEvent(new CustomEvent('order-data-saved'));
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
          title={translate('mall.mediator.title', { _: 'Complete your order' })}
          confirmText={customConfirmText || translate('mall.mediator.continue_button', { _: 'Continue' })}
          cancelText={customCancelText || translate('common.cancel', { _: 'Cancel' })}
          className="kt-mall-client-tab-modal kt-mall-compact-modal"
        >
          <div className="kt-mall-client-tab-modal-content" style={{ padding: '4px 0' }}>
            <TextField
              autoFocus
              margin="none"
              size="small"
              id="customerName"
              label={translate('mall.mediator.name_label', { _: 'Your Name' })}
              type="text"
              fullWidth
              variant="outlined"
              className="kt-mall-client-tab-customer-name-field"
            />
            
            {/* Delivery Method Toggle */}
            <Box sx={{ my: 1, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'var(--dash-text-secondary, #666)', display: 'block', mb: 0.5 }}>
                {translate('mall.mediator.delivery_method_label', { _: 'How would you like to receive your order?' })}
              </Typography>
              <ToggleButtonGroup
                value={deliveryMethod}
                exclusive
                onChange={handleDeliveryMethodChange}
                aria-label="delivery method"
                size="small"
                sx={{ 
                  width: '100%',
                  '& .MuiToggleButton-root': {
                    flex: 1,
                    py: 0.75,
                    fontSize: '0.8rem',
                  }
                }}
              >
                <ToggleButton value="TABLE" aria-label="table service">
                  <TableRestaurant sx={{ mr: 0.5, fontSize: '1rem' }} />
                  {translate('mall.mediator.table_service', { _: 'At my table' })}
                </ToggleButton>
                <ToggleButton value="COUNTER" aria-label="counter pickup">
                  <Storefront sx={{ mr: 0.5, fontSize: '1rem' }} />
                  {translate('mall.mediator.counter_pickup', { _: 'Counter pickup' })}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Table Number - Only shown for TABLE service */}
            {deliveryMethod === 'TABLE' && (
              <Card
                elevation={2}
                className="kt-mall-client-tab-table-card"
                sx={{ mt: 0.5, p: 1 }}
              >
                <TextField
                  id="tableNumber"
                  label={translate('mall.mediator.table_label', { _: 'Table Number' })}
                  type="number"
                  variant="outlined"
                  size="small"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="kt-mall-client-tab-table-number-field"
                  inputProps={{
                    className: "kt-mall-client-tab-table-number-input"
                  }}
                />
                <IconButton
                  onClick={handleIncrement}
                  size="small"
                  className="kt-mall-client-tab-table-inc-btn"
                >
                  <KeyboardArrowUp fontSize="medium" />
                </IconButton>
                <IconButton
                  onClick={handleDecrement}
                  size="small"
                  className="kt-mall-client-tab-table-dec-btn"
                >
                  <KeyboardArrowDown fontSize="medium" />
                </IconButton>
              </Card>
            )}

            {/* Counter pickup info */}
            {deliveryMethod === 'COUNTER' && (
              <Box sx={{ 
                p: 1.5, 
                mt: 0.5,
                backgroundColor: 'var(--dash-bg-tertiary, #f5f5f5)', 
                borderRadius: 1,
                textAlign: 'center' 
              }}>
                <Storefront sx={{ fontSize: 28, color: 'var(--dash-primary, #1976d2)', mb: 0.5 }} />
                <Typography variant="caption" sx={{ color: 'var(--dash-text-secondary, #666)', display: 'block', lineHeight: 1.3 }}>
                  {translate('mall.mediator.counter_info', { _: 'Your order will be ready for pickup at the counter. We\'ll notify you when it\'s ready.' })}
                </Typography>
              </Box>
            )}
          </div>
        </DASHModal>
      </Portal>
      </>
    );
};


export default MallAppMediator;