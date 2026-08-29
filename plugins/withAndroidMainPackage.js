const fs = require("node:fs");
const path = require("node:path");
const { withAndroidManifest, withDangerousMod } = require("expo/config-plugins");

/**
 * `expo prebuild` moves MainActivity/MainApplication into the configured package
 * directory but leaves the template's `package com.app` header, so the generated
 * BuildConfig class cannot be resolved and `:app:compileDebugKotlin` fails.
 *
 * Also keeps the keyboard from resizing/panning the window so auth screens can
 * scroll under the keyboard instead of jumping, and disables Android backup.
 */
module.exports = function withAndroidMainPackage(config) {
  config = withAndroidManifest(config, (androidConfig) => {
    const application = androidConfig.modResults.manifest.application?.[0];

    if (application?.$) {
      application.$["android:allowBackup"] = "false";
      application.$["android:fullBackupContent"] = "false";
      application.$["android:dataExtractionRules"] =
        "@xml/data_extraction_rules";
    }

    const activities = application?.activity ?? [];

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

      const xmlDir = path.join(
        androidConfig.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res",
        "xml",
      );
      fs.mkdirSync(xmlDir, { recursive: true });
      fs.writeFileSync(
        path.join(xmlDir, "data_extraction_rules.xml"),
        `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
        <exclude domain="root" />
        <exclude domain="file" />
        <exclude domain="database" />
        <exclude domain="sharedpref" />
        <exclude domain="external" />
    </cloud-backup>
    <device-transfer>
        <exclude domain="root" />
        <exclude domain="file" />
        <exclude domain="database" />
        <exclude domain="sharedpref" />
        <exclude domain="external" />
    </device-transfer>
</data-extraction-rules>
`,
      );

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
