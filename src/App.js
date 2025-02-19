import React, { useState, useEffect, createContext } from "react";
import {
  Grid,
  Container,
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  FormGroup,
  FormControlLabel,
  Link,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Drawer,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import { Route, Routes, useNavigate } from "react-router-dom";
import {
  setCurrentUser,
  clearCurrentUser,
  setUserData,
  setUserDataSets,
  setUserPresets,
} from "./globalState/authActions";
import { useDispatch, useSelector } from "react-redux";
import { auth, db } from "./config/firebaseConfig";
import { theme as defaultTheme } from "./Theme";
import Toast from "./components/Toast";
import SplashScreen from "./views/SplashScreen";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import HomeScreen from "./views/HomeScreen";
import MenuBar from "./components/MenuBar";
import AboutScreen from "./views/AboutScreen";
import ContactScreen from "./views/ContactScreen";
import AuthScreen from "./views/LoginScreen";
import MobileNavBar from "./components/MobileNavBar";

export let MainContext = createContext({});

function App() {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.userData);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(true);
  const [info, setInfo] = useState(false);
  const [message, setMessage] = useState("Welcome!");
  const [deviceType, setDeviceType] = useState(null);

  const values = {
    loading,
    setLoading,
    error,
    setError,
    success,
    setSuccess,
    info,
    setInfo,
    message,
    setMessage,
    defaultTheme,
    dispatch,
    userData,
    navigate,
    deviceType
  };

  useEffect(() => {
    if (!!loading) {
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }
    if (!deviceType) {
      setDeviceType(window.innerWidth < 768 ? "mobile" : "desktop");
    }
  }, []);

  return (
    <MainContext.Provider value={values}>
      <ThemeProvider theme={createTheme(defaultTheme)}>
        <div
          className="App"
          style={{
            height: "100dvh",
            position: "relative",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Toast />
          {loading ? (
            <SplashScreen />
          ) : (
            <Grid item container xs={12} style={{ height: "100%" }}>
              {/* Other Components Here */}

              <Grid item container xs={12} style={{ height: 60, zIndex: 2 }}>
                <MenuBar navigate={navigate} />
              </Grid>

              <Grid
                item
                container
                xs={12}
                style={{ height: "calc(100dvh - 60px)", zIndex: 1 }}
              >
                <Routes>
                  <Route path="/" element={<HomeScreen />} />
                  <Route
                    path="/login"
                    element={<AuthScreen isLogin={true} />}
                  />
                  <Route
                    path="/register"
                    element={<AuthScreen isLogin={false} />}
                  />
                  <Route path="/about" element={<AboutScreen />} />
                  <Route path="/contact" element={<ContactScreen />} />
                </Routes>
              </Grid>

              {/* {deviceType === "mobile" && (
                <Grid item container xs={12} style={{ height: 60, zIndex: 1 }}>
                  <MobileNavBar userData={userData} navigate={navigate} />
                </Grid>
              )} */}
            </Grid>
          )}
        </div>
      </ThemeProvider>
    </MainContext.Provider>
  );
}

export default App;
