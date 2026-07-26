import React, { useState } from "react";
import { useRecordContext, useNotify, useRefresh } from "react-admin";
import { useAxios } from "dash-axios-hook";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import CircularProgress from "@mui/material/CircularProgress";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useI18nBridge } from "../../contexts/I18nBridgeContext";

/**
 * Enable/disable switch for a service account API key.
 *
 * Deliberately NOT a form field. Status is changed through the dedicated
 * enable/disable endpoints rather than the update payload, for two reasons:
 *
 *  - The update contract rejects everything except role_ids, so submitting a
 *    status would 422.
 *  - Disabling must not rotate the credential. The endpoints flip a flag and
 *    leave the token untouched, so re-enabling restores the same key rather
 *    than forcing every integration to redeploy a new secret.
 *
 * The switch therefore acts immediately and refreshes, instead of waiting for
 * a form save that would never carry it.
 */
const ServiceAccountStatusSwitch: React.FC<IDashAutoAdminCustomFieldComponent> = ({
    resourceConfig,
}) => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const axios = useAxios();
    const { i18nProvider } = useI18nBridge();
    const [loading, setLoading] = useState(false);

    const translate = React.useCallback(
        (key: string, fallback: string) => {
            try {
                return i18nProvider?.translate(key, { _: fallback }) ?? fallback;
            } catch {
                return fallback;
            }
        },
        [i18nProvider]
    );

    if (!record) return null;

    const isActive = record.status === "active";

    const handleToggle = async () => {
        setLoading(true);
        try {
            const action = isActive ? "disable" : "enable";

            await axios.post(`${resourceConfig.model}/${record.id}/${action}`);

            notify(
                isActive
                    ? translate("serviceAccount.notify.disabled", "API key disabled")
                    : translate("serviceAccount.notify.enabled", "API key enabled"),
                { type: "success" }
            );

            refresh();
        } catch (error) {
            console.error("ServiceAccountStatusSwitch: toggle failed", error);
            notify(
                translate("serviceAccount.notify.toggle_error", "Could not change the key status"),
                { type: "error" }
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, my: 1 }}>
            <FormControlLabel
                control={
                    <Switch
                        checked={isActive}
                        onChange={handleToggle}
                        disabled={loading}
                        color="success"
                    />
                }
                label={
                    isActive
                        ? translate("serviceAccount.status.active", "Active")
                        : translate("serviceAccount.status.disabled", "Disabled")
                }
            />
            {loading ? <CircularProgress size={16} /> : null}
        </Box>
    );
};

export default ServiceAccountStatusSwitch;
