import { IProductMetadata, MetadataAvailableFormat } from "../interfaces/Metadata";
import { Product } from "../interfaces/Product";
import { InputLabel, TextField } from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import { Divider } from "antd";
import useGlobalLoaderMgr from 'dash-admin/src/hooks/useGlobalLoaderMgr';
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";

import React, { ReactNode, FC, useState, useEffect } from "react";
import {  useRecordContext, useGetList, LinearProgress } from "react-admin";
import { useController } from "react-hook-form";
import { DefaultEditor } from "react-simple-wysiwyg";
/*import { InputLabel, LinearProgress, TextField } from "@mui/material";
import { Product } from "../../interfaces/Product";
import {
    IProductMetadata,
    MetadataAvailableFormat,
} from "../../interfaces/Metadata";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import React, { FC, ReactNode, useEffect, useState } from "react";
import { useGetList } from "react-admin";
import { useRecordContext } from "react-admin";
import { useController } from "react-hook-form";
import { Divider } from "antd";
import { DefaultEditor } from "react-simple-wysiwyg";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { useLogger } from "../../hooks/useLogger";
import useGlobalLoaderMgr from "../../hooks/useGlobalLoaderMgr";
*/
interface IMetadataField {
  fieldConfig: IFieldProductMetadata;
  index: React.Key;
  defaultValue: any;
  children?: ReactNode;
  [x: string]: any;
}
const MetadataField: FC<IMetadataField> = ({
  fieldConfig,
  index,
  defaultValue,
  children,
  ...props
}) => {
  const type = fieldConfig.metadata_format.type;

  /*const { control, register,reset,resetField } = useFormContext();
  resetField("metadata_items." + fieldConfig.metadata_format_id + ".value");
  resetField("metadata_items." + fieldConfig.metadata_format_id + ".metadata_format_id");*/

  const valueField = useController({
    name: "metadata_items." + fieldConfig.metadata_format_id + ".value",
    defaultValue: defaultValue,
  });
  const formatIdField = useController({
    name:
      "metadata_items." +
      fieldConfig.metadata_format_id +
      ".metadata_format_id",
    defaultValue: fieldConfig.metadata_format.id,
  });

  /*useEffect(() => {
      console.log("UPDATING FIELD VALUES",fieldConfig.metadata_format.id,defaultValue)
      formatIdField.field.onChange(fieldConfig.metadata_format.id);
      valueField.field.onChange(defaultValue)
  },[])*/

  if (type === "STRING")
    return (
      <div key={index}>
        <InputLabel>{fieldConfig.metadata_format?.name}</InputLabel>
        <TextField
          fullWidth
          {...valueField.field}
        //defaultValue={defaultValue}
        />
        <input type="hidden" {...formatIdField} />
      </div>
    );

  if (type === "HTML")
    return (
      <div key={index}>
        <InputLabel>{fieldConfig.metadata_format?.name}</InputLabel>
        {/* https://www.npmjs.com/package/react-simple-wysiwyg */}
        <DefaultEditor
          value={valueField.field.value}
          onChange={(e) => {
            valueField.field.onChange(e.target.value);
          }}
        />
        <input
          type="hidden"
          {...formatIdField.field}
        //defaultValue={fieldConfig.metadata_format.id}
        />
      </div>
    );

  if (type === "DATE")
    return (
      <div key={index}>
        <InputLabel>{fieldConfig.metadata_format?.name}</InputLabel>
        <DesktopDatePicker
          label="Fecha"
          format="DD-MM-YYYY"
          value={valueField.field.value}
          onChange={(date) => {
            date &&
              valueField.field.onChange(
                date.format("YYYY-MM-DD")
              );
          }}
          renderInput={(params) => <TextField {...params} />}
        />
      </div>
    );
};
interface IFieldProductMetadata extends IProductMetadata {
  metadata_format: MetadataAvailableFormat;
}

const ProductMetadataEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({
  method,
  attribute,
}) => {
  const [groupedMetadata, setGroupedMetadata] = useState([]);
  const product: Product = useRecordContext();

  const {
    data: availableMetadataFormats,
    isLoading: availableMetadataFormatsLoading,
  } = useGetList(
    "ecommerce/metadata_format/availableMetadataFormats",
    { pagination: false },
    { refetchOnWindowFocus: false }
  );

  //const logger = useLogger("ProductMetadataEdit");

  useEffect(() => {
    if (!availableMetadataFormats || !product) {
      return;
    }
    
    console.log(
      "PARSING FIELD DEFINTIONS", availableMetadataFormats, product
    );
    //setLoadedData(false);
    //setGroupedMetadata([]);

    const fieldDefinitions: IFieldProductMetadata[] =
      availableMetadataFormats
        ? (availableMetadataFormats as MetadataAvailableFormat[]).map(
          (metadata_format: MetadataAvailableFormat) => {
            const preExistingMetadata: IProductMetadata =
              product.metadata
                ? Object.keys(product.metadata)
                  .map(
                    (product_metadata_id) =>
                      product.metadata[
                      product_metadata_id
                      ]
                  )
                  .find(
                    (element: IProductMetadata) =>
                      element.metadata_format_id ===
                      metadata_format.id
                  )
                : [];

            const output: IFieldProductMetadata = {
              metadata_format_id: metadata_format.id,
              metadata_format_name: metadata_format.name,
              value: null,
              metadata_format: metadata_format,
              ...(product && { product_id: product.id }),
              ...(preExistingMetadata &&
                preExistingMetadata?.id && {
                id: preExistingMetadata.id,
                metadata_format_id:
                  preExistingMetadata.metadata_format_id,
                metadata_format_name:
                  preExistingMetadata.metadata_format_name,
                value: preExistingMetadata.value,
              }),
            };

            return output;
          }
        )
        : [];

    const groups = [
      ...new Set(
        fieldDefinitions.map(
          (resource) => resource.metadata_format.group
        )
      ),
    ];
    const metadata = groups.map((group) => {
      return fieldDefinitions.filter(
        (resource) => resource.metadata_format.group === group
      );
    });

    setGroupedMetadata(metadata);
    console.log("Parsed Metadata", metadata);
    //}
    //setLoadedData(true);

    //}
  }, [availableMetadataFormats, product]);

  if (availableMetadataFormatsLoading || !product)
    return <LinearProgress />;
  
  if (!groupedMetadata.length && !availableMetadataFormatsLoading)
    return <div>No hay metadata configurada para este producto.</div>;

  return (
    <>
      {groupedMetadata.map((group: any, index: number) => {
        return (
          <fieldset className={"field-group"} key={`g${index}`}>
            {group.length > 0 && (
              <legend>{group[0].metadata_format?.group}</legend>
            )}
            {group &&
              (group as IFieldProductMetadata[]).map(
                (field, idx) => {
                  return (
                    <MetadataField
                      fieldConfig={field}
                      defaultValue={field["value"] || ""}
                      index={`g${index}-m${idx}`}
                      key={`g${index}-m${idx}`}
                    />
                  );
                }
              )}
            <Divider />
          </fieldset>
        );
      })}
    </>
  );
};

const ProductMetadataView: React.FC<IDashAutoAdminCustomFieldComponent> = ({
  method,
  attribute,
}) => {
  return <>El producto debe estar creado para modificar la metadata</>;
};

const ProductMetadata = ({
  method,
  attribute,
  resourceConfig
}: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
      return (
        <ProductMetadataEdit resourceConfig={resourceConfig} attribute={attribute} method={method} />
      );
    case "create":
      return (
        <ProductMetadataView resourceConfig={resourceConfig} attribute={attribute} method={method} />
      );
    case "view":
      return <></>;
  }
};

export default ProductMetadata;
