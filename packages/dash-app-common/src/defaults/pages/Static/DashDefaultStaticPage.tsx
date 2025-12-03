/**
 * Default Static Page
 * 
 * Generic static page component that can be used for terms, privacy policy, etc.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Button, 
    Container,
    Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface DefaultStaticPageProps {
    title?: string;
    content?: string | React.ReactNode;
    showBackButton?: boolean;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const DefaultStaticPage: React.FC<DefaultStaticPageProps> = ({
    title = 'Static Page',
    content,
    showBackButton = true,
    maxWidth = 'md',
}) => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <Container maxWidth={maxWidth}>
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 4,
                    my: 4
                }}
            >
                {showBackButton && (
                    <Box sx={{ mb: 3 }}>
                        <Button 
                            variant="text" 
                            startIcon={<ArrowBackIcon />}
                            onClick={handleGoBack}
                        >
                            Back
                        </Button>
                    </Box>
                )}
                
                <Typography variant="h4" component="h1" gutterBottom>
                    {title}
                </Typography>
                
                {typeof content === 'string' ? (
                    <Typography 
                        variant="body1" 
                        component="div"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                ) : (
                    content
                )}
            </Paper>
        </Container>
    );
};

export default DefaultStaticPage;
