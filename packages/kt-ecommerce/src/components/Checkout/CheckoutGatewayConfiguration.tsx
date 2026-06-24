import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    TextField as MuiTextField,
    MenuItem,
    Button,
    Stack,
    Alert,
    Chip,
    CircularProgress,
    Typography,
    Divider,
    Switch,
    FormControlLabel,
} from "@mui/material";

/** Coerce a stored connection-param value (boolean / "1" / "true" / 1 / ...) to a real boolean. */
const toBool = (value: any, fallback = false): boolean => {
    if (value === undefined || value === null || value === "") return Boolean(fallback);
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    const s = String(value).toLowerCase();
    return s === "1" || s === "true" || s === "yes" || s === "on";
};
import { useRecordContext, useNotify, useRefresh } from "react-admin";
import { useAxios } from "dash-axios-hook";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";

/**
 * Self-contained credentials/settings panel for a CheckoutGateway instance (edit view).
 *
 * Fetches the provider's connectionParamFormats, renders the fields seeded from the saved
 * connection_params, saves+verifies them via setUpConnection, and exposes a "set as default for
 * my store" action via setAsDefault. Works for both the owning TenancyAdmin and an assigned
 * TenantAdmin (the backend policy authorizes both).
 */
const CheckoutGatewayConfiguration: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method }) => {
    const record = useRecordContext<any>();
    const axios = useAxios();
    const notify = useNotify();
    const refresh = useRefresh();

    const [format, setFormat] = useState<any[]>([]);
    const [capabilities, setCapabilities] = useState<any>(null);
    const [values, setValues] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [defaulting, setDefaulting] = useState<boolean>(false);

    useEffect(() => {
        if (!record?.id || method !== "edit") return;
        let active = true;
        setLoading(true);
        axios
            .get(`checkout/checkout_gateway/${record.id}/connectionParamFormats`)
            .then((res: any) => {
                if (!active) return;
                const data = res?.data ?? res;
                const fmt = data.format ?? [];
                // Seed any unset field with its declared default (so a default-on switch like
                // test_mode is reflected AND persisted on the next save).
                const seeded: Record<string, any> = { ...(data.values ?? {}) };
                fmt.forEach((f: any) => {
                    if (seeded[f.name] === undefined && f.default !== undefined) {
                        seeded[f.name] = f.default;
                    }
                });
                setFormat(fmt);
                setCapabilities(data.capabilities ?? null);
                setValues(seeded);
            })
            .catch((e: any) => notify(e?.response?.data?.message ?? "Error loading configuration", { type: "error" }))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, [record?.id, method]);

    if (method !== "edit") {
        return <Alert severity="info">Guarda la instancia para configurar las credenciales.</Alert>;
    }

    const setField = (name: string, value: any) => setValues((v) => ({ ...v, [name]: value }));

    const saveAndVerify = async () => {
        setSaving(true);
        try {
            const res: any = await axios.post(`checkout/checkout_gateway/${record.id}/setUpConnection`, {
                connection_params: values,
            });
            const data = res?.data ?? res;
            notify(data.verified ? "Credenciales verificadas — instancia activa" : "Credenciales guardadas, no verificadas", {
                type: data.verified ? "success" : "warning",
            });
            refresh();
        } catch (e: any) {
            notify(e?.response?.data?.message ?? "Error al guardar credenciales", { type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const setAsDefault = async () => {
        setDefaulting(true);
        try {
            await axios.post(`checkout/checkout_gateway/${record.id}/setAsDefault`, {});
            notify("Marcado como método de pago predeterminado para tu tienda", { type: "success" });
            refresh();
        } catch (e: any) {
            notify(e?.response?.data?.message ?? "No se pudo marcar como predeterminado", { type: "error" });
        } finally {
            setDefaulting(false);
        }
    };

    // Schema-driven field renderer — maps a provider connection-param format entry to the right
    // MUI input by `type` (the same vocabulary the tenant/marketplace settings use), so new field
    // types render correctly without bespoke code. Falls back to a text field for unknown types.
    const renderField = (f: any) => {
        const label = f.label ?? f.name;
        const help = f.description || undefined;
        const required = !!f.required;

        switch (f.type) {
            case "boolean":
                return (
                    <FormControlLabel
                        key={f.name}
                        control={
                            <Switch
                                checked={toBool(values[f.name], f.default)}
                                onChange={(e) => setField(f.name, e.target.checked)}
                            />
                        }
                        label={label}
                    />
                );
            case "select":
                return (
                    <MuiTextField
                        key={f.name}
                        select
                        size="small"
                        required={required}
                        helperText={help}
                        label={label}
                        value={values[f.name] ?? f.default ?? ""}
                        onChange={(e) => setField(f.name, e.target.value)}
                    >
                        {(f.options ?? []).map((opt: string) => (
                            <MenuItem key={opt} value={opt}>
                                {opt}
                            </MenuItem>
                        ))}
                    </MuiTextField>
                );
            case "number":
            case "integer":
                return (
                    <MuiTextField
                        key={f.name}
                        size="small"
                        type="number"
                        required={required}
                        helperText={help}
                        label={label}
                        value={values[f.name] ?? f.default ?? ""}
                        onChange={(e) =>
                            setField(f.name, e.target.value === "" ? "" : Number(e.target.value))
                        }
                    />
                );
            case "textarea":
                return (
                    <MuiTextField
                        key={f.name}
                        size="small"
                        multiline
                        minRows={3}
                        required={required}
                        helperText={help}
                        label={label}
                        value={values[f.name] ?? f.default ?? ""}
                        onChange={(e) => setField(f.name, e.target.value)}
                    />
                );
            case "color":
                return (
                    <MuiTextField
                        key={f.name}
                        size="small"
                        type="color"
                        required={required}
                        helperText={help}
                        label={label}
                        value={values[f.name] ?? f.default ?? "#000000"}
                        onChange={(e) => setField(f.name, e.target.value)}
                    />
                );
            case "password":
            case "text":
            default:
                return (
                    <MuiTextField
                        key={f.name}
                        size="small"
                        type={f.type === "password" ? "password" : "text"}
                        required={required}
                        helperText={help}
                        label={label}
                        value={values[f.name] ?? f.default ?? ""}
                        onChange={(e) => setField(f.name, e.target.value)}
                    />
                );
        }
    };

    if (loading) return <CircularProgress size={24} />;

    return (
        <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6">Configuración de la pasarela</Typography>
                    {record?.active ? <Chip size="small" color="success" label="Activa" /> : <Chip size="small" label="Inactiva" />}
                    {capabilities?.region && <Chip size="small" variant="outlined" label={capabilities.region} />}
                </Stack>

                <Stack spacing={2}>
                    {format.map(renderField)}
                </Stack>

                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button variant="contained" onClick={saveAndVerify} disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
                        Guardar y verificar
                    </Button>
                    <Button variant="outlined" onClick={setAsDefault} disabled={defaulting || !record?.active}>
                        Usar como predeterminada
                    </Button>
                </Stack>

                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                    Proveedor: {record?.provider?.name ?? "—"}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default CheckoutGatewayConfiguration;
