import { Config } from "@remotion/cli/config";

// JPEG frames are faster to encode than PNG and visually identical for
// opaque, full-bleed video like this.
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// brand/brand.yaml is imported as raw text by src/brand.ts and parsed there.
Config.overrideWebpackConfig((config) => ({
  ...config,
  module: {
    ...config.module,
    rules: [...(config.module?.rules ?? []), { test: /\.ya?ml$/, type: "asset/source" }],
  },
}));
