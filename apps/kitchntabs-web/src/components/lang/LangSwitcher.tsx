import * as React from 'react';
import { MouseEvent, useState, useRef, useEffect } from 'react';
import { Avatar, useMediaQuery, useTheme } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Translate';
import ReactDOM from 'react-dom';
import { useWindowSize } from 'dash-utils';
import { useLocales, useLocaleState } from '../hooks/usePolyglotTranslation';
const DefaultIcon = <LanguageIcon />;

export interface LanguageSwitcherButtonProps {
    icon?: React.ReactNode;
    languages?: { locale: string; name: string }[];
}

const LangSwitcher = (props: LanguageSwitcherButtonProps) => {
    const { icon = DefaultIcon, languages: languagesProp } = props;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    
    const languages = useLocales({ locales: languagesProp });
    const [locale, setLocale] = useLocaleState();

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [webView, setWebView] = useState<boolean>(false);
    const [open, setOpen] = useState(false);
    const avatarRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const windowSize = useWindowSize();
    useEffect(() => {
        if(document.body.classList.contains('webview')) {
            setWebView(true)
        } else {
            setWebView(false)
        }
    }, []);

    const getNameForLocale = (locale: string): string => {
        const language = languages.find(language => language.locale === locale);
        return language ? language.name : '';
    };

    const changeLocale = (locale: string) => (): void => {
        setLocale(locale);
        setOpen(false);
    };

  const calculateMenuPosition = () => {
    if (avatarRef.current && windowSize.width) {
        const rect = avatarRef.current.getBoundingClientRect();
        const menuWidth = 200; // minWidth from styles
        
        let left = rect.left + window.scrollX;
        
        // Ensure menu doesn't go off-screen using windowSize
        if (left + menuWidth > windowSize.width) {
            left = windowSize.width - menuWidth - 10; // 10px margin
        }
        if (left < 10) {
            left = 10; // 10px margin
        }
        
        setMenuPosition({ 
            top: rect.top + window.scrollY + 30, 
            left: left
        });
    }
};

    const handleLanguageMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        
        setOpen(true);
        calculateMenuPosition();
    };

    const handleLanguageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setOpen(prevOpen => !prevOpen);
        calculateMenuPosition();
    };

    const handleMouseLeave = () => {
        if (!webView) {
            // Add a small delay before closing to allow moving to menu
            timeoutRef.current = setTimeout(() => {
                setOpen(false);
            }, 100);
        }
    };

    const handleMenuMouseEnter = () => {
        // Clear timeout when entering menu
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const handleMenuMouseLeave = () => {
        if (!webView) {
            setOpen(false);
        }
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Recalculate position on screen resize
    useEffect(() => {
        const handleResize = () => {
            if (open) {
                calculateMenuPosition();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [open, isSmallScreen]);

    return (
        <>
            <div
                ref={avatarRef}
                className='dash-language-avatar'
                {... !webView ? { 
                    onMouseEnter: handleLanguageMouseEnter, 
                    onMouseLeave: handleMouseLeave 
                } : { 
                    onClick: handleLanguageClick 
                }}
            >
                <Avatar 
                    sizes='small' 
                    sx={{ fontSize: '1rem' }}
                    style={{
                        width: '30px',
                        height: '30px',
                        minHeight: '30px'
                    }}
                    className='dash-language-avatar-icon'
                >
                    {getNameForLocale(locale).substring(0, 2).toUpperCase()}
                </Avatar>
            </div>

            {open && ReactDOM.createPortal(
                <div 
                    ref={menuRef}
                    className="dash-language-menu-portal"
                    onMouseEnter={!webView ? handleMenuMouseEnter : undefined}
                    onMouseLeave={!webView ? handleMenuMouseLeave : undefined}
                >
                    <div
                        className={`dash-language-menu ${open ? 'show' : ''}`}
                        style={{
                            zIndex: 10000,
                            position: 'absolute',
                            top: menuPosition.top,
                            left: menuPosition.left,
                        }}
                    >
                        {languages.map(language => (
                            <div
                                key={language.locale}
                                className={`dash-language-menu-item ${language.locale === locale ? 'selected' : ''}`}
                                onClick={changeLocale(language.locale)}
                                style={{
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    backgroundColor: language.locale === locale ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                                    minWidth: '150px'
                                }}
                            >
                                {language.name}
                            </div>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default LangSwitcher;
