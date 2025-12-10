import {
    Autocomplete,
    Box,
    CircularProgress,
    InputLabel,
    TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useController } from "react-hook-form";
import { useGetList } from "react-admin";
import { TrendingUpRounded } from "@mui/icons-material";

const SearchableSelect: React.FC<any> = ({
    name,
    isMultiple = false,
    resource,
    selectLabel,
    title,
    renderText,
    transformData,
    defaultValues = undefined,
    isEmpty = false,
    filter = {},
}) => {
    const [open, setOpen] = useState(false);
    const [settedInitialValues, setSettedInitialValues] = useState(false);
    const [q, setQ] = useState("");
    const field = useController({ name });

    const {
        data: resourceData,
        total,
        isLoading,
        error,
    } = useGetList(
        resource,
        {
        
            filter: { q, ...filter },
        },
        { refetchOnWindowFocus: false }
    );

    useEffect(() => {
        if (resourceData && !settedInitialValues) {
            if (defaultValues) {
                field.field.onChange(defaultValues);
            }
            setSettedInitialValues(true);
        }
        return () => {
            setSettedInitialValues(false);
        };
    }, [resourceData]);


    return (
        <>
            <InputLabel>{title}</InputLabel>
            {/*<SearchBar />*/}
            {TrendingUpRounded && (
                <Autocomplete
                    multiple={isMultiple}
                    loading={isLoading && open}
                    sx={{ width: 373 }}
                    options={
                        !resourceData
                            ? []
                            : !defaultValues
                            ? resourceData
                            : resourceData
                    }
                    open={open}
                    onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}
                    // defaultValue={field.field.value.map(item => resourceData.find(template => template.id === item))}

                    autoHighlight
                    {...(!isEmpty && { value: field.field.value })}
                    {...(isEmpty && {
                        renderTags: (value, getTagProps) => <></>,
                    })}
                    getOptionLabel={(option: any) =>
                        renderText ? renderText(option) : option.name
                    }
                    renderOption={(props, option: any) => (
                        <Box
                            component="li"
                            sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                            {...props}
                        >
                            {renderText ? renderText(option) : option.name}
                        </Box>
                    )}
                    onChange={(event: any, rawValue) => {
                        let newValue:any = rawValue;
                        if (Array.isArray(rawValue)) {
                            if (isEmpty)
                                newValue = [...rawValue, ...field.field.value];
                            newValue = [
                                ...new Map(
                                    newValue.map((v) => [v.id, v])
                                ).values(),
                            ];
                        }

                        if (transformData)
                            field.field.onChange(transformData(newValue));
                        else field.field.onChange(newValue);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={selectLabel}
                            variant="outlined"
                            onChange={(ev) => {
                                // dont fire API if the user delete or not entered anything
                                if (
                                    ev.target.value !== "" ||
                                    ev.target.value !== null
                                ) {
                                    setQ(ev.target.value);
                                }
                            }}
                            onBlur={() => setQ("")}
                            InputProps={{
                                ...params.InputProps,
                                autoComplete: "new-password",
                                endAdornment: (
                                    <>
                                        {isLoading ? (
                                            <CircularProgress
                                                color="inherit"
                                                size={20}
                                            />
                                        ) : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />
            )}
        </>
    );
};

export default SearchableSelect;
