import React, { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslate } from "react-admin";

export interface IApiKeyRevealContentProps {
    /** The plaintext token, shown exactly once. */
    token: string;
    /** Name of the key, for context. */
    name?: string | null;
}

/**
 * One-time reveal of a newly issued API key.
 *
 * The plaintext credential is never persisted in recoverable form - only a
 * short display prefix is stored - so this is the single moment the operator
 * can copy it.
 *
 * Designed to be passed as the `content` of the framework dialog via a
 * resource's `createSuccessDialog`, so it inherits the app's dialog chrome
 * rather than introducing a second dialog system:
 *
 *   createSuccessDialog: (data) => data?.plain_text_token
 *       ? { title: '...', content: <ApiKeyRevealContent token={data.plain_text_token} name={data.name} /> }
 *       : null,
 */
export const ApiKeyRevealContent: React.FC<IApiKeyRevealContentProps> = ({ token, name }) => {
    const translate = useTranslate();
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(token);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard API unavailable (insecure context or denied permission).
            // The value stays selectable so the operator can still copy it by
            // hand - never leave them without a path to the secret.
            setCopied(false);
        }
    };

    return (
        <Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
                {translate("serviceAccount.reveal.warning", {
                    _: "This is the only time this key will be shown. It cannot be recovered later — if you lose it, you will have to issue a new one.",
                })}
            </Alert>

            {name ? (
                <Typography variant="body2" sx={{ mb: 1 }}>
                    {translate("serviceAccount.reveal.forKey", { _: "Key" })}: <strong>{name}</strong>
                </Typography>
            ) : null}

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1.5,
                    borderRadius: 1,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                }}
            >
                <Box
                    component="code"
                    sx={{
                        flex: 1,
                        fontFamily: "monospace",
                        fontSize: "0.875rem",
                        wordBreak: "break-all",
                        userSelect: "all",
                    }}
                >
                    {token}
                </Box>

                <Tooltip
                    title={
                        copied
                            ? translate("serviceAccount.reveal.copied", { _: "Copied" })
                            : translate("serviceAccount.reveal.copy", { _: "Copy" })
                    }
                >
                    <IconButton onClick={handleCopy} size="small" aria-label="copy api key">
                        {copied ? (
                            <CheckIcon color="success" fontSize="small" />
                        ) : (
                            <ContentCopyIcon fontSize="small" />
                        )}
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
};

export default ApiKeyRevealContent;
