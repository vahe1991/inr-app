const fs = require("node:fs");
const path = require("node:path");
const { withAndroidStyles, withDangerousMod } = require("expo/config-plugins");

const SPLASH_SRC = path.join("assets", "images", "brand-img.png");

function upsertStyleItem(items, name, value) {
  const existing = items.find((item) => item.$?.name === name);

  if (existing) {
    existing._ = value;
    return;
  }

  items.push({ $: { name }, _: value });
}

/**
 * Android 12+ SplashScreen API always masks the icon in a circle.
 * Replace that circular logo with a matching white shape and show the
 * splash image as a full-bleed window background instead.
 */
module.exports = function withFullScreenSplash(config) {
  config = withAndroidStyles(config, (androidConfig) => {
    const styles = androidConfig.modResults.resources.style ?? [];
    const splashStyle = styles.find(
      (style) => style.$?.name === "Theme.App.SplashScreen",
    );

    if (splashStyle) {
      const items = splashStyle.item ?? [];

      upsertStyleItem(
        items,
        "android:windowBackground",
        "@drawable/splashscreen_fullscreen",
      );
      upsertStyleItem(
        items,
        "windowSplashScreenBackground",
        "@color/splashscreen_background",
      );
      upsertStyleItem(
        items,
        "windowSplashScreenAnimatedIcon",
        "@drawable/splashscreen_logo",
      );
      upsertStyleItem(
        items,
        "windowSplashScreenIconBackgroundColor",
        "@color/splashscreen_background",
      );
      upsertStyleItem(
        items,
        "android:windowSplashScreenIconBackgroundColor",
        "@color/splashscreen_background",
      );

      splashStyle.item = items;
    }

    return androidConfig;
  });

  return withDangerousMod(config, [
    "android",
    (androidConfig) => {
      const projectRoot = androidConfig.modRequest.projectRoot;
      const resDir = path.join(
        androidConfig.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res",
      );
      const drawableDir = path.join(resDir, "drawable");
      const mdpiDir = path.join(resDir, "drawable-mdpi");
      const splashSrc = path.join(projectRoot, SPLASH_SRC);

      fs.mkdirSync(drawableDir, { recursive: true });
      fs.mkdirSync(mdpiDir, { recursive: true });
      fs.copyFileSync(splashSrc, path.join(mdpiDir, "splash_fullscreen.png"));

      const nodpiLogo = path.join(resDir, "drawable-nodpi", "splash_fullscreen.png");
      if (fs.existsSync(nodpiLogo)) fs.unlinkSync(nodpiLogo);

      fs.writeFileSync(
        path.join(drawableDir, "splashscreen_fullscreen.xml"),
        `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splashscreen_background" />
    <item android:gravity="center">
        <bitmap
            android:gravity="center"
            android:src="@drawable/splash_fullscreen" />
    </item>
</layer-list>
`,
      );

      fs.writeFileSync(
        path.join(drawableDir, "splashscreen_logo.xml"),
        `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
    <solid android:color="@color/splashscreen_background" />
</shape>
`,
      );

      for (const entry of fs.readdirSync(resDir)) {
        if (!entry.startsWith("drawable-")) continue;

        const logoPath = path.join(resDir, entry, "splashscreen_logo.png");
        if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
      }

      return androidConfig;
    },
  ]);
};
