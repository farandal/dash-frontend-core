import { IDashAutoAdminDataGrid } from "dash-auto-admin";
import { IStore } from "../interfaces/IStore";
import {
    Box,
    Card,
    CardContent,
    Avatar,
    Typography,
    Button
} from "@mui/material";
import React from "react";
import { RaRecord, WithListContext, useRedirect } from "react-admin";
import { Store } from "@mui/icons-material";
import DashResourceButton from "dash-auto-admin/toolbar/buttons/DashResourceButton";

const StoresList: React.FC<IDashAutoAdminDataGrid> = ({ resourceConfig }) => {

    const redirect = useRedirect();

    // @deprecated - removed currentAppPath logic that caused path duplication
    const redirectFn = (link) => {
        let _redirect =  link.startsWith('/')
                    ? link
                    : `/${link}`.replace(/\/+/g, '/');
        redirect(_redirect);
    }

    return (
        <>
        <Button fullWidth variant={"contained"} onClick={() => redirectFn("tab/create")}  >Haz tu pedido aquí!</Button>
        <WithListContext render={({ isPending, data }) => (
            
            
            <Box sx={{
                display: 'grid', 
                gap: 3, 
                gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(4, 1fr)',
                    lg: 'repeat(4, 1fr)'
                },
                p: 2
            }}>
                {data?.map((record: RaRecord) => {
                    // Cast the record to IStore type
                    const store = record as unknown as IStore;
                    
                    return (
                        <DashResourceButton
                            key={store.id}
                            resource={resourceConfig.model}
                            record={store}
                            resourceConfig={resourceConfig}
                            mode="show"
                            navigation="virtualhash"
                            showIcon={false}
                        >
                            <Card 
                                sx={{ 
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    }
                                }}
                            >
                                <CardContent sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    flex: 1,
                                    p: 3
                                }}>
                                    {/* Store Logo */}
                                    {store.squared_logo_url ? (
                                        <Avatar 
                                            src={store.squared_logo_url} 
                                            alt={store.name}
                                            sx={{ 
                                                width: 80, 
                                                height: 80,
                                                mb: 2
                                            }}
                                        />
                                    ) : (
                                        <Avatar sx={{ 
                                            bgcolor: 'primary.main',
                                            width: 80, 
                                            height: 80,
                                            mb: 2
                                        }}>
                                            <Store sx={{ fontSize: 40 }} />
                                        </Avatar>
                                    )}

                                    {/* Store Name */}
                                    <Typography 
                                        variant="h6" 
                                        component="div"
                                        sx={{ 
                                            mb: 1,
                                            fontWeight: 'bold',
                                            lineHeight: 1.2
                                        }}
                                    >
                                        {store.public_name || store.name}
                                    </Typography>

                                    {/* Store Description */}
                                    {store.short_desc && (
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                lineHeight: 1.4
                                            }}
                                        >
                                            {store.short_desc}
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </DashResourceButton>
                    );
                })}
            </Box>
        )} /></>
    );
};

export default StoresList;
