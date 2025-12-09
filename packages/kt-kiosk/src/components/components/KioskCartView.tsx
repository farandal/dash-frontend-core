import React from 'react';
import { useTranslate } from 'react-admin';
import {
    Box,
    Paper,
    Typography,
    Button,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useKiosk } from '../contexts/KioskContext';

export const KioskCartView: React.FC = () => {
    const translate = useTranslate();
    const {
        cartItems,
        cartTotal,
        removeFromCart,
        updateQuantity,
        clearCart,
        setCurrentView,
        deliveryMethod,
        setDeliveryMethod,
        tableNumber,
        setTableNumber,
        customerName,
        setCustomerName,
        orderNote,
        setOrderNote,
        submitOrder,
        isSubmitting,
        formatPrice,
        session,
    } = useKiosk();

    const handleSubmit = async () => {
        await submitOrder();
    };

    const handleCancelOrder = () => {
        clearCart();
        setCurrentView('menu');
    };

    const getModifiersSummary = (item: typeof cartItems[0]) => {
        const modifiers: string[] = [];
        item.product.modifiers?.forEach((group) => {
            const selected = item.selectedModifiers[group.id] || [];
            selected.forEach((optId) => {
                const option = group.options.find((o) => o.id === optId);
                if (option) {
                    modifiers.push(option.name);
                }
            });
        });
        return modifiers.join(', ');
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Paper
                elevation={0}
                sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <IconButton onClick={() => setCurrentView('menu')}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {translate('kiosk.your_order')}
                </Typography>
            </Paper>

            {/* Cart Items */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                {cartItems.length === 0 ? (
                    <Box
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'text.secondary',
                        }}
                    >
                        <Typography variant="h4" sx={{ mb: 2, opacity: 0.3 }}>
                            🛒
                        </Typography>
                        <Typography variant="h6">{translate('kiosk.cart_empty')}</Typography>
                        <Button
                            variant="outlined"
                            onClick={() => setCurrentView('menu')}
                            sx={{ mt: 2 }}
                        >
                            {translate('kiosk.browse_menu')}
                        </Button>
                    </Box>
                ) : (
                    <>
                        {/* Items List */}
                        <List disablePadding>
                            {cartItems.map((item, index) => (
                                <React.Fragment key={item.uniqueId}>
                                    <ListItem
                                        sx={{
                                            py: 2,
                                            px: 0,
                                        }}
                                    >
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                {item.product.name}
                                            </Typography>
                                            {getModifiersSummary(item) && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ mt: 0.5 }}
                                                >
                                                    {getModifiersSummary(item)}
                                                </Typography>
                                            )}
                                            {item.note && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ fontStyle: 'italic', mt: 0.5 }}
                                                >
                                                    {translate('kiosk.note')}: {item.note}
                                                </Typography>
                                            )}
                                            <Typography
                                                variant="subtitle2"
                                                color="primary"
                                                sx={{ mt: 0.5 }}
                                            >
                                                {formatPrice(item.totalPrice)}
                                            </Typography>
                                        </Box>

                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                            }}
                                        >
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    updateQuantity(item.uniqueId, item.quantity - 1)
                                                }
                                            >
                                                <RemoveIcon fontSize="small" />
                                            </IconButton>
                                            <Typography
                                                sx={{
                                                    minWidth: 24,
                                                    textAlign: 'center',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {item.quantity}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    updateQuantity(item.uniqueId, item.quantity + 1)
                                                }
                                            >
                                                <AddIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => removeFromCart(item.uniqueId)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </ListItem>
                                    {index < cartItems.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>

                        <Divider sx={{ my: 2 }} />

                        {/* Order Options */}
                        <Card variant="outlined" sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {translate('kiosk.order_options')}
                                </Typography>

                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>{translate('kiosk.delivery_method')}</InputLabel>
                                    <Select
                                        value={deliveryMethod}
                                        label={translate('kiosk.delivery_method')}
                                        onChange={(e) =>
                                            setDeliveryMethod(
                                                e.target.value as 'counter' | 'table' | 'delivery'
                                            )
                                        }
                                    >
                                        {session?.delivery_methods?.map((method) => (
                                            <MenuItem key={method.id} value={method.id}>
                                                {method.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {deliveryMethod === 'table' && (
                                    <TextField
                                        fullWidth
                                        label={translate('kiosk.table_number')}
                                        value={tableNumber}
                                        onChange={(e) => setTableNumber(e.target.value)}
                                        sx={{ mb: 2 }}
                                    />
                                )}

                                <TextField
                                    fullWidth
                                    label={translate('kiosk.your_name')}
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    fullWidth
                                    label={translate('kiosk.special_instructions')}
                                    value={orderNote}
                                    onChange={(e) => setOrderNote(e.target.value)}
                                    multiline
                                    rows={2}
                                />
                            </CardContent>
                        </Card>

                        {/* Total */}
                        <Card
                            sx={{
                                backgroundColor: 'grey.100',
                                mb: 2,
                            }}
                        >
                            <CardContent>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography variant="h6">{translate('kiosk.total')}</Typography>
                                    <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                                        {formatPrice(cartTotal)}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </>
                )}
            </Box>

            {/* Footer Actions */}
            {cartItems.length > 0 && (
                <Paper
                    elevation={8}
                    sx={{
                        p: 2,
                        borderTop: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleCancelOrder}
                            startIcon={<CancelIcon />}
                            color="error"
                            sx={{
                                py: 2,
                                fontSize: '1rem',
                                fontWeight: 600,
                                borderRadius: 2,
                                minWidth: 160,
                            }}
                        >
                            {translate('kiosk.cancel_order')}
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            startIcon={<CheckCircleIcon />}
                            sx={{
                                py: 2,
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                borderRadius: 2,
                            }}
                        >
                            {isSubmitting ? translate('kiosk.submitting') : `${translate('kiosk.confirm_order')} — ${formatPrice(cartTotal)}`}
                        </Button>
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default KioskCartView;
