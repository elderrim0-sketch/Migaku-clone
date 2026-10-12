# Kotoba Miner v1.12.8 — Hold a modifier to look up Japanese

**New default:** Hold **Alt** while hovering over a Japanese subtitle or word to open the floating dictionary. You can also hover first and then hold Alt. Normal mouse hover highlights the study word for your Existing Known / Learning / Track / Unknown / Ignore shortcuts **without opening the dictionary**.

**Change the shortcut:** Open **Kotoba settings → Immersion → Open word dictionary with**. Choose Alt, Ctrl, Shift, Alt+Shift, Ctrl+Shift, Ctrl+Alt, or Hover only (the old behaviour). This one preference applies to YouTube, approved universal-video websites and Wikipedia/Wiktionary Reader. Alt is the initial default, with your selection remembered in Opera extension storage. Mouse clicking continues to open the usual full dictionary/card tools; keyboard tab focus remains accessible.

**Separate feature:** Pause playback on word hover is still independently configurable. If you don't want videos to pause when you move the mouse over words, switch it off in Immersion settings. The Q and Alt+Shift+1–5 vocabulary status shortcuts are unchanged.

**Install:** Back up the current unpacked extension folder, copy the files from this ZIP over the existing folder without removing the extension, reload at `opera://extensions`, and refresh open video/article tabs. Previously approved universal-video and Reader site scripts will need that refresh to pick up the new shared hover module. Settings and study data remain in Opera's storage.

**Caveat:** Some browsers and operating systems intercept Alt or other modifier combinations; you can select another modifier if that happens.

---

# Kotoba Miner v1.12.6 — Cleaner transcript sidebar

This small update **removes the word-status colour legend from the transcript sidebar**. It does not change the red underline for unseen words, purple tracked/Anki words, orange learning words, or subtle green known words. Dictionary and pitch-colour behaviour remains unchanged.

## Updating

1. Copy the contents of this release into your existing unpacked Kotoba extension folder, replacing the old files (do not remove the extension from Opera).
2. In `opera://extensions`, click **Reload** on Kotoba.
3. Refresh your open YouTube and video website tabs.

Your existing vocabulary states, Anki sync settings, streaks, and other settings remain in browser storage.

---

## Previous v1.12.5 release notes

# Kotoba Miner v1.12.5 — Unknown by default / Anki tracking

## Changes in this release

- **Unseen words are red-underlined automatically** on video captions, transcript lines and Website Reader articles. A word is unseen if it does not match any manually classified word or synced Japanese Anki vocabulary. Kotoba does **not** store every word you merely encounter as tracked.
- **Instant tracking:** saving a Kotoba → Anki card marks its vocabulary as tracked as soon as Anki confirms the save. Failed saves never mark a word as tracked.
- **Anki presence means tracked:** all recognizable Japanese vocabulary cards in your selected Anki decks count as tracked, **even if new/unreviewed**. Cards with review intervals of at least 21 days are shown as known (estimate). Existing manual **Known**, **Track**, **Learning**, **Unknown** and **Ignore** choices take priority over Anki.
- **Colour legend:** red = unseen/unknown; purple = tracked/Anki; orange dotted = manually learning; green subtle = known; muted = ignored. Word *text* can still be coloured for Tokyo pitch accent. These underline colours identify vocabulary status, not accent.
- **i+1 updates:** both tracked/learning and unseen words count as not yet known. A manually tracked word no longer gets counted as a completely unseen term in the status model, but still contributes to sentence difficulty until known.
- **Sync Anki again after updating.** The previous version queried reviewed cards only, so brand-new Anki cards may not yet be represented in local Kotoba storage. Use the extension popup → Anki → **Sync my Anki vocabulary now** with Anki Desktop open. If auto-sync is enabled, it will also update periodically.
- The Anki scan still has a **6,000-card cap** and recognizes short Japanese word fields; sentence-only or unusual card templates may be skipped. Morphological parsing is still heuristic, so an inflected word may occasionally be falsely flagged as unseen. You can manually mark or track it.

## Install

