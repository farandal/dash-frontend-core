import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loading, useNotify, useRecordContext, useRefresh, useTranslate } from "react-admin";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Drawer,
    FormControlLabel,
    IconButton,
    MenuItem,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import useAxios from "../../hooks/axios";

/**
 * The System admin's view of one tenancy's plan, as a tab of the Accounts screen:
 * a summary card, a drawer with the details (limits and how much is used, add-ons,
 * recent payments) and a way to move the account to another plan.
 *
 * Shared by every project that mounts the System tenancy resource (VaneXa, KitchnTabs, INAMAP):
 * the limits it lists are whatever the plan stores, so each domain's own keys show up without
 * a change here. Backed by `system/tenancy/{id}/plan` and `system/tenancy/{id}/change-plan`.
 */

interface PlanPayload {
    tenancy: { id: string; name: string; account_status?: string; gateway_type?: string | null };
    subscription: null | {
        id: string;
        status: string;
        subscription_state?: string;
        payment_gateway?: string | null;
        external_subscription_id?: string | null;
        trial_ends_at?: string | null;
        current_period_start?: string | null;
        current_period_end?: string | null;
        cancels_at?: string | null;
        pending_plan?: { id: string | number; name: string } | null;
        pending_plan_effective_at?: string | null;
    };
    plan: null | {
        id: string | number;
        name: string;
        tier?: number;
        price?: number;
        prices?: Record<string, number> | null;
        billing_cycle?: string;
        trial_days?: number;
        limits?: Record<string, any> | null;
        addons?: Record<string, any> | string[] | null;
    };
    usage: Array<{ key: string; limit: number | null; unlimited: boolean; current: number | null }>;
    payments: Array<{ id: string; status: string; amount?: number | null; currency?: string | null; created_at?: string }>;
    available_plans: Array<{
        id: string | number;
        name: string;
        tier?: number;
        price?: number;
        prices?: Record<string, number> | null;
        billing_cycle?: string;
        subscription_plan_type?: string;
    }>;
}

const prettyKey = (key: string) =>
    key
        .replace(/^max_/, "Max ")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString() : "—");

/** CLP has no minor unit; the plan form stores other currencies in cents. */
const formatPrice = (prices?: Record<string, number> | null, fallback?: number) => {
    const entries = Object.entries(prices ?? {});
    if (!entries.length) {
        return fallback ? String(fallback) : "Free";
    }
    return entries
        .map(([code, value]) => {
            const amount = code === "CLP" ? value : value / 100;
            if (!amount) return `${code} 0`;
            try {
                return new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: code,
                    maximumFractionDigits: code === "CLP" ? 0 : 2,
                }).format(amount);
            } catch {
                return `${code} ${amount}`;
            }
        })
        .join(" · ");
};

const isFree = (p?: { price?: number; prices?: Record<string, number> | null } | null) =>
    !p || (!p.price && !Object.values(p.prices ?? {}).some((v) => v > 0));

const statusColor = (status?: string): "success" | "warning" | "error" | "info" | "default" =>
    ({ active: "success", trial: "info", trialing: "info", past_due: "warning", canceled: "error", cancelled: "error" } as any)[
        (status ?? "").toLowerCase()
    ] ?? "default";

