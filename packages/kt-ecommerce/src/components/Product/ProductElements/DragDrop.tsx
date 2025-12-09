import React from "react";
import {Card, message, Upload} from "antd";
import * as Icon from 'react-feather';

const Dragger = Upload.Dragger;

const props = {
  name: 'file',
  multiple: true,
  action: '//jsonplaceholder.typicode.com/posts/',
  onChange(info) {
    const status = info.file.status;
    if (status !== 'uploading') {
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
};

const DragDrop = () => {
    return (
      <Card className="dash-upload-container">
        <img
        src={"/img/default/dragdrop-back.svg"}
        className="dash-upload-back"
        />
        <Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <Icon.UploadCloud
              
                size={"66px"}
                color={"#000000"}
            />
            
          </p>
          <p className="ant-upload-text">Arrastra aquí las imagenes <br/>que desea agregar</p>
          <p className="ant-upload-text">o</p>
          <span className="btn btn-drag">Seleccionar imagenes</span>
        </Dragger>
      </Card>
    );
  }
;

export default DragDrop;
