import { Autocomplete, Chip, Stack, TextField } from '@mui/material';
import { useInput, useRecordContext, useTranslate } from 'react-admin';

/** Same rule as the backend's DeviceRequest::ALIAS_PATTERN: `kind:name`, lowercase. */
export const ALIAS_PATTERN = /^[a-z0-9][a-z0-9_-]*:[a-z0-9][a-z0-9._-]*$/;

const normalise = (value: string) => value.trim().toLowerCase();

const AliasesInput = ({ source }: { source: string }) => {
    const translate = useTranslate();
    const { field, fieldState } = useInput({ source, defaultValue: [] });
    const value: string[] = Array.isArray(field.value) ? field.value : [];
    const invalid = value.find((alias) => !ALIAS_PATTERN.test(alias));

    return (
        <Autocomplete
            multiple
            freeSolo
            fullWidth
            options={[]}
            value={value}
            onChange={(_e, next) => field.onChange(Array.from(new Set((next as string[]).map(normalise).filter(Boolean))))}
            renderValue={(tags, getItemProps) =>
                tags.map((tag, index) => {
                    const { key, ...props } = getItemProps({ index });
                    return <Chip key={key} size="small" label={tag} color={ALIAS_PATTERN.test(tag) ? 'default' : 'error'} {...props} />;
                })
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    size="small"
                    label={translate('dash_devices.fields.aliases', { _: 'Aliases' })}
                    placeholder="gate:puerta-a"
                    error={!!invalid || !!fieldState.error}
                    helperText={
                        invalid
                            ? translate('dash_devices.aliases_invalid', { _: 'Format: kind:name' })
                            : fieldState.error?.message || translate('dash_devices.aliases_help', { _: '' })
                    }
                />
            )}
        />
    );
};

/** A device's aliases: chips to read, a free-text chip input to edit. */
export const AliasesField = ({ source = 'aliases', method }: { source?: string; method?: string }) => {
    const record = useRecordContext<any>();

    if (method === 'edit') {
        return <AliasesInput source={source} />;
    }
    if (!record) return null;

    const aliases: string[] = Array.isArray(record[source]) ? record[source] : [];

    return (
        <Stack direction="row" useFlexGap sx={{ gap: 0.5, flexWrap: 'wrap' }}>
            {aliases.map((alias) => (
                <Chip key={alias} size="small" variant="outlined" label={alias} />
            ))}
        </Stack>
    );
};

export default AliasesField;
