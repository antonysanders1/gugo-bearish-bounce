// /src/game/BattleWalletModal.js
import React, { useContext, useState } from "react";
import {
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Button,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { MainContext } from "../App";

export default function BattleWalletModal({ open, onClose }) {
    const { Theme } = useContext(MainContext);
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

    const [mode, setMode] = useState("topup"); // "topup" | "withdraw"
    const isTopUp = mode === "topup";

    // design-only dummy values
    const [amount, setAmount] = useState(0.00032);
    const battleBalance = 0.00123;
    const walletBalance = 0.01234;
    const walletAddress = "0x1234…abcd";

    const fmtEth = (n) => {
        const v = Number(n || 0);
        if (v === 0) return "0";
        if (v < 1) return v.toFixed(5).replace(/0+$/, "").replace(/\.$/, "");
        return v.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
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
                    // keep your project theme vibe
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
                    Battle Wallet
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
                    <Typography sx={{ color: Theme.palette.text.light || "#fff", fontSize: 13, opacity: 0.9 }}>
                        Your dedicated in-game wallet for secure and instant ETH play.
                    </Typography>

                    {/* Toggle buttons (Top Up / Withdraw) */}
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1,
                            p: 0.75,
                            borderRadius: 2,
                            border: `2px solid ${Theme.palette.secondary.dark}`,
                            background: "rgba(0,0,0,0.18)",
                        }}
                    >
                        <Button
                            onClick={() => setMode("topup")}
                            fullWidth
                            sx={{
                                borderRadius: 2,
                                fontWeight: 900,
                                color: isTopUp ? "#fff" : "#ffffffcc",
                                background: isTopUp ? Theme.palette.primary.main : "rgba(255,255,255,0.08)",
                                border: `2px solid ${isTopUp ? Theme.palette.primary.dark : "transparent"}`,
                                textTransform: "none",
                            }}
                        >
                            Top Up
                        </Button>

                        <Button
                            onClick={() => setMode("withdraw")}
                            fullWidth
                            sx={{
                                borderRadius: 2,
                                fontWeight: 900,
                                color: !isTopUp ? "#fff" : "#ffffffcc",
                                background: !isTopUp ? Theme.palette.primary.main : "rgba(255,255,255,0.08)",
                                border: `2px solid ${!isTopUp ? Theme.palette.primary.dark : "transparent"}`,
                                textTransform: "none",
                            }}
                        >
                            Withdraw
                        </Button>
                    </Box>

                    {/* Balances row (design-only) */}
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr",
                            gap: 1,
                            alignItems: "center",
                        }}
                    >
                        <BalanceCard
                            title="Battle Wallet"
                            value={`${fmtEth(battleBalance)} ETH`}
                            Theme={Theme}
                        />

                        <Box sx={{ display: "grid", placeItems: "center" }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 999,
                                    display: "grid",
                                    placeItems: "center",
                                    border: `2px solid ${Theme.palette.secondary.dark}`,
                                    background: "rgba(0,0,0,0.18)",
                                }}
                            >
                                {isTopUp ? (
                                    <ArrowBackRoundedIcon sx={{ color: "#fff" }} />
                                ) : (
                                    <ArrowForwardRoundedIcon sx={{ color: "#fff" }} />
                                )}
                            </Box>
                        </Box>

                        <BalanceCard
                            title={`Wallet: ${walletAddress}`}
                            value={`${fmtEth(walletBalance)} ETH`}
                            Theme={Theme}
                        />
                    </Box>

                    {/* Amount stepper (design-only) */}
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 2.5,
                            border: `2px solid ${Theme.palette.secondary.dark}`,
                            background: "rgba(0,0,0,0.18)",
                        }}
                    >
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "48px 1fr 48px",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <IconButton
                                onClick={() => setAmount((a) => Math.max(0, Number((a - 0.00016).toFixed(5))))}
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 999,
                                    border: `2px solid ${Theme.palette.secondary.dark}`,
                                    background: "rgba(255,255,255,0.08)",
                                    color: "#fff",
                                }}
                            >
                                <RemoveRoundedIcon />
                            </IconButton>

                            <Box sx={{ textAlign: "center" }}>
                                <Typography
                                    sx={{
                                        fontSize: 34,
                                        fontWeight: 900,
                                        color: "#fff",
                                        textShadow:
                                            "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                                        lineHeight: 1.05,
                                    }}
                                >
                                    {fmtEth(amount)}
                                </Typography>
                                <Typography sx={{ color: "#ffffffcc", fontSize: 12 }}>ETH</Typography>
                            </Box>

                            <IconButton
                                onClick={() => setAmount((a) => Number((a + 0.00016).toFixed(5)))}
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 999,
                                    border: `2px solid ${Theme.palette.secondary.dark}`,
                                    background: "rgba(255,255,255,0.08)",
                                    color: "#fff",
                                }}
                            >
                                <AddRoundedIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Submit (design-only) */}
                    <Button
                        fullWidth
                        sx={{
                            height: 52,
                            borderRadius: 2,
                            fontWeight: 900,
                            fontSize: 16,
                            color: "#fff",
                            background: Theme.palette.primary.main,
                            border: `2px solid ${Theme.palette.primary.dark}`,
                            textTransform: "none",
                        }}
                        onClick={() => { }}
                    >
                        {isTopUp ? "Top Up" : "Withdraw"}
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

function BalanceCard({ title, value, Theme }) {
    return (
        <Box
            sx={{
                p: 1.5,
                borderRadius: 2.5,
                border: `2px solid ${Theme.palette.secondary.dark}`,
                background: "rgba(0,0,0,0.18)",
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
            }}
        >
            <Typography sx={{ color: "#ffffffcc", fontSize: 12, fontWeight: 800 }}>
                {title}
            </Typography>
            <Typography
                sx={{
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: 16,
                    textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}
