import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { brandPlugin } from "./vite/brand.ts";

export default defineConfig({
  plugins: [brandPlugin(), react(), tailwindcss()],
});
