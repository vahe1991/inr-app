const fs = require("node:fs");
const path = require("node:path");
const { withAndroidManifest, withDangerousMod } = require("expo/config-plugins");

/**
 * `expo prebuild` moves MainActivity/MainApplication into the configured package
 * directory but leaves the template's `package com.app` header, so the generated
 * BuildConfig class cannot be resolved and `:app:compileDebugKotlin` fails.
 *
 * Also keeps the keyboard from resizing/panning the window so auth screens can
 * scroll under the keyboard instead of jumping.
 */
module.exports = function withAndroidMainPackage(config) {
  config = withAndroidManifest(config, (androidConfig) => {
    const activities =
      androidConfig.modResults.manifest.application?.[0]?.activity ?? [];

    for (const activity of activities) {
      if (activity.$?.["android:name"] === ".MainActivity") {
        activity.$["android:windowSoftInputMode"] = "adjustNothing";
      }
    }

    return androidConfig;
  });

  return withDangerousMod(config, [
    "android",
    (androidConfig) => {
      const androidPackage = androidConfig.android?.package;

      if (!androidPackage) return androidConfig;

      const sourceDir = path.join(
        androidConfig.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "java",
        ...androidPackage.split("."),
      );

      for (const fileName of ["MainActivity.kt", "MainApplication.kt"]) {
        const filePath = path.join(sourceDir, fileName);

        if (!fs.existsSync(filePath)) continue;

        const contents = fs.readFileSync(filePath, "utf8");
        const patched = contents.replace(
          /^package .+$/m,
          `package ${androidPackage}`,
        );

        if (patched !== contents) fs.writeFileSync(filePath, patched);
      }

      return androidConfig;
    },
  ]);
};