1. Back up the current extension folder. Extract the ZIP, copy the new files **into the existing unpacked extension folder**, keeping the extension ID so saved settings and streak history stay intact.
2. Open `opera://extensions` and **Reload** Kotoba, then refresh your open videos or Wikipedia tabs.
3. Open Anki Desktop and click **Sync my Anki vocabulary now** in Kotoba's extension settings.
4. Test with a Japanese subtitle: an unseen term should have a red underline, a new Anki term purple, a mature Anki term green, and a manually Learning term orange dotted.

**Notes:** This is an approximate, local word-coverage tool, not a measurement of actual fluency. It preserves the existing universal subtitle reader, Anki mining, dashboard and theme configuration. Kotoba doesn't provide DRM or inaccessible-caption workarounds.

---

## Previous v1.12.4 documentation (historical)

# Kotoba Miner v1.12.4 — Embedded Subtitle Centring Fix

Kotoba v1.12.4 keeps the working v1.11 immersion dashboard, YouTube/Netflix experimental readers, Japanese dictionary, pitch accents, word statuses, Q → Anki cards, and website reader. It adds **opt-in per-site Japanese video subtitle support** for other websites.

## What's fixed in v1.12.4

- When the approved Japanese-caption source is an iframe, Kotoba anchors its interactive overlay to the **visible embedded video player rectangle** instead of leaving it at the top-left corner.
- The popup and background pass the approved frame hostname to the layout resolver; it prefers a matching visible iframe, and uses a large-player fallback for redirected iframe URLs.
- Video centring follows the existing Subtitle Studio **Height above video bottom** setting, and adjusts on scrolling/resizing. The universal HTML5/YouTube centring implementation is retained.
- If an embedded player is temporarily removed during loading, interactive subtitles have a viewport-safe position rather than jumping to the top-left.

## Install without losing study data

1. Extract `kotoba-miner-v1.12.4.zip`.
2. If you already use Kotoba: copy the files **inside** `kotoba-miner-v1.12.4` into your current *unpacked extension folder*, replacing old files. Keep the existing folder and extension ID. This normally preserves Chrome/Opera extension-local Anki/deck settings and Kotoba study history. Back up that folder first.
3. Open `opera://extensions` or `chrome://extensions`, press **Reload** on Kotoba, and refresh your video page.
4. Open Kotoba's extension popup, scroll to **Universal Subtitle Reader**, and click **Enable on this site** while visiting the desired video website. Accept the browser's permission request for that specific origin.
5. Play a video that offers Japanese subtitles. Press **Check Japanese subtitles** to see whether Kotoba found a Japanese track. **If the video is embedded**, Kotoba now identifies the player's *separate* hostname under **Embedded video player domain**. Choose the correct player, press **Enable captions inside this player**, and approve Opera's additional permission prompt. Kotoba automatically reloads the page; turn Japanese captions back on if necessary. Re-open Kotoba's extension popup and press **Check Japanese subtitles** again.
6. Open the floating 語 button for the transcript and study tools.
7. If the video still has no accessible captions, open the transcript **⋯ Tools → Import SRT/VTT** and select a locally obtained subtitle file. Imported subtitle files are parsed locally.

Use **Try universal player demo ↗** inside the Universal section to test Kotoba's HTML5 caption detector with a bundled short video and Japanese WebVTT file.

## What the universal detector supports

- HTML5 `<video>` elements and **Japanese `TextTrack` / `<track>` subtitle or caption cues** (recognises `ja`, `ja-JP`, `jpn`, `Japanese`, and `日本語`). Can activate an available disabled Japanese track in `hidden` mode to read the cue text without forcing duplicate native captions.
- **Cross-origin embedded video player frames** after you explicitly approve the specific embedded-player domain. A lightweight frame script relays exposed Japanese subtitle cues and playback time to the main-page Kotoba sidebar; it does not modify the external player or attempt DRM bypass.
- Common **on-player subtitle overlays** visible as selectable text (e.g. Video.js, Plyr, JW Player, Shaka). Keeps partial lines captured during playback and flags them as **Live capture**.
- The existing transcript sidebar, interactive word hover/dictionary, pitch accent display, i+1 recommendations, Anki mining, and optional screenshot/source-audio attempts when the player exposes ordinary media.
- Subtitle import via **SRT/VTT** if no real-time text is exposed.

This is **not** a promise that any streaming service with Japanese CC is compatible. Some sites draw subtitles into a video/canvas, keep them in inaccessible or nested player frames or private player components, or use DRM. Kotoba doesn't circumvent these restrictions. Capturing screenshots or source audio can fail even when subtitle text works. Netflix remains experimental and Max/HBO isn't guaranteed.

