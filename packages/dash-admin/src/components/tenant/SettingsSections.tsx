import { DashAutoFormTabs } from "dash-auto-admin";
import React, { useState } from "react";
import { useTranslate } from "react-admin";
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Divider,
    Drawer,
    IconButton,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

/**
 * Shared by TenantSettings.tsx and TenancySettings.tsx — both render the
 * same "one card per settings group, each opening a drawer" layout over a
 * backend-declared setting_formats schema, the only difference being which
 * record (Tenant vs Tenancy) supplies the current values. Extracted here
 * rather than duplicated a second time WITHIN this package (unlike
 * kt-ecommerce's own TenantSettings.tsx twin, which stays separate on
 * purpose — see that file's docblock — because pulling a cross-PACKAGE
 * shared export would break the *-system apps until dash-admin is
 * republished; that constraint doesn't apply to two components already in
 * the same package).
 */

/** Wrapper creating a React component boundary so DashAutoFormTabs hooks don't violate Rules of Hooks */
export const FormTabsRenderer: React.FC<{ schema: any; method: "list" | "create" | "edit" | "view"; label: string }> = ({ schema, method, label }) => (
    <>{DashAutoFormTabs({ schema, resourceConfig: null, options: { mode: method, label } })}</>
);

/**
 * Split the settings schema into the cards shown on the configuration tab.
 *
 * Grouped by the `group` each setting format already declares — data-driven, so
 * this is agnostic to which product is running: a domain that ships different
 * groups gets different cards with no change here, and one that ships none at
 * all still gets a single card rather than an error.
 *
 * `group` rather than `tab`: tab is the coarser of the two, and a domain that
 * puts everything on one tab (the common case) would get no split at all.
 */
const toSettingsSections = (schema: any[]) => {
    const order: string[] = [];
    const byGroup: Record<string, any[]> = {};

    schema.forEach((entry) => {
        const key = entry.group || entry.tab || 'general';

        if (!byGroup[key]) {
            byGroup[key] = [];
            order.push(key);
        }

        byGroup[key].push(entry);
    });

    return order.map((key) => ({ key, entries: byGroup[key] }));
};

const prettifyGroup = (key: string) =>
    key.replace(/[_-]+/g, ' ').replace(/^./, (c) => c.toUpperCase());

/**
 * The configuration panel: one card per settings group, each opening a drawer.
 *
 * Replaces a single flat list that grew to whatever the backend declared —
 * unreadable once a product ships more than a handful of settings.
 *
 * ── Two things this has to get right ─────────────────────────────────────────
 *
 * keepMounted: the fields belong to the surrounding react-hook-form. Unmounting
 * a closed drawer unregisters them and drops edits made in a section the user
 * closed before saving. Context reaches through the portal, so the form itself
 * is fine — it is only unmount that loses data.
 *
 * z-index: this panel is often rendered INSIDE a Drawer already (the tenancy/
 * tenant resource opens records in one). Two Drawers both sit at
 * theme.zIndex.modal, where stacking falls to DOM order; raising this one
 * makes it deliberate.
 *
 * Labels resolve through the translator, so a domain can name its own groups.
 * A missing key falls back to the prettified group key rather than rendering a
 * raw translation string.
 */
export const SettingsSections: React.FC<{
    schema: any[];
    method: "list" | "create" | "edit" | "view";
    /** Translation namespace prefix — 'tenant.settings' or 'tenancy.settings'. */
    translationNamespace?: string;
}> = ({ schema, method, translationNamespace = 'tenant.settings' }) => {
    const translate = useTranslate();
    const [openSection, setOpenSection] = useState<string | null>(null);
    const sections = toSettingsSections(schema);

    const labelFor = (key: string) =>
        translate(`${translationNamespace}.groups.${key}`, { _: prettifyGroup(key) });

    return (
        <section>
            <Box
                sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                }}
            >
                {sections.map((section) => (
                    <Card key={section.key} variant="outlined">
                        <CardActionArea onClick={() => setOpenSection(section.key)}>
                            <CardContent>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {labelFor(section.key)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {translate(`${translationNamespace}.option_count`, {
                                        smart_count: section.entries.length,
                                        _: `${section.entries.length}`,
                                    })}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                ))}
            </Box>

            {sections.map((section) => (
                <Drawer
                    key={section.key}
                    anchor="right"
                    open={openSection === section.key}
                    onClose={() => setOpenSection(null)}
                    ModalProps={{ keepMounted: true }}
                >
                    <Box sx={{ width: { xs: '100vw', sm: 560 }, p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="h6">{labelFor(section.key)}</Typography>
                            <IconButton onClick={() => setOpenSection(null)} size="small" aria-label="Close">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <FormTabsRenderer schema={section.entries} method={method} label={labelFor(section.key)} />
                    </Box>
                </Drawer>
            ))}
        </section>
    );
};
