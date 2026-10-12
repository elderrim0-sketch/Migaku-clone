# Kotoba Miner v2.4 — Transcript & Audio Polish

This release keeps all v2.3 features and saved settings while improving subtitle-reading ergonomics.

- **Compact transcript:** Smaller Japanese dialogue rows; long live lines are folded to three lines and have **More/Less** to expand. Original cue text remains available for Anki.
- **Less repetitive live captions:** An expanding text overlay updates the existing subtitle line instead of creating a new row on every partial update. This cannot reconstruct a full subtitle file from a live-capture-only player.
- **Smart context for cards:** The word's own Japanese sentence is chosen. If subtitles split a single sentence across adjacent cues, they are joined conservatively; unrelated earlier finished sentences are not added. The sentence stays editable in the card creator.
- **Source audio:** On user-initiated Q card saves or scene captures from accessible HTML5 players, record around the chosen subtitle sentence, with light padding and a target of at least 5 seconds for very short clips. Audio may still fail on protected/embedded players.
- **Subtitle timing:** **語 → Subtitle timing**; `−` makes subtitles 0.25 s earlier, `+` makes them 0.25 s later, and `↺` restores Auto. Auto defaults to +0.35 s for live-caption capture and 0 for timed tracks. The setting is local, persistent, and also shifts optional capture timing.
- **Known underline:** Thick green underline, consistent with red unknown styling.

## Install
Back up your active Kotoba folder, extract the ZIP, copy **contents of Kotoba-Miner-v2.4** into your existing extension folder, replacing files. Visit `opera://extensions`, press Reload, and refresh your video site. Do **not** remove and reinstall the extension if you want to retain its storage identity.

## Limitations
Accuracy depends on subtitle cue timestamps; for live overlays the start/end times are estimates. Sentence grouping uses conservative punctuation and timing heuristics, not a full grammatical parser. Source audio requires a player with accessible media tracks and permission to use them; it does not bypass DRM. Test in Opera and check card media before relying on it.
