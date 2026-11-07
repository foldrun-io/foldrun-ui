// The package's own test bed: demo/ renders every component once, so CI
// can typecheck and build them the way a consuming site would. Not part of
// what is published (package.json "files").
import { defineConfig } from "astro/config";
import tailwind from "@tailwindcss/vite";

export default defineConfig({
  srcDir: "./demo",
  site: "https://ui.foldrun.invalid",
  vite: { plugins: [tailwind()] },
});
