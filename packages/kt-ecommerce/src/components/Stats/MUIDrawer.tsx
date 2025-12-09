import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';


const drawerWidth = 300;

const useStyles = makeStyles((theme) => ({
root: {
    display: 'flex',
},
drawer: {
    width: drawerWidth,
    flexShrink: 0,
},
drawerPaper: {
    width: drawerWidth,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
},
content: {
    flexGrow: 1,
    padding: theme.spacing(3),
},
list: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
},
}));

import { Drawer } from '@mui/material';

const MaterialUIDrawer = ({ children, open, onClose, title }) => {
    const classes = useStyles();

    const list = (
        <div
            className={classes.list}
            role="presentation"
        >
            <h2>{title}</h2>
            {children}
        </div>
    );

    return (
        <div>
            <Drawer
                className={classes.drawer}
                anchor="right"
                open={open}
                onClose={onClose}
            >
                {list}
            </Drawer>
        </div>
    );
};

export default MaterialUIDrawer;
