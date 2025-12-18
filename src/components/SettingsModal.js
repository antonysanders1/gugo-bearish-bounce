import React, { useContext, useMemo, useState } from "react";
import {
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Button,
    Switch,
    FormControl,
    Select,
    MenuItem,
    useMediaQuery,
    Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";

import { MainContext } from "../App"; // adjust path if needed

export default function SettingsModal({ open, onClose }) {
    const { Theme } = useContext(MainContext);
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

    // ✅ dummy settings (design-only)
    const [soundOn, setSoundOn] = useState(true);
    const [language, setLanguage] = useState("en");

    // dummy player id + version
    const playerId = "PENGU-7K4D-91QX";
    const version = "v0.1.0-alpha";

    const languageLabel = useMemo(() => {
        const map = { en: "English", es: "Español", fr: "Français" };
        return map[language] || "English";
    }, [language]);

    const copyPlayerId = async () => {
        try {
            await navigator.clipboard.writeText(playerId);
            // design-only: you can show a toast later
            console.log("Copied playerId:", playerId);
        } catch (e) {
            console.error("Clipboard failed:", e);
        }
    };

    if (!open) return null;

    return (
        <Dialog
            open={!!open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: "hidden",
                    background: Theme.palette.background?.paper || "#0b0b18",
                    borderLeft: `3px solid ${Theme.palette.secondary.dark}`,
                    borderTop: `3px solid ${Theme.palette.secondary.dark}`,
                    borderRight: `3px solid ${Theme.palette.secondary.dark}`,
                    borderBottom: `3px solid ${Theme.palette.secondary.light}`,
                },
            }}
        >
            <DialogTitle
                sx={{
                    px: 2,
                    py: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    background: Theme.palette.secondary.main,
                }}
            >
                <Typography
                    sx={{
                        fontWeight: 900,
                        fontSize: 20,
                        color: Theme.palette.text.light || "#fff",
                        textShadow:
                            "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                        flexGrow: 1,
                    }}
                >
                    Settings
                </Typography>

                <IconButton size="small" onClick={onClose} sx={{ color: "#fff" }}>
                    <CloseRoundedIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent
                dividers
                sx={{
                    p: 0,
                    background: Theme.palette.background?.paper || "#3f2304ff",
                }}
            >
                <Box
                    sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        minHeight: isMobile ? "70vh" : "unset",
                    }}
                >
                    {/* Sound Toggle */}
                    <Panel Theme={Theme}>
                        <Row>
                            <Typography sx={labelStyle}>Sound</Typography>
                            <Switch
                                checked={soundOn}
                                onChange={(e) => setSoundOn(e.target.checked)}
                            />
                        </Row>
                        <Typography sx={hintStyle}>
                            Toggle game music & SFX.
                        </Typography>
                    </Panel>

                    {/* Language dropdown */}
                    <Panel Theme={Theme}>
                        <Row>
                            <Typography sx={labelStyle}>Language</Typography>
                            <FormControl size="small" sx={{ minWidth: 160 }}>
                                <Select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    sx={{
                                        borderRadius: 2,
                                        color: "#fff",
                                        fontWeight: 900,
                                        background: "rgba(255,255,255,0.08)",
                                        border: `2px solid ${Theme.palette.secondary.dark}`,
                                        "& .MuiSvgIcon-root": { color: "#fff" },
                                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                    }}
                                >
                                    <MenuItem value="en">English</MenuItem>
                                    <MenuItem value="es">Español</MenuItem>
                                    <MenuItem value="fr">Français</MenuItem>
                                </Select>
                            </FormControl>
                        </Row>
                        <Typography sx={hintStyle}>Current: {languageLabel}</Typography>
                    </Panel>

                    {/* Player ID (copyable) */}
                    <Panel Theme={Theme}>
                        <Row>
                            <Typography sx={labelStyle}>Player ID</Typography>
                        </Row>

                        <Box
                            sx={{
                                mt: 1,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                p: 1.25,
                                borderRadius: 2,
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.10)",
                            }}
                        >
                            <Typography
                                sx={{
                                    color: "#fff",
                                    fontWeight: 900,
                                    flex: 1,
                                    textShadow:
                                        "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                                }}
                            >
                                {playerId}
                            </Typography>

                            <Tooltip title="Copy" arrow>
                                <IconButton
                                    onClick={copyPlayerId}
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 2,
                                        border: `2px solid ${Theme.palette.secondary.dark}`,
                                        background: "rgba(255,255,255,0.08)",
                                        color: "#fff",
                                    }}
                                >
                                    <ContentCopyRoundedIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Panel>

                    {/* Report Bug */}
                    <Panel Theme={Theme}>
                        <Row>
                            <Typography sx={labelStyle}>Report a Bug</Typography>
                        </Row>

                        <Button
                            fullWidth
                            sx={{
                                mt: 1,
                                height: 52,
                                borderRadius: 2,
                                fontWeight: 900,
                                fontSize: 16,
                                color: "#fff",
                                background: Theme.palette.primary.main,
                                border: `2px solid ${Theme.palette.primary.dark}`,
                                textTransform: "none",
                            }}
                            onClick={() => console.log("Report bug (placeholder)")}
                        >
                            Open Bug Report
                        </Button>


                    </Panel>

                    {/* Version */}
                    <Panel Theme={Theme}>
                        <Row>
                            <Typography sx={labelStyle}>Version</Typography>
                            <Typography
                                sx={{
                                    color: "#fff",
                                    fontWeight: 900,
                                    textShadow:
                                        "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                                }}
                            >
                                {version}
                            </Typography>
                        </Row>
                    </Panel>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

function Panel({ Theme, children }) {
    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 2.5,
                border: `2px solid ${Theme.palette.secondary.dark}`,
                background: "rgba(0,0,0,0.18)",
            }}
        >
            {children}
        </Box>
    );
}

function Row({ children }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
            {children}
        </Box>
    );
}

const labelStyle = {
    color: "#fff",
    fontWeight: 900,
    fontSize: 14,
    textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
};

const hintStyle = {
    marginTop: 0.75,
    color: "#ffffffcc",
    fontSize: 12,
    fontWeight: 700,
};