## Site permissions and privacy

The Universal Reader is **not enabled on every website**. It asks for origin-specific permission from the popup when you opt in, registers the content scripts for that host, and remembers the site across visits. If the video lives in a separate iframe, it requests that **second host independently**; only that player frame gets the lightweight subtitle collector. Access to a separate player host is never silently granted when you enable the main page. Click **Disable on this site** to unregister Kotoba's video reader and release its player-host permission when no other enabled page still uses that player. Reload the page to remove previously injected visuals.

Caption discovery reads only player-accessible text and HTML5 cues. It does **not** record browsing activity or send subtitles to Kotoba servers. Existing optional services (e.g. dictionary lookup, machine translation if enabled, Ollama, AnkiConnect) behave as in v1.11.

## Development tests

- `node tests/embedded-frame-v1121.js` checks the iframe relay and permission gating.
- `node tests/universal-v112.js` checks track classification, cue extraction, site-permission wiring and manifest.
- Existing 24 Node regression suites cover Anki, dictionary, speech, Reader, themes, dashboard, pitch accents and Q cards.
- Isolated Chromium integration was exercised with `HTMLVideoElement.addTextTrack()` + Japanese `VTTCue`s and a visible subtitle overlay. A simulated browser popup test verified per-origin permission request, script registration, enable and disable.

**Still to verify on your computer:** this specific third-party embedded player, Opera permission prompts, nested/dynamically obfuscated iframes, live source audio, and DRM-specific behavior. Sites drawing subtitles on protected video/canvas remain unsupported; selecting Japanese CC alone does not guarantee readable text.


## v1.12.4 — one-click activation and aligned controls

- **One approval per site:** the permission request is recorded before Opera opens its browser permission prompt; the service worker finishes registering and enabling the main site even if the popup closes. Reopening Kotoba automatically scans for an embedded player.
- **One approval per embedded player domain:** same reliable flow; the video tab reloads automatically after permission is granted so captions are available immediately. Existing approvals are preserved.
- **No two-stage scan:** the settings popup scans immediately on opening (and retries a few times for late-loading iframes); Check Japanese subtitles remains available as a manual refresh.
- **Fixed close buttons:** header × and floating study-menu × have fixed, centred hit targets; menu position is clamped inside the viewport on non-YouTube sites.

If an embedded player still cannot show captions, the player may not expose subtitle text to extensions; this update does not change DRM or subtitle accessibility.

## v1.12.4: native captions and popup alignment

- On enabled **generic video** websites, **Hide the player’s original captions** is enabled by default. Leave the website's Japanese CC option **ON**. Kotoba attempts to make supported HTML subtitle overlays visually transparent while keeping their DOM text available for real-time capture. For standard HTML5 Japanese text tracks it switches `showing` to `hidden`, preserving readable cues.
- Toggle this behaviour from the floating 語 Study menu or **Extension settings → Universal Subtitle Reader**. It is not used on YouTube or Netflix.
- The feature cannot recover subtitles once a website's native CC is switched OFF and no accessible track remains. It also cannot hide captions burnt into the video or drawn on canvas, and unknown custom players may need an adapter.
- Improved hover dictionary placement and card-maker centring. Stored dragged positions remain respected; moving the header manually saves a site-specific location.


## v1.12.8 — Three subtitle languages (Alt + T)

Press **Alt + T** to cycle **Japanese only → Japanese + English → English only → Japanese only**. This shortcut is remappable in **Settings → Immersion → Custom keyboard shortcuts**, and the current mode is visible in the floating 語 menu and settings. English comes from a real English HTML5/WebVTT track, an embedded player with an accessible English track, or the currently exposed YouTube English caption track when fetchable. The original Japanese track remains selected for Kotoba word analysis and Anki mining. Translation text is not generated or sent anywhere unless **Allow sentence translation (hover or English fallback)** is explicitly enabled in settings. When enabled, Alt+T dual/English modes may send active Japanese subtitle lines to MyMemory if no readable English track exists. Where neither an accessible English track nor opt-in translation is available, English-only intentionally displays no subtitle text. No more MyMemory instructions on hovering Japanese captions.
