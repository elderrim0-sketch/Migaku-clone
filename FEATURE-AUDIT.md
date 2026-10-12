# Kotoba 2.0 feature audit — public Migaku research (October 2026)

This comparison uses Migaku's public product description, Chrome Web Store listing, 2026 changelog and publicly shown UI. It documents functional inspirations only. No Migaku logos, icons, app screenshots, theme source, proprietary dictionaries, source code or textual UI copy are included in Kotoba.

Primary public references:
- https://migaku.com/faq/features
- https://migaku.com/faq/goals
- https://migaku.com/blog/changelog
- https://chromewebstore.google.com/detail/migaku-really-learn-langu/lkhiljgmbeecmljiogckofcalncmfnfo

| Capabilities | Kotoba 2.0 state | Notes |
|---|---|---|
| Japanese subtitles and word lookup on YouTube | Existing | Player-dependent tracks / screenshot constraints |
| Native Japanese TTS and optional VOICEVOX | Existing | User-installed local voice may be needed |
| Subtitle browser, search, i+1 suggestions | Existing | i+1 heuristic, not full morphological model |
| Japanese/English subtitles and shortcut cycle | Existing | English track required; external translation only opt-in |
| Streaming-site captions and embedded frames | Existing, best effort | Explicit per-domain access, DRM restrictions |
| Website word-hover reader | Existing | Wikipedia/Wiktionary plus approved sites |
| Anki card creation with audio/screenshot where accessible | Existing | Local AnkiConnect; media capture site-dependent |
| Anki mature/tracked vocabulary sync | Existing | Limited word extraction, 6000 card scan |
| Dashboard + study streak | Existing | Browser-local activity, estimated active minutes |
| Full-page workspace/navigation | **New in v2.0** | Original Kotoba-specific layout |
| Vocabulary browser / bulk status edits / CSV | **New in v2.0** | Uses existing statuses + Anki sync |
| Local-document Japanese Reader | **New in v2.0** | TXT, HTML, SRT and VTT, page navigation, dictionary, Anki card save |
| Video study modes | **New in v2.0** | Free watch, New-word focus, Listen first, Sentence steps |
| Export/restore local study records | **New in v2.0** | Explicit, excludes credentials, browser permissions, Anki cards |
| Native Japanese morphological analyzer | Not yet | Current `Intl.Segmenter` plus heuristics |
| EPUB Reader | Not yet | Reader currently supports text/HTML/subtitles only |
| Automatic subtitles for missing tracks | Not yet | Would require transcription model/service; not included |
| Offline dictionary packs and full frequency corpora | Not yet | Jisho + small fallback; optional accent dataset |
| Mobile native app and integrated flashcard review scheduler | Not yet | Separate from this Opera extension; use Anki |
| Curated Japanese courses/media catalog | Not yet | Would require independently licensed material |
| Protected video captures / universal Netflix/Max/Disney reliability | Not guaranteed | No circumvention of DRM/protected frames |

## Design direction
A unique Kotoba interface: Japanese character navigation, calm ink/cream/pastel study surfaces, compact side menu and clear vocabulary states. Reusable conventional UX patterns are fine, but don't copy Migaku screen layouts pixel for pixel or use its product artwork, icon set, text, assets or proprietary datasets.

## Technical limit
Automated browser tests with mocked storage and Anki confirmed Kotoba Studio UI actions and playback mode switches. Testing the entire extension in Opera with live video and a local Anki installation still requires manual verification.
