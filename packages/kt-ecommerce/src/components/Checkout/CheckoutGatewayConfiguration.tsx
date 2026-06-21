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
} from "@mui/material";
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
                setFormat(data.format ?? []);
                setCapabilities(data.capabilities ?? null);
                setValues({ ...(data.values ?? {}) });
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
                    {format.map((f) =>
                        f.type === "select" ? (
                            <MuiTextField
                                key={f.name}
                                select
                                size="small"
                                label={f.label ?? f.name}
                                value={values[f.name] ?? f.default ?? ""}
                                onChange={(e) => setField(f.name, e.target.value)}
                            >
                                {(f.options ?? []).map((opt: string) => (
                                    <MenuItem key={opt} value={opt}>
                                        {opt}
                                    </MenuItem>
                                ))}
                            </MuiTextField>
                        ) : (
                            <MuiTextField
                                key={f.name}
                                size="small"
                                type={f.type === "password" ? "password" : "text"}
                                label={f.label ?? f.name}
                                value={values[f.name] ?? ""}
                                onChange={(e) => setField(f.name, e.target.value)}
                            />
                        )
                    )}
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
