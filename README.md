# Kotoba Miner v2.3 — Familiar vocabulary + reviewed Anki sync

## Update without resetting data
1. Keep your current Kotoba extension installed and back up the extension folder.
2. Copy all contents of `Kotoba-Miner-v2.3` into that same existing installed folder.
3. In `opera://extensions`, click **Reload**, then refresh the video pages.
4. Open Anki Desktop, then **Kotoba settings → Anki vocabulary sync → Sync now**. Your previous v2.2 scan included unreviewed cards; this first v2.3 sync corrects the numbers.

## Accurate status rules
- **Known (green)**: explicitly marked known, or imported Anki card with a Good/Easy history and a current interval of at least 21 days.
- **Tracked (purple)**: manually tracked, or Anki card with at least one actual Good/Easy answer and an interval below 21 days.
- **Familiar**: total **unique Known + Tracked words**. Green words are not counted twice.
- **Unseen (red)**: no recognized reviewed Anki card or manual override.
- Manual Known/Track/Learning/Unknown/Ignore settings override Anki imports.
- Learning (orange) is kept separate from Familiar; this metric means specifically green + purple.
- Anki reviews are read using `getReviewsOfCards`, answer values **3 (Good) or 4 (Easy)**. Merely creating a card, pressing Again/Hard only, or having an unreviewed card in a deck does NOT count.
- A card imported through Kotoba is not marked Tracked until you answer it Good or Easy and sync again.

## Performance and limits
- AnkiConnect must be running with Anki Desktop. The first sync reads the review log for up to 6,000 reviewed cards in the selected decks. Review-history errors cause the sync to fail WITHOUT replacing your saved word lists.
- Japanese vocabulary field detection is heuristic; unusual card templates or sentences may be skipped.
- If automatic sync is enabled, the counts refresh approximately every 15 minutes while Anki Desktop is running, with an 8-minute cooldown.
- A review can make a word *Familiar* but does not prove comprehension. Studio and Dashboard display explicit Known vs Familiar counts.
- The separate single-deck mature-word importer also checks Good/Easy review history. It still adds those mature words to the local Known list as requested by its own button.

## Safety
Local, no cloud syncing. Your Anki cards are read only, never edited. Back up your Opera profile and Anki collection separately.
