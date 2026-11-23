/// <reference types="vite/client" />

declare module "virtual:brand" {
  import type { BrandFile } from "../../../schema/validate-brand.mjs";
  export const brand: BrandFile;
}

interface ImportMetaEnv {
  readonly VITE_FORM_ENDPOINT?: string;
}
