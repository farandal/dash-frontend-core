import * as React from 'react';
import { MouseEvent, useState } from 'react';
import { useLocaleState, useLocales } from 'ra-core';
import { Avatar, Menu, MenuItem } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Translate';

const DefaultIcon = <LanguageIcon />;

export interface LanguageSwitcherButtonProps {
    icon?: React.ReactNode;
    languages?: { locale: string; name: string }[];
}

const LanguageSwitcher = (props: LanguageSwitcherButtonProps) => {
    const { icon = DefaultIcon, languages: languagesProp } = props;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const languages = useLocales({ locales: languagesProp });
    const [locale, setLocale] = useLocaleState();

    const getNameForLocale = (locale: string): string => {
        const language = languages.find(language => language.locale === locale);
        return language ? language.name : '';
    };

    const changeLocale = (locale: string) => (): void => {
        setLocale(locale);
        setAnchorEl(null);
    };

    const handleLanguageClick = (event: MouseEvent<HTMLElement>): void => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (): void => {
        setAnchorEl(null);
    };

    return (
        <>
            <div className='dash-language-avatar' onClick={handleLanguageClick}>
                <Avatar sizes='small' 
                	sx={{ fontSize: '1rem' }}
                    style={{
						width: '30px',
						height: '30px',
						minHeight: '30px'
					}}
                
                className='dash-language-avatar-icon'>
                    {getNameForLocale(locale).substring(0, 2).toUpperCase()}
                </Avatar>
            </div>
            <Menu
                className='dash-language-menu'
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {languages.map(language => (
                    <MenuItem
                        key={language.locale}
                        onClick={changeLocale(language.locale)}
                        selected={language.locale === locale}
                    >
                        {language.name}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default LanguageSwitcher;