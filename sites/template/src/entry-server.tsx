// Used only at build time by scripts/*.mjs (compiled to build/ssr/).
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { App } from "./App";

export { faviconSvg, ogSvg } from "./icons";
export { absolute, findRoute, headTags, llmsTxt, routes, schemaFor, siteName, siteUrl } from "./site";

export function render(path: string): string {
  return renderToString(<StrictMode><App path={path} /></StrictMode>);
}
