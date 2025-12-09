import React from "react";
import { Card, message, Upload } from "antd";
import { IconButton, ImageList, ImageListItem, ImageListItemBar } from '@mui/material';


import * as Icon from 'react-feather';

const Dragger = Upload.Dragger;

const props = {
  name: "file",
  multiple: true,
  action: "//jsonplaceholder.typicode.com/posts/",
  onChange(info) {
    const status = info.file.status;
    if (status !== "uploading") {
    }
    if (status === "done") {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
};

const DragDrop = () => {
  return (
    <div style={{ width: "100%", height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <ImageList /*rowHeight={172}*/ gap={2} cols={6}>
        {itemData.map((item) => {
          return (
            <ImageListItem
              key={item.img}
              cols={item.cols}
              rows={item.cols}
              style={{
                //maxHeight: item.cols > 2 ? "172px" : "115px",
                position: "relative",
              }}
            >
              <img
                src={item.img}
                srcSet={item.img}
                style={{
                  //width: "100%",
                  //height: "100%",
                  objectFit: "cover",
                }}
                alt={item.title}
                loading="lazy"
              />
              <div
                className={`imageListItem--back ${
                  item.selected ? "active" : ""
                }`}
              ></div>

              <ImageListItemBar
                sx={{
                  background: "transparent",
                }}
                position="top"
                actionIcon={
                  <IconButton sx={{ color: "white" }} aria-label={`star `}>
                    {item.selected ? <Icon.CheckCircle  size={'24px'}/> : <Icon.CheckSquare size={'18px'}/>}
                  </IconButton>
                }
                actionPosition="right"
              />
            </ImageListItem>
          );
        })}
      </ImageList>
      <Card className="dash-upload-container empty">
        <Dragger {...props}>
          <span className="btn btn-drag">Seleccionar imagenes</span>
        </Dragger>
      </Card>
    </div>
  );
};
const itemData = [
  {
    img: "https://cdn.pixabay.com/photo/2015/03/03/05/56/avenue-656969_1280.jpg",
    title: "Burger",
    author: "@rollelflex_graphy726",
    cols: 6,
    selected: true,
  },
  {
    img: "https://cdn.pixabay.com/photo/2015/03/03/05/56/avenue-656969_1280.jpg",
    title: "Camera",
    author: "@helloimnik",
    cols: 2,
    selected: false,
  },
  {
    img: "https://cdn.pixabay.com/photo/2015/03/03/05/56/avenue-656969_1280.jpg",
    title: "Burger",
    author: "@rollelflex_graphy726",
    cols: 2,
    selected: false,
  },
  {
    img: "https://cdn.pixabay.com/photo/2015/03/03/05/56/avenue-656969_1280.jpg",
    title: "Burger",
    author: "@rollelflex_graphy726",
    cols: 2,
    selected: false,
  },
  {
    img: "https://cdn.pixabay.com/photo/2015/03/03/05/56/avenue-656969_1280.jpg",
    title: "Burger",
    author: "@rollelflex_graphy726",
    cols: 3,
    selected: false,
  },
  {
    img: "https://cdn.pixabay.com/photo/2015/03/03/05/56/avenue-656969_1280.jpg",
    title: "Burger",
    author: "@rollelflex_graphy726",
    cols: 3,
    selected: false,
  },
];
export default DragDrop;