const TenancyPlanPanel: React.FC<{ tenancyId: string }> = ({ tenancyId }) => {
    // useAxios() builds a new instance on every render. Depending on it re-created `load` each time,
    // which re-ran the effect, set state, re-rendered, and looped on the plan endpoint forever.
    // Keep the first instance for the life of the panel.
    const { axios: freshAxios } = useAxios();
    const axiosRef = useRef(freshAxios);
    const axios = axiosRef.current;
    const notify = useNotify();
    const refresh = useRefresh();
    const translate = useTranslate();

    const [data, setData] = useState<PlanPayload | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [targetPlan, setTargetPlan] = useState<string>("");
    const [charge, setCharge] = useState(false);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await axios.get(`system/tenancy/${tenancyId}/plan`);
            setData(res.data?.data ?? null);
            setError(null);
        } catch (e: any) {
            setError(e?.response?.data?.message || "Could not load the plan");
        }
    }, [tenancyId]);

    useEffect(() => {
        load();
    }, [load]);

    if (error) return <Alert severity="error">{error}</Alert>;
    if (!data) return <Loading />;

    const { subscription, plan } = data;
    const target = data.available_plans.find((p) => String(p.id) === targetPlan);
    const changing = target && String(target.id) !== String(plan?.id);
    const gatewayManaged = !!subscription?.external_subscription_id;

    const apply = async () => {
        if (!targetPlan) return;
        setSaving(true);
        try {
            await axios.post(`system/tenancy/${tenancyId}/change-plan`, {
                subscription_plan_id: targetPlan,
                charge,
            });
            notify(translate("tenancy.plan.changed", { _: "Plan updated" }), { type: "success" });
            setDialogOpen(false);
            setTargetPlan("");
            await load();
            refresh();
        } catch (e: any) {
            notify(e?.response?.data?.message || translate("tenancy.plan.failed", { _: "Could not change the plan" }), {
                type: "error",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ width: "100%", py: 1 }}>
            <Card variant="outlined" sx={{ maxWidth: 720 }}>
                <CardActionArea onClick={() => setDrawerOpen(true)}>
                    <CardContent>
                        <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 1, alignItems: "center", flexWrap: "wrap" }}>
                            <Typography variant="overline" color="text.secondary">
                                {translate("tenancy.plan.current", { _: "Current plan" })}
                            </Typography>
                            {subscription && <Chip size="small" color={statusColor(subscription.status)} label={subscription.status} />}
                            {subscription?.subscription_state && (
                                <Chip size="small" variant="outlined" label={subscription.subscription_state} />
                            )}
                            {subscription?.pending_plan && (
                                <Chip
                                    size="small"
                                    color="warning"
                                    label={`${translate("tenancy.plan.pending", { _: "Pending" })}: ${subscription.pending_plan.name}`}
                                />
                            )}
                        </Stack>
                        <Typography variant="h5">{plan?.name ?? translate("tenancy.plan.none", { _: "No plan" })}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {plan ? `${formatPrice(plan.prices, plan.price)} / ${plan.billing_cycle ?? "monthly"}` : ""}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                            {translate("tenancy.plan.renews", { _: "Current period ends" })}: {formatDate(subscription?.current_period_end)}
                            {subscription?.trial_ends_at
                                ? ` · ${translate("tenancy.plan.trial_ends", { _: "Trial ends" })}: ${formatDate(subscription.trial_ends_at)}`
                                : ""}
                        </Typography>
                        <Typography variant="caption" color="primary" sx={{ display: "block", mt: 1 }}>
                            {translate("tenancy.plan.details", { _: "View details" })}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button variant="contained" onClick={() => setDialogOpen(true)} disabled={!subscription && !data.available_plans.length}>
                    {translate("tenancy.plan.change", { _: "Change plan" })}
                </Button>
            </Stack>

            {/* Details. Sits above the Accounts drawer this tab usually lives in. */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
            >
                <Box sx={{ width: { xs: "100vw", sm: 560 }, p: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="h6">{plan?.name ?? "—"}</Typography>
                        <IconButton onClick={() => setDrawerOpen(false)} size="small" aria-label="Close">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    <Typography variant="subtitle2" gutterBottom>
                        {translate("tenancy.plan.subscription", { _: "Subscription" })}
                    </Typography>
                    <Table size="small" sx={{ mb: 3 }}>
                        <TableBody>
                            {[
                                ["Status", subscription?.status],
                                ["State", subscription?.subscription_state],
                                ["Account", data.tenancy.account_status],
                                ["Payment gateway", subscription?.payment_gateway ?? data.tenancy.gateway_type ?? "internal"],
                                ["Period start", formatDate(subscription?.current_period_start)],
                                ["Period end", formatDate(subscription?.current_period_end)],
                                ["Trial ends", formatDate(subscription?.trial_ends_at)],
                                ["Cancels at", formatDate(subscription?.cancels_at)],
                                ["Plan tier", plan?.tier],
                                ["Trial days (plan)", plan?.trial_days],
                            ].map(([k, v]) => (
                                <TableRow key={String(k)}>
                                    <TableCell sx={{ color: "text.secondary", width: "45%" }}>{k}</TableCell>
                                    <TableCell>{v ?? "—"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Typography variant="subtitle2" gutterBottom>
                        {translate("tenancy.plan.limits", { _: "Limits" })}
                    </Typography>
                    <Table size="small" sx={{ mb: 3 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>{translate("tenancy.plan.limit", { _: "Limit" })}</TableCell>
                                <TableCell align="right">{translate("tenancy.plan.allowed", { _: "Allowed" })}</TableCell>
                                <TableCell align="right">{translate("tenancy.plan.used", { _: "Used" })}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.usage.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3}>—</TableCell>
                                </TableRow>
                            )}
                            {data.usage.map((u) => (
                                <TableRow key={u.key}>
                                    <TableCell>{prettyKey(u.key)}</TableCell>
                                    <TableCell align="right">{u.unlimited ? "Unlimited" : u.limit}</TableCell>
                                    <TableCell align="right">{u.current ?? "—"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Typography variant="subtitle2" gutterBottom>
                        {translate("tenancy.plan.addons", { _: "Add-ons" })}
                    </Typography>
                    <Box sx={{ mb: 3, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {(() => {
                            const addons = plan?.addons;
                            const enabled = Array.isArray(addons)
                                ? addons
                                : Object.entries(addons ?? {}).filter(([, on]) => !!on).map(([k]) => k);
                            return enabled.length ? (
                                enabled.map((a) => <Chip key={String(a)} size="small" label={String(a)} />)
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    —
                                </Typography>
                            );
                        })()}
                    </Box>

                    <Typography variant="subtitle2" gutterBottom>
                        {translate("tenancy.plan.payments", { _: "Recent payments" })}
                    </Typography>
                    <Table size="small">
                        <TableBody>
                            {data.payments.length === 0 && (
                                <TableRow>
                                    <TableCell>—</TableCell>
                                </TableRow>
                            )}
                            {data.payments.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>{formatDate(p.created_at)}</TableCell>
                                    <TableCell>
                                        <Chip size="small" label={p.status} />
                                    </TableCell>
                                    <TableCell align="right">
                                        {p.amount != null ? `${p.currency ?? ""} ${p.amount}` : "—"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </Drawer>

            {/* Change plan */}
            <Dialog
                open={dialogOpen}
                onClose={() => !saving && setDialogOpen(false)}
                fullWidth
                maxWidth="sm"
                sx={{ zIndex: (theme) => theme.zIndex.modal + 3 }}
            >
                <DialogTitle>{translate("tenancy.plan.change", { _: "Change plan" })}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {data.tenancy.name} · {translate("tenancy.plan.current", { _: "Current plan" })}: <b>{plan?.name ?? "—"}</b>
                    </Typography>
                    <TextField
                        select
                        fullWidth
                        label={translate("tenancy.plan.new_plan", { _: "New plan" })}
                        value={targetPlan}
                        onChange={(e) => setTargetPlan(e.target.value)}
                        sx={{ mb: 2 }}
                    >
                        {data.available_plans.map((p) => (
                            <MenuItem key={String(p.id)} value={String(p.id)} disabled={String(p.id) === String(plan?.id)}>
                                {p.name} — {formatPrice(p.prices, p.price)} / {p.billing_cycle ?? "monthly"}
                                {String(p.id) === String(plan?.id) ? " (current)" : ""}
                            </MenuItem>
                        ))}
                    </TextField>

                    <FormControlLabel
                        control={<Switch checked={!charge} onChange={(e) => setCharge(!e.target.checked)} />}
                        label={translate("tenancy.plan.no_charge", { _: "Assign now, without charging" })}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", ml: 6, mb: 1 }}>
                        {charge
                            ? translate("tenancy.plan.charge_help", {
                                  _: "Normal flow: a paid plan stays pending until the payment gateway confirms it.",
                              })
                            : translate("tenancy.plan.assign_help", {
                                  _: "Applied immediately, whatever the plan's price. No payment is requested.",
                              })}
                    </Typography>

                    {!charge && gatewayManaged && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                            {translate("tenancy.plan.gateway_warning", {
                                _: "This account has a subscription at an external payment gateway. Assigning here does not change it: it keeps billing the plan it has there.",
                            })}
                        </Alert>
                    )}
                    {changing && target && isFree(plan as any) === false && isFree(target as any) && (
                        <Alert severity="info" sx={{ mt: 1 }}>
                            {translate("tenancy.plan.downgrade_note", { _: "Moving to a free plan." })}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} disabled={saving}>
                        {translate("ra.action.cancel", { _: "Cancel" })}
                    </Button>
                    <Button variant="contained" onClick={apply} disabled={!changing || saving}>
                        {translate("tenancy.plan.apply", { _: "Apply" })}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

/** Tab content for the System tenancy resource ("Plan"). Edit and view are the same panel. */
const TenancyPlan = ({ method }: IDashAutoAdminCustomFieldComponent) => {
    const record = useRecordContext<any>();

    if ((method !== "edit" && method !== "view") || !record?.id) {
        return <></>;
    }

    return <TenancyPlanPanel tenancyId={String(record.id)} />;
};

export default TenancyPlan;
