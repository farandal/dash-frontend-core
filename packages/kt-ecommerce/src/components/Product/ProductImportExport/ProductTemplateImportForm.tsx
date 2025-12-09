import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import React from "react";
import { FC, lazy } from "react";

const ProductTemplateImportFormComponent = lazy(() => import("./ProductTemplateImportFormComponent"));
//import ProductTemplateImportFormComponent from "./ProductTemplateImportFormComponent";

const ProductTemplateImportForm: FC<IDashAutoAdminCustomFieldComponent> = ({
    ...props
}) => {
    return <ProductTemplateImportFormComponent {...props} />;
};

export default ProductTemplateImportForm;