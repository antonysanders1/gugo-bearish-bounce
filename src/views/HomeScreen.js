import { Grid } from "@mui/material";
import React from "react";
import Main from "../components/Main";
import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";


const queryClient = new QueryClient();

const config = createConfig({
  chains: [abstractTestnet],
  transports: {
    [abstractTestnet.id]: http("https://api.testnet.abs.xyz"),
  },
});

const HomeScreen = () => {
  return (

    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>

        <AbstractWalletProvider chain={abstractTestnet}>
          <Grid item container xs={12}>
      <Main/>
    </Grid>
        </AbstractWalletProvider>
      </WagmiProvider>
    </QueryClientProvider>
   
  );
};

export default HomeScreen;
