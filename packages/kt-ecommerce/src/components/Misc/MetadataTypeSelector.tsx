import { useRecordContext } from "react-admin";
import {AutoSelectInput, AutoSelectView, IAutoSelectInput } from "./AutoSelectInput";

const MetadataTypeSelector = ({ method, attribute, ...selectProps }: IAutoSelectInput) => {
    const record = useRecordContext();
    const isInternal = record && record.is_internal === true ? true : false;
    switch (method) {
        case "edit":
        case "create":
            return !isInternal ? <AutoSelectInput method={method} attribute={attribute} {...selectProps} /> : <>{record ? record[attribute.attribute] : ""}</>
        case "view":
            return <AutoSelectView method={'view'} attribute={attribute} />
    }
}

export default MetadataTypeSelector;
