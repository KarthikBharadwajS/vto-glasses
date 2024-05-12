import path from "path";
import { defineConfig, UserConfig, ConfigEnv } from "vite";
import resolve from "@rollup/plugin-node-resolve";

export default defineConfig((env: ConfigEnv): UserConfig => {
  const common: UserConfig = {
    server: {
      port: 5000,
    },
    root: "./",
    base: "/",
    publicDir: "./public",
    resolve: {
      extensions: [".ts", ".js"],
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: "modules",
      assetsDir: "assets",
      outDir: "./dist",
      sourcemap: env.mode == "development" ? true : false,
      chunkSizeWarningLimit: 1000, // Adjust this limit to your needs, the default is 500 kB
      rollupOptions: {
        output: {
          plugins: [resolve()],
          minifyInternalExports: true,
          manualChunks(id) {
            if (id.includes("node_modules")) {
              // Keep tensorflow as a separate chunk
              if (id.includes("@tensorflow")) return "tensor";

              // Keep threejs as a separate chunk
              if (id.includes("three")) return "three";

              // Default vendor chunk for rest of the code + small libraries
              return "vendor";
            }
          },
        },
      },
    },
  };
  return common;
});
