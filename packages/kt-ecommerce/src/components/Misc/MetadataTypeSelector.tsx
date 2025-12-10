import { useRecordContext } from "react-admin";
import {AutoSelectInput, AutoSelectView, IAutoSelectInput } from "./AutoSelectInput";

const MetadataTypeSelector = ({ method, attribute, resourceConfig,...selectProps }: IAutoSelectInput) => {
    const record = useRecordContext();
    const isInternal = record && record.is_internal === true ? true : false;
    switch (method) {
        case "edit":
        case "create":
            return !isInternal ? <AutoSelectInput method={method} attribute={attribute} resourceConfig={resourceConfig}  {...selectProps} /> : <>{record ? record[attribute.attribute] : ""}</>
        case "view":
            return <AutoSelectView method={'view'} attribute={attribute} resourceConfig={resourceConfig} />
    }
}

export default MetadataTypeSelector;
