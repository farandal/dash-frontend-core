import { AutocompleteInputProps, RaRecord } from 'react-admin';
import React from 'react';

const AutocompleteCheckBoxArrayInput = <
    OptionType extends RaRecord = RaRecord,
    DisableClearable extends boolean | undefined = boolean | undefined,
    SupportCreate extends boolean | undefined = false,
>({
    defaultValue,
    ...props
}: AutocompleteArrayInputProps<
    OptionType,
    DisableClearable,
    SupportCreate
>) => 
/* @ts-ignore */
<AutocompleteCheckBoxInput<
        OptionType,
        true,
        DisableClearable,
        SupportCreate
    >
        {...props}
        multiple
        defaultValue={defaultValue ?? []}
    />

export type AutocompleteArrayInputProps<
    OptionType = RaRecord,
    DisableClearable extends boolean | undefined = false,
    SupportCreate extends boolean | undefined = false,
> = Omit<
    AutocompleteInputProps<OptionType, true, DisableClearable, SupportCreate>,
    'defaultValue'
> & {
    defaultValue?: any[];
};

export default AutocompleteCheckBoxArrayInput;
