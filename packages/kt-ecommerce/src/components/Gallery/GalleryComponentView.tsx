import { IconButton, ImageList, ImageListItem, ImageListItemBar } from '@mui/material';
import React, { } from 'react'
import { IGalleryComponent } from './Interfaces';
import { Avatar } from "antd";
import * as Icons from '@mui/icons-material';
import { IGalleryImage } from '../interfaces/Gallery';



export const GalleryComponentView: React.FC<IGalleryComponent> = ({ gallery, view, ...props }) => {

    return (
        <>

            { view === "gallery_list" ?
                <ImageList cols={12} >
                    {gallery?.images.map((item:IGalleryImage, key) => {
                        //const img = URL.createObjectURL(item);
                        return <ImageListItem className="" key={key}>
                            <Avatar shape="square" className="dash-size-40" src={item.url} />
                        </ImageListItem>
                    })}
                </ImageList>
                : // product
                <ImageList cols={3} >
                    {gallery?.images.map((item, key) => {
                        
                        //const img = URL.createObjectURL(item);
                        return <ImageListItem key={key} >
                            <img src={item.url} alt="imagen" />
                            {gallery?.primary_image_id === item.id &&
                            <>
                                <div className="imageListItem--back active"></div>
                                <ImageListItemBar
                                    sx={{
                                        background: 'transparent'
                                    }}
                                    // title={item.title}
                                    position="bottom"
                                    actionIcon={
                                        <IconButton
                                            sx={{ color: 'white' }}
                                            aria-label={`star `}
                                        >
                                            <Icons.RadioButtonChecked/>
                                            {/* <StarBorderIcon /> */}
                                        </IconButton>
                                    }
                                    actionPosition="left"
                                />
                            </>}
                        </ImageListItem>
                    })}

                </ImageList>
            }
        </>
    )
}
