# Kotoba Miner 2.2 — Interface & site controls

This ZIP contains the complete unpacked Opera / Chromium extension, not just tests.

## Update existing installation
1. Back up your current Kotoba extension folder.
2. Replace files **inside that same loaded folder** with the contents of `Kotoba-Miner-v2.2`.
3. Open `opera://extensions`, click **Reload**, refresh open video pages.
4. Kotoba is now **OFF by default on sites without an explicit opt-in**. Click the extension toolbar icon and press **Enable** for YouTube/Netflix, or use **Universal Subtitle Reader → Enable on this site** for other websites requiring permission.

## Changes
- Study logo/menu disappears completely when the current site is disabled.
- The floating study menu now contains only transcript access, comprehension tracker, six live theme selectors, Studio/dashboard/settings. Older keyboard/video functionality remains in advanced settings.
- Fixed low-contrast text in the floating menu across six themes.
- Redesigned hover dictionary, full dictionary and card creation with softer theme-aware translucent surfaces and original SVG controls. Learning status buttons are no longer visible in these panels; existing status shortcuts and underlying vocabulary progress remain unchanged.
- SVG arrow controls bundled as code and rendered locally; no external images or generated images required.

## Notes
- 'Disabled by default' is for video controls on YouTube/Netflix and other video websites. Wikipedia Reader continues to use its separate website access rules.
- If your site was explicitly enabled earlier, its previous preference remains; use the toolbar to disable it.
- You may need to refresh existing pages for the newly loaded extension styling to take effect.
