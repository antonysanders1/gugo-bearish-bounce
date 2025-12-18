import React, { useContext } from "react";
import {
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CircleIcon from "@mui/icons-material/Circle";

import { MainContext } from "../App"; // adjust if your modal folder differs

export default function PlayerInfoModal({ open, onClose }) {
    const { Theme } = useContext(MainContext);
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

    // ✅ dummy data for now
    const player = {
        name: "QuickRaccoon",
        isOnline: true,
        stats: {
            playedMatches: 128,
            wl: "78 - 50",
            highestMultiplier: "x42",
            nemesis: "FrostBytePengu",
        },
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
                    Player Info
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
                    {/* Banner */}
                    <Box
                        sx={{
                            height: 110,
                            borderRadius: 2.5,
                            border: `2px solid ${Theme.palette.secondary.dark}`,
                            background:
                                "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(0,0,0,0.15))",
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        {/* optional subtle snow dots / texture later */}
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                opacity: 0.25,
                                background:
                                    "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.35) 0 2px, transparent 3px)," +
                                    "radial-gradient(circle at 70% 60%, rgba(255,255,255,0.25) 0 2px, transparent 3px)," +
                                    "radial-gradient(circle at 40% 80%, rgba(255,255,255,0.2) 0 2px, transparent 3px)",
                            }}
                        />
                    </Box>

                    {/* Profile row */}
                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                        <Box
                            sx={{
                                width: 72,
                                height: 72,
                                borderRadius: 3,
                                border: `2px solid ${Theme.palette.secondary.dark}`,
                                background: "rgba(0,0,0,0.18)",
                                display: "grid",
                                placeItems: "center",
                                overflow: "hidden",
                                flexShrink: 0,
                            }}
                        >
                            {/* ✅ use same image as your profile button for now */}
                            <img
                                src={require("../assets/profile_icon.png")}
                                alt="profile"
                                style={{ width: 52, height: 52, objectFit: "contain" }}
                            />
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <Typography
                                sx={{
                                    color: "#fff",
                                    fontWeight: 900,
                                    fontSize: 18,
                                    textShadow:
                                        "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                                }}
                            >
                                {player.name}
                            </Typography>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}>
                                <CircleIcon
                                    sx={{
                                        fontSize: 10,
                                        color: player.isOnline ? "#47ff5a" : "#ff4d4d",
                                        filter: "drop-shadow(0 0 4px rgba(0,0,0,0.6))",
                                    }}
                                />
                                <Typography sx={{ color: "#ffffffcc", fontSize: 13, fontWeight: 800 }}>
                                    {player.isOnline ? "Online" : "Offline"}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Stats section */}
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 2.5,
                            border: `2px solid ${Theme.palette.secondary.dark}`,
                            background: "rgba(0,0,0,0.18)",
                            display: "grid",
                            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                            gap: 1.25,
                        }}
                    >
                        <StatRow label="Played Matches" value={player.stats.playedMatches} />
                        <StatRow label="W - L" value={player.stats.wl} />
                        <StatRow label="Highest Multiplier" value={player.stats.highestMultiplier} />
                        <StatRow label="Nemesis" value={player.stats.nemesis} />
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

function StatRow({ label, value }) {
    return (
        <Box
            sx={{
                p: 1.25,
                borderRadius: 2,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
            }}
        >
            <Typography sx={{ color: "#ffffffcc", fontSize: 13, fontWeight: 900 }}>
                {label}
            </Typography>
            <Typography
                sx={{
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 900,
                    textShadow:
                        "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}
