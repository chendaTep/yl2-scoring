import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // IMPORTANT: change "yl2-scoring" below to match your GitHub repo name
  // exactly (case-sensitive). This tells the built site where it will
  // live: https://YOUR-USERNAME.github.io/yl2-scoring/
  base: "/yl2-scoring/",
});
