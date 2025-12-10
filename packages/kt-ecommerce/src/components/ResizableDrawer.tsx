import { Drawer, DrawerProps } from "@mui/material";
import { makeStyles } from '@mui/styles';
import React, { JSX, ReactNode, useCallback } from "react";


const minDrawerWidth = 100;
const maxDrawerWidth = 1200;

/*const useStyles = makeStyles(theme => ({
  drawer: {
    flexShrink: 0
  },
  toolbar: theme.mixins.toolbar,
  dragger: {
    width: "5px",
    cursor: "ew-resize",
    padding: "4px 0 0",
    borderTop: "1px solid #ddd",
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: "#f4f7f9"
  }
}));*/

/* @ts-ignore */
export interface IResizableDrawer extends DrawerProps {
    defaultWidth: number
    content: (drawerWidth:number) => JSX.Element
    children: (drawerWidth:number) =>JSX.Element
    [x:string]: any
}

//export const ResizableDrawerContext = React.createContext(400);

const ResizableDrawer: React.FC<IResizableDrawer> = ({ content, children, defaultWidth, ...props }) => {

  const ResizableDrawerContext = React.createContext(defaultWidth);

  //const classes = useStyles();
  const [drawerWidth, setDrawerWidth] = React.useState(defaultWidth);

  const handleMouseDown = e => {
    console.log("Mouse down");
    document.addEventListener("mouseup", handleMouseUp, true);
    document.addEventListener("mousemove", handleMouseMove, true);
  };

  const handleMouseUp = () => {
    console.log("Mouse up");
    document.removeEventListener("mouseup", handleMouseUp, true);
    document.removeEventListener("mousemove", handleMouseMove, true);
  };

  const handleMouseMove = useCallback(e => {
    console.log("Mouse move");
    //const newWidth = e.clientX - (window.innerWidth - document.body.offsetLeft - document.body.offsetWidth  );
    //const newWidth = e.clientX + (window.innerWidth - document.body.offsetLeft - document.body.offsetWidth  );
    const newWidth = window.innerWidth - e.clientX
    //if (newWidth > minDrawerWidth && newWidth < maxDrawerWidth) {
      setDrawerWidth(newWidth)
    //}
    if(e.stopPropagation) e.stopPropagation();
    if(e.preventDefault) e.preventDefault();
    e.cancelBubble=true;
    e.returnValue=false;
 
  }, []);

  return (
   
    <ResizableDrawerContext.Provider value={drawerWidth}>
       {content(drawerWidth)}
        <Drawer
        //className={classes.drawer}
        PaperProps={{ style: { width: drawerWidth  } }}
        //sx={{ zIndex: 100, width: drawerWidth }}
        {...props}
        >
             <div /*className={classes.toolbar}*/ />
             <div onMouseDown={e => handleMouseDown(e)}  /*className={classes.dragger}*/ />
            {children(drawerWidth)}
        </Drawer>
      </ResizableDrawerContext.Provider>
   
  );
}

export default ResizableDrawer;
