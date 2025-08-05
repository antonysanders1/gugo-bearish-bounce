import { createTheme } from "@mui/material/styles";

export const theme = {
    palette: {
        primary: {
            main: "#53B24F", // forest green
            dark: "#3B8539", // deeper foliage
            light: "#91E081", // leaf highlights
        },
        secondary: {
            main: "#F4A940", // earthy orange (duck's beak/feet)
            dark: "#B96E1E",
            light: "#FFD79A",
        },
        tirciary: {
            main: "#76462E", // tree bark brown
            dark: "#4B2F1D",
            light: "#A47151",
        },
        text: {
            main: "#1A1A1A", // dark neutral
            dark: "#000000",
            light: "#FFFFFF",
        },
        border: {
            main: "#FFE285", // highlight for UI edges
            dark: "#C8A400",
            light: "#FFF7C7",
        },
        error: {
            main: "#D32F2F",
            dark: "#9A0007",
            light: "#FF6659",
        },
        warning: {
            main: "#FFA000",
            dark: "#C67100",
            light: "#FFECB3",
        },
        info: {
            main: "#29B6F6", // accent for buttons or UI
            dark: "#0288D1",
            light: "#B3E5FC",
        },
        success: {
            main: "#66BB6A",
            dark: "#338a3e",
            light: "#C8E6C9",
        },
        black: "#000000",
        white: "#FFFFFF",
        grey: {
            main: "#8C8C8C",
            light: "#DADADA",
            dark: "#5C5C5C",
        },
    },
    typography: {
        fontFamily: `"Cherry Bomb One", system-ui`,
    },
    zIndex: {
        mobileStepper: 1000,
        fab: 1050,
        speedDial: 1050,
        appBar: 1100,
        drawer: 1200,
        modal: 1300,
        snackbar: 1400,
        tooltip: 1500,
        toast: 9999,
    },
};
