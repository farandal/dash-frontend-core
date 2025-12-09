import { LinearProgress, TextareaAutosize } from "@mui/material";
import { IProductImportLogComponent } from "dash-admin/src/interfaces/Log";
import { useAxios } from 'dash-axios-hook';
import React, { useState } from "react";
import { Button, useRecordContext } from "react-admin";
import MUISimpleJsonTable from "./MuiSimpleJsonTable";
import { saveAs } from 'file-saver';
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";

export const ProductImportLogComponent: React.FC<IProductImportLogComponent> = ({ logs }) => {
  const axios = useAxios();

  // Store contents and loading state per log index
  const [logContents, setLogContents] = useState<string[]>([]);
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});

  // Download file from backend and save
  const downloadLog = async (log) => {
    try {
      setLoading((prev) => ({ ...prev, [log.id]: true }));
      const { data: file } = await axios.get(
        `/system/log/${log.id}/download`,
        { responseType: 'blob' }
      );
      let fileName = log.filepath.split("/").pop();
      saveAs(file, fileName);
    } catch (error) {
      console.error("Error downloading log:", error);
    } finally {
      setLoading((prev) => ({ ...prev, [log.id]: false }));
    }
  };

  // Preview file content in textarea
  const previewLog = async (log, index) => {
    try {
      setLoading((prev) => ({ ...prev, [log.id]: true }));
      if (log.filepath) {
        const { data: file } = await axios.get(
          `/system/log/${log.id}/download`,
          { responseType: 'blob' }
        );
        let fileContent = await file.text();
        setLogContents((prev) => {
          const updated = [...prev];
          updated[index] = fileContent;
          return updated;
        });
      }
    } catch (error) {
      console.error("Error loading log:", error);
      setLogContents((prev) => {
        const updated = [...prev];
        updated[index] = "";
        return updated;
      });
    } finally {
      setLoading((prev) => ({ ...prev, [log.id]: false }));
    }
  };

  if (!logs) return <></>;

  return (
    <>
      {logs.map((log, index) => (
        <div key={log.id} style={{ marginBottom: 24 }}>
          <MUISimpleJsonTable vertical tableData={log} showKey />
          <div style={{ margin: "8px 0" }}>
            <TextareaAutosize
              style={{ width: "100%" }}
              maxRows={50}
              value={logContents[index] !== undefined ? logContents[index] : ""}
              placeholder="Previsualiza el log aquí..."
              readOnly
            />
          </div>
          {log.filepath && (
            <>
              <Button
                loading={!!loading[log.id]}
                disabled={!!loading[log.id]}
                onClick={() => previewLog(log, index)}
              >
                <span>Previsualizar</span>
              </Button>
              <Button
                loading={!!loading[log.id]}
                disabled={!!loading[log.id]}
                onClick={() => downloadLog(log)}
              >
                <span>Descargar</span>
              </Button>
            </>
          )}
          {loading[log.id] && <LinearProgress />}
        </div>
      ))}
    </>
  );
};

const ProductImportLogEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
  const log = useRecordContext();
  const logs = log[attribute.attribute] || [];
  return <ProductImportLogComponent logs={logs} />;
};

const ProductImportLogView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
  const log = useRecordContext();
  const logs = log[attribute.attribute] || [];
  return <ProductImportLogComponent logs={logs} />;
};

const ProductImportLog = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <ProductImportLogEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />;
    case "view":
      return <ProductImportLogView attribute={attribute} method={method} resourceConfig={resourceConfig} />;
    default:
      return null;
  }
};

export default ProductImportLog;