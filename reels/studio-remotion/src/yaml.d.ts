// brand/brand.yaml is imported as plain text (webpack rule in remotion.config.ts).
declare module "*.yaml" {
  const text: string;
  export default text;
}
