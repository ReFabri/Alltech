import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000/",
        // Configuration to receive info about
        // the request success or failure.
        //
        // configure: (proxy, _options) => {
        //   proxy.on("error", (err, _req, _res) => {
        //     console.log("PROXY ERROR", err);
        //   });
        //   proxy.on("proxyReq", (proxyReq, req, _res) => {
        //     console.log("Sending Request to the Target:", req.method, req.url);
        //   });
        //   proxy.on("proxyRes", (proxyRes, req, _res) => {
        //     console.log(
        //       "Received Response from the Target:",
        //       proxyRes.statusCode,
        //       req.url
        //     );
        //   });
        // },
      },
    },
  },
});
