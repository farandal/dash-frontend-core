import React, { Fragment, useEffect, useState } from 'react'

import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import * as Icon from 'react-feather';
import { 
  Grid, 
  Button, 
  Box, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Typography, 
  Paper, 
  Stack,
  Card,
  CardContent,
  CardActions,
  Divider,
  Alert,
  IconButton,
  Badge,
  LinearProgress,
  Skeleton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CategoryIcon from '@mui/icons-material/Category';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

import { useRecordContext } from 'react-admin';
import { useNavigate } from 'react-router';
import numeral from 'numeral';
import MarketplaceTags from '../Misc/MarketplaceTags';
import { Chip, Tooltip } from '@mui/material';
import { RichTextField } from 'react-admin';
import { Loading } from 'react-admin';
import { ImagePlaceHolder as ImagePlaceHolder } from 'kt-utils';
import { IGalleryImage } from '../../interfaces';
import MUISimpleJsonTable from '../MuiSimpleJsonTable';

const ProductView: React.FC<any> = ({ currency }) => {
  const product = useRecordContext();
  const [metadata, setMetadata] = useState([])
  const [isLoading, setIsLoading] = useState(true);
  const [expandedAccordions, setExpandedAccordions] = useState<string[]>(['basic-info']);
  const navigate = useNavigate()

  useEffect(() => {
    if (product) {
      const metadata = [];
      product?.metadata?.forEach((attribute: any) => {
        let added = false;
        metadata?.forEach(tab => {
          const name = tab[0]?.metadata_format_group;
          if (name == attribute?.metadata_format_group) {
            tab.push(attribute);
            added = true;
          }
        });
        if (!added) {
          metadata.push([attribute]);
        }
      });
      setMetadata(metadata);
      setIsLoading(false);
    }
    return function cleanup() {}
  }, [product])

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordions(prev => 
      isExpanded 
        ? [...prev, panel]
        : prev.filter(p => p !== panel)
    );
  };

  const toggleProductStatus = () => {
    // TODO: Implement toggle product status
    console.log('Toggle product status');
  };

  const getStockStatus = () => {
    if (product?.infinite_stock) {
      return { status: 'infinite', color: 'success', text: 'Stock Infinito' };
    }
    
    const totalStock = product?.stocks?.reduce((sum: number, stock: any) => sum + (stock.stock || 0), 0) || 0;
    
    if (totalStock === 0) {
      return { status: 'out', color: 'error', text: 'Sin Stock' };
    } else if (totalStock < 10) {
      return { status: 'low', color: 'warning', text: 'Stock Bajo' };
    } else {
      return { status: 'good', color: 'success', text: 'En Stock' };
    }
  };

  const getPrimaryPrice = () => {
    const primaryPrice = product?.prices?.find((price: any) => price.pricelist?.is_primary);
    if (primaryPrice) {
      const currencyFormat = currency.find((c: any) => c.id === primaryPrice.pricelist?.currency_id);
      return {
        price: primaryPrice.price,
        symbol: currencyFormat?.symbol || '$',
        format: currencyFormat?.format || '0,0.00'
      };
    }
    return null;
  };

  const stockStatus = getStockStatus();
  const primaryPrice = getPrimaryPrice();

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="60%" height={60} />
        <Skeleton variant="rectangular" width="100%" height={400} sx={{ mt: 2 }} />
      </Box>
    );
  }

  return product ? (
    <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
      {/* Header Section */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box flex={1}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Typography variant="h4" component="h1">
                  {product?.name}
                </Typography>
                <Chip 
                  icon={product?.is_enabled ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  label={product?.is_enabled ? 'Activo' : 'Inactivo'}
                  color={product?.is_enabled ? 'success' : 'error'}
                  variant="filled"
                />
                {product?.is_pack && (
                  <Chip 
                    icon={<InventoryIcon />}
                    label="Pack"
                    color="info"
                    variant="filled"
                  />
                )}
              </Stack>
              
              <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">SKU</Typography>
                  <Typography variant="h6" fontFamily="monospace">{product?.sku}</Typography>
                </Box>
                
                {primaryPrice && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Precio Principal</Typography>
                    <Typography variant="h5" color="primary.main" fontWeight="bold">
                      {primaryPrice.symbol}{numeral(primaryPrice.price).format(primaryPrice.format)}
                    </Typography>
                  </Box>
                )}
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Estado de Stock</Typography>
                  <Chip 
                    label={stockStatus.text}
                    color={stockStatus.color as any}
                    size="small"
                  />
                </Box>
              </Stack>

              {/* Categories Display */}
              {product?.categories && product.categories.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Categorías ({product.categories.length})
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {product.categories.map((category: any, index: number) => (
                      <Chip
                        key={category.id}
                        icon={<CategoryIcon />}
                        label={category.breadcrumbed_name || category.name}
                        color={category.is_primary ? "primary" : "default"}
                        variant={category.is_primary ? "filled" : "outlined"}
                        size="small"
                        sx={{ 
                          mb: 1,
                          fontWeight: category.is_primary ? 'bold' : 'normal'
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>

            {/* Action Buttons */}
            <Stack direction="column" spacing={1} alignItems="flex-end">
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<EditIcon />}
                onClick={() => navigate(`/ecommerce/product/${product?.id}`)}
              >
                Editar
              </Button>
              <Button 
                variant="outlined" 
                color={product?.is_enabled ? "error" : "success"}
                startIcon={product?.is_enabled ? <VisibilityOffIcon /> : <VisibilityIcon />}
                onClick={toggleProductStatus}
              >
                {product?.is_enabled ? 'Desactivar' : 'Activar'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Left Column - Gallery and Brand */}
        {/* @ts-ignore */}
        <Grid item xs={12} md={5}>
          {/* Gallery Section */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent sx={{ p: 0 }}>
              {(product?.gallery?.images && product.gallery.images.length) ? (
                <>
                  <Box sx={{ position: 'relative' }}>
                    <ImageList sx={{ width: '100%', height: 'auto', maxHeight: '400px' }} cols={1} rowHeight="auto" gap={0}>
                      {product?.gallery?.images?.map((item: IGalleryImage) => {
                        const featured = product?.gallery?.primary_image_id === item.id;
                        return (
                          <ImageListItem key={item.id}>
                            <ImagePlaceHolder
                              placeHolder={<>N/A</>}
                              src={item.url}
                              style={{ width: '100%', height: '300px', objectFit: 'contain' }}
                              alt={item.title}
                            />
                            {featured && (
                              <>
                                <Button 
                                  variant="contained" 
                                  size="small"
                                  startIcon={<PhotoLibraryIcon />}
                                  sx={{ 
                                    position: 'absolute', 
                                    bottom: 60, 
                                    left: '50%', 
                                    transform: 'translateX(-50%)',
                                    backdropFilter: 'blur(4px)'
                                  }} 
                                  onClick={() => navigate(`/gallery/${product.gallery.id}`)}
                                >
                                  Editar Galería
                                </Button>
                                <ImageListItemBar 
                                  title="Imagen Principal" 
                                  sx={{ 
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)'
                                  }}
                                />
                              </>
                            )}
                          </ImageListItem>
                        )
                      })}
                    </ImageList>
                  </Box>
                  
                  {/* Gallery Thumbnails */}
                  {product.gallery.images.length > 1 && (
                    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Imágenes ({product.gallery.images.length})
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ overflowX: 'auto' }}>
                        {product.gallery.images.map((item: IGalleryImage, index: number) => (
                          <Box
                            key={item.id}
                            sx={{
                              minWidth: 60,
                              height: 60,
                              border: product.gallery.primary_image_id === item.id ? 2 : 1,
                              borderColor: product.gallery.primary_image_id === item.id ? 'primary.main' : 'divider',
                              borderRadius: 1,
                              overflow: 'hidden',
                              position: 'relative'
                            }}
                          >
                            <ImagePlaceHolder
                                    src={item.url}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    alt={`Thumbnail ${index + 1}`}    
                                                            />
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                  <PhotoLibraryIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="body1">Sin imágenes</Typography>
                
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Resumen Rápido</Typography>
              <Grid container spacing={2}>
                 {/* @ts-ignore */}
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {product?.prices?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Listas de Precios
                    </Typography>
                  </Box>
                </Grid>
                 {/* @ts-ignore */}
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="secondary">
                      {product?.stocks?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tipos de Stock
                    </Typography>
                  </Box>
                </Grid>
                 {/* @ts-ignore */}
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main">
                      {product?.campaignMarketplaces?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Plataformas
                    </Typography>
                  </Box>
                </Grid>
                 {/* @ts-ignore */}
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {product?.categories?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Categorías
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Details */}
         {/* @ts-ignore */}
        <Grid item xs={12} md={7}>
          <Stack spacing={2}>
            {/* Basic Information */}





            {/* Basic Information */}
            <Accordion 
              expanded={expandedAccordions.includes('basic-info')}
              onChange={handleAccordionChange('basic-info')}
              elevation={2}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Icon.Info size={20} />
                  <Typography variant="h6">Información Básica</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      SKU
                    </Typography>
                    <Typography 
                      variant="body1" 
                      fontFamily="monospace" 
                      sx={{ 
                        p: 1, 
                    
                        borderRadius: 1,
                        border: 1,
                       
                      }}
                    >
                      {product?.sku}
                    </Typography>
                  </Box>
                  
                  {product?.description && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Descripción
                      </Typography>
                      <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        {product.description}
                      </Typography>
                    </Box>
                  )}

                  {product?.keywords && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Palabras Clave
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {product.keywords.split(',').map((keyword: string, index: number) => (
                          <Chip 
                            key={index}
                            label={keyword.trim()} 
                            size="small" 
                            variant="outlined"
                            icon={<LocalOfferIcon />}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Brand Information */}
                  {product?.brand && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Marca
                      </Typography>
                      <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        {product.brand.image_url && (
                          <ImagePlaceHolder
                            src={product.brand.image_url}
                            style={{ width: 40, height: 40, objectFit: 'contain' }}
                            alt={product.brand.name}
                          />
                        )}
                        <Typography variant="body1" fontWeight="medium">
                          {product.brand.name}
                        </Typography>
                      </Paper>
                    </Box>
                  )}

                  {/* Categories with enhanced display */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Categorías ({product?.categories?.length || 0})
                    </Typography>
                    {product?.categories && product.categories.length > 0 ? (
                      <Stack spacing={1}>
                        {product.categories
                          .sort((a: any, b: any) => {
                            // Sort by primary first, then by display_order
                            if (a.is_primary && !b.is_primary) return -1;
                            if (!a.is_primary && b.is_primary) return 1;
                            return (a.display_order || 0) - (b.display_order || 0);
                          })
                          .map((category: any, index: number) => (
                            <Paper 
                              key={category.id} 
                              elevation={1} 
                              sx={{ 
                                p: 2, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2,
                                border: category.is_primary ? 2 : 1,
                                borderColor: category.is_primary ? 'primary.main' : 'divider'
                              }}
                            >
                              <CategoryIcon 
                                color={category.is_primary ? "primary" : "action"} 
                              />
                              <Box flex={1}>
                                <Typography 
                                  variant="body1" 
                                  fontWeight={category.is_primary ? "bold" : "normal"}
                                >
                                  {category.breadcrumbed_name || category.name}
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                  {category.is_primary && (
                                    <Chip 
                                      label="Principal" 
                                      size="small" 
                                      color="primary" 
                                      variant="filled"
                                    />
                                  )}
                                  <Chip 
                                    label={`Orden: ${category.display_order || 0}`} 
                                    size="small" 
                                    variant="outlined"
                                  />
                                </Stack>
                              </Box>
                            </Paper>
                          ))}
                      </Stack>
                    ) : (
                      <Alert severity="warning">
                        Este producto no tiene categorías asignadas
                      </Alert>
                    )}
                  </Box>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Prices */}
            <Accordion 
              expanded={expandedAccordions.includes('prices')}
              onChange={handleAccordionChange('prices')}
              elevation={2}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Icon.DollarSign size={20} />
                  <Typography variant="h6">Precios</Typography>
                  <Badge badgeContent={product?.prices?.length || 0} color="primary">
                    <Box />
                  </Badge>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                {product?.prices && product.prices.length > 0 ? (
                  <Grid container spacing={2}>
                    {product.prices
                      .sort((a: any, b: any) => {
                        // Sort by primary first
                        if (a.pricelist?.is_primary && !b.pricelist?.is_primary) return -1;
                        if (!a.pricelist?.is_primary && b.pricelist?.is_primary) return 1;
                        return 0;
                      })
                      .map((item: any, key: number) => {
                        const currencyFormat = currency.find((currency: any) => currency.id == item.pricelist?.currency_id);
                        return (
                             /* @ts-ignore */
                          <Grid item xs={12} sm={6} md={4} key={key}>
                            <Paper 
                              elevation={item.pricelist?.is_primary ? 3 : 1} 
                              sx={{ 
                                p: 2, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2,
                                border: item.pricelist?.is_primary ? 2 : 0,
                                borderColor: 'primary.main',
                                position: 'relative'
                              }}
                            >
                              {item.pricelist?.is_primary ? 
                                <Icon.Star size={24} color="#C51162" fill="#C51162" /> : 
                                <Icon.DollarSign size={24} color="#2196F3" />
                              }
                              <Box flex={1}>
                                <Typography variant="h6" fontWeight="bold">
                                  {currencyFormat?.symbol}{numeral(item?.price || 0).format(currencyFormat?.format || '0,0.00')}
                                </Typography>
                                <Typography 
                                  color={item.pricelist?.is_primary ? "primary" : "text.secondary"}
                                  variant="body2"
                                >
                                  {item.pricelist?.name}
                                </Typography>
                              </Box>
                              {item.pricelist?.is_primary && (
                                <Chip 
                                  label="Principal" 
                                  size="small" 
                                  color="primary" 
                                  sx={{ position: 'absolute', top: 8, right: 8 }}
                                />
                              )}
                            </Paper>
                          </Grid>
                        )
                      })}
                  </Grid>
                ) : (
                  <Alert severity="warning">
                    Este producto no tiene precios configurados
                  </Alert>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Stock */}
            <Accordion 
              expanded={expandedAccordions.includes('stock')}
              onChange={handleAccordionChange('stock')}
              elevation={2}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Icon.Package size={20} />
                  <Typography variant="h6">Stock</Typography>
                  <Chip 
                    label={stockStatus.text}
                    color={stockStatus.color as any}
                    size="small"
                  />
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                {product?.infinite_stock ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body1">
                      Este producto tiene <strong>stock infinito</strong> habilitado
                    </Typography>
                  </Alert>
                ) : null}
                
                {product?.stocks && product.stocks.length > 0 ? (
                  <Grid container spacing={2}>
                    {product.stocks
                      .sort((a: any, b: any) => {
                        // Sort by primary first
                        if (a.stockType?.is_primary && !b.stockType?.is_primary) return -1;
                        if (!a.stockType?.is_primary && b.stockType?.is_primary) return 1;
                        return 0;
                      })
                      .map((item: any, key: number) => {
                        const stockLevel = item.stock || 0;
                        const maxStock = 100; // You might want to make this configurable
                        const stockPercentage = Math.min((stockLevel / maxStock) * 100, 100);
                        
                        return (
                              /* @ts-ignore */
                          <Grid item xs={12} sm={6} key={key}>
                            <Paper 
                              elevation={item.stockType?.is_primary ? 3 : 1}
                              sx={{ 
                                p: 2,
                                border: item.stockType?.is_primary ? 2 : 0,
                                borderColor: 'secondary.main'
                              }}
                            >
                              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                                {item.stockType?.is_primary ? 
                                  <Icon.Package size={24} color="#FF9800" /> : 
                                  <Icon.Archive size={24} color="#FF9800" />
                                }
                                <Box flex={1}>
                                  <Typography variant="h5" fontWeight="bold">
                                    {stockLevel}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {item.stockType?.name}
                                  </Typography>
                                </Box>
                                {item.stockType?.is_primary && (
                                  <Chip 
                                    label="Principal" 
                                    size="small" 
                                    color="secondary"
                                  />
                                )}
                              </Stack>
                              
                              {!product?.infinite_stock && (
                                <Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={stockPercentage}
                                    color={stockLevel > 20 ? "success" : stockLevel > 5 ? "warning" : "error"}
                                    sx={{ height: 8, borderRadius: 4 }}
                                  />
                                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Nivel de stock: {stockPercentage.toFixed(0)}%
                                  </Typography>
                                </Box>
                              )}
                            </Paper>
                          </Grid>
                        )
                      })}
                  </Grid>
                ) : (
                  <Alert severity="warning">
                    Este producto no tiene tipos de stock configurados
                  </Alert>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Marketplaces */}
            <Accordion 
              expanded={expandedAccordions.includes('marketplaces')}
              onChange={handleAccordionChange('marketplaces')}
              elevation={2}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Icon.Globe size={20} />
                  <Typography variant="h6">Plataformas Activas</Typography>
                  <Badge badgeContent={product?.campaignMarketplaces?.length || 0} color="primary">
                    <Box />
                  </Badge>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                {product?.campaignMarketplaces?.length ? (
                  <MarketplaceTags marketplaces={product.campaignMarketplaces.map((cmp: any) => cmp.marketplace)} />
                ) : (
                  <Alert severity="info">
                    <Typography variant="body1">
                      Este producto no está activo en ninguna plataforma
                    </Typography>
                  </Alert>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Modifier Groups */}
            {product?.modifier_groups && product.modifier_groups.length > 0 && (
              <Accordion 
                expanded={expandedAccordions.includes('modifiers')}
                onChange={handleAccordionChange('modifiers')}
                elevation={2}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Icon.Settings size={20} />
                    <Typography variant="h6">Grupos de Modificadores</Typography>
                    <Badge badgeContent={product.modifier_groups.length} color="primary">
                      <Box />
                    </Badge>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {product.modifier_groups.map((group: any, index: number) => (
                      <Paper key={group.id} elevation={1} sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {group.name}
                        </Typography>
                        {group.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {group.description}
                          </Typography>
                        )}
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip 
                            label={`Tipo: ${group.type}`} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            label={group.is_required ? "Requerido" : "Opcional"} 
                            size="small" 
                            color={group.is_required ? "error" : "default"}
                            variant="outlined"
                          />
                          {group.min_selections > 0 && (
                            <Chip 
                              label={`Min: ${group.min_selections}`} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                          {group.max_selections > 0 && (
                            <Chip 
                              label={`Max: ${group.max_selections}`} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Stack>
                        
                        {/* Modifier Options */}
                        {group.modifier_options && group.modifier_options.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                              Opciones ({group.modifier_options.length})
                            </Typography>
                            <Grid container spacing={1}>
                              {group.modifier_options.map((option: any) => (
                                  /* @ts-ignore */
                                <Grid item xs={12} sm={6} key={option.id}>
                                  <Paper 
                                    variant="outlined" 
                                    sx={{ 
                                      p: 1.5, 
                                      display: 'flex', 
                                      justifyContent: 'space-between',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <Box>
                                      <Typography variant="body2" fontWeight="medium">
                                        {option.name}
                                      </Typography>
                                      {option.description && (
                                        <Typography variant="caption" color="text.secondary">
                                          {option.description}
                                        </Typography>
                                      )}
                                    </Box>
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                      {option.price_adjustment !== 0 && (
                                        <Chip 
                                          label={`${option.price_adjustment > 0 ? '+' : ''}${option.price_adjustment}`}
                                          size="small"
                                          color={option.price_adjustment > 0 ? "success" : "error"}
                                          variant="outlined"
                                        />
                                      )}
                                      {option.is_default && (
                                        <Chip 
                                          label="Por defecto"
                                          size="small"
                                          color="primary"
                                          variant="filled"
                                        />
                                      )}
                                    </Stack>
                                  </Paper>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Product Metadata/Characteristics */}
            {metadata && metadata.length > 0 && (
              <Accordion 
                expanded={expandedAccordions.includes('metadata')}
                onChange={handleAccordionChange('metadata')}
                elevation={2}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Icon.List size={20} />
                    <Typography variant="h6">Características del Producto</Typography>
                    <Badge badgeContent={metadata.length} color="primary">
                      <Box />
                    </Badge>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {metadata.map((group: any, key: number) => (
                      <Paper elevation={1} sx={{ p: 2 }} key={key}>
                        {group.length > 0 && (
                          <>
                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Icon.Tag size={18} />
                              {group[0]?.metadataFormat?.group || "Metadata"}
                            </Typography>
                            <MUISimpleJsonTable
                              tableData={group}
                              vertical={false}
                              ignore={['id', 'created_at', 'updated_at', 'deleted_at']}
                            />
                          </>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Product Pack Information */}
            {product?.is_pack && product?.products && product.products.length > 0 && (
              <Accordion 
                expanded={expandedAccordions.includes('pack-contents')}
                onChange={handleAccordionChange('pack-contents')}
                elevation={2}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Icon.Package size={20} />
                    <Typography variant="h6">Contenido del Pack</Typography>
                    <Badge badgeContent={product.products.length} color="primary">
                      <Box />
                    </Badge>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {product.products.map((packProduct: any, index: number) => (
                      <Paper 
                        key={packProduct.id} 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'grey.50' }
                        }}
                        onClick={() => navigate(`/ecommerce/product/${packProduct.id}/show`)}
                      >
                        {packProduct.primary_image && (
                          <ImagePlaceHolder
                            src={packProduct.primary_image}
                            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                            alt={packProduct.name}
                          />
                        )}
                        <Box flex={1}>
                          <Typography variant="body1" fontWeight="medium">
                            {packProduct.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            SKU: {packProduct.sku}
                          </Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="h6" color="primary">
                            {packProduct.quantity || 1}x
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Cantidad
                          </Typography>
                        </Box>
                        <IconButton size="small">
                          <Icon.ExternalLink size={16} />
                        </IconButton>
                      </Paper>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Product URLs */}
            {product?.urls && product.urls.length > 0 && (
              <Accordion 
                expanded={expandedAccordions.includes('urls')}
                onChange={handleAccordionChange('urls')}
                elevation={2}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Icon.Link size={20} />
                    <Typography variant="h6">URLs del Producto</Typography>
                    <Badge badgeContent={product.urls.length} color="primary">
                      <Box />
                    </Badge>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={1}>
                    {product.urls.map((url: any, index: number) => (
                      <Paper 
                        key={index} 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2 
                        }}
                      >
                        <Icon.ExternalLink size={20} color="#2196F3" />
                        <Box flex={1}>
                          <Typography variant="body2" color="text.secondary">
                            {url.platform || 'URL'}
                          </Typography>
                          <Typography 
                            variant="body1" 
                            component="a" 
                            href={url.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            sx={{ 
                              color: 'primary.main', 
                              textDecoration: 'none',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                          >
                            {url.url}
                          </Typography>
                        </Box>
                        <IconButton 
                          size="small" 
                          onClick={() => window.open(url.url, '_blank')}
                        >
                          <Icon.ExternalLink size={16} />
                        </IconButton>
                      </Paper>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* Floating Action Button for Quick Edit */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
      >
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/ecommerce/product/${product?.id}`)}
          sx={{
            borderRadius: '50px',
            px: 3,
            py: 1.5,
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6
            }
          }}
        >
          Editar Producto
        </Button>
      </Box>
    </Box>
  ) : <Loading />
}

export default ProductView
