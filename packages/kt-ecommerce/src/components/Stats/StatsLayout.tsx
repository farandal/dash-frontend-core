
import { Button, Drawer } from "@mui/material";
import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import React from "react";
import { useState } from "react";


interface IStatsLayout {
    resourceConfig:IDashAutoAdminResourceConfig
}

export const StatsLayout:React.FC<IStatsLayout> = ({resourceConfig}) => {
    
    const [openFilters, setOpenFilters] = useState(false);

    const showDrawer = () => {
      setOpenFilters(true);
    };
  
    const onClose = () => {
      setOpenFilters(false);
    };
  
    return (
      <>
        <Button variant="contained" onClick={showDrawer}>
          Abrir Filtros
        </Button>

        <Drawer anchor="right" onClose={onClose} open={openFilters}>
          Filtros
        </Drawer>
      </>
    );

}