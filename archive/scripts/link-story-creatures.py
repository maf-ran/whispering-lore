#!/usr/bin/env python3
"""Link unlinked stories to creatures via name matching.

Phase 1 — Exact match: story title (or its part before separators) matches a
creature name or alt_name. Strips leading articles. Uses unicode NFKD
normalization for proper accent handling.

Phase 2 — First-word match: a single-word creature name equals the first word
of the story title (word >= 5 chars, not a generic type).

Phase 3 — Word-sequence containment: a multi-word creature name (>=2 words,
each >= 2 chars) appears as complete contiguous words within the story title.
"""

import json
import re
import shutil
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STORY_FILE = ROOT / "data" / "datasets" / "stories.json"
CREATURE_FILE = ROOT / "data" / "datasets" / "creatures.json"

stories = json.loads(STORY_FILE.read_text())
creatures = json.loads(CREATURE_FILE.read_text())

GENERIC_NAMES = {
    "ghost", "spirit", "troll", "giant", "devil", "fairy", "demon",
    "dragon", "witch", "shaman", "werewolf", "lizard", "rabbit",
    "coyote", "turtle", "bear", "wolf", "fox", "frog", "serpent",
    "snake", "spider", "eagle", "owl", "trickster", "ogre", "goblin",
    "orc", "elf", "dwarf", "monster", "beast", "animal", "bird",
    "fish", "horse", "cat", "dog", "rat", "pig", "cow", "goat",
    "whale", "shark", "dolphin", "lion", "tiger", "panther",
    "leopard", "cheetah", "hyena", "jackal", "baboon", "monkey",
    "ape", "gorilla", "chimpanzee", "elephant", "rhino", "hippo",
    "crocodile", "alligator", "tortoise", "parrot", "peacock",
    "rooster", "chicken", "duck", "goose", "swan", "crane",
    "stork", "heron", "pelican", "seagull", "crow", "raven",
    "magpie", "jay", "finch", "sparrow", "swallow", "dove",
    "pigeon", "bat", "moth", "butterfly", "bee", "wasp", "ant",
    "termite", "beetle", "ladybug", "dragonfly", "grasshopper",
    "cricket", "scorpion", "centipede", "worm", "leech", "slug",
    "snail", "clam", "oyster", "crab", "lobster", "shrimp",
    "mermaid", "centaur", "satyr", "faun", "pegasus", "unicorn",
    "griffin", "phoenix", "chimera", "hydra", "basilisk",
    "cockatrice", "wyvern", "kraken", "leviathan", "behemoth",
    "ziz", "roc", "thunderbird", "pixie", "sprite", "nymph",
    "dryad", "naiad", "oread", "hamadryad", "sylph", "undine",
    "salamander", "golem", "zombie", "skeleton", "mummy",
    "vampire", "frankenstein", "incubus", "succubus",
    "harpy", "siren", "gorgon", "medusa", "cyclops",
    "minotaur", "cerberus", "sphinx", "chimera",
    "valkyrie", "banshee", "leprechaun", "gnome",
    "imp", "fiend", "hag", "crone", "witch",
    "warlock", "sorcerer", "mage", "wizard",
}


def normalize(s: str) -> str:
    """NFKD-normalize and strip non-ASCII, producing clean ASCII."""
    nfkd = unicodedata.normalize("NFKD", s)
    ascii_bytes = nfkd.encode("ascii", "ignore")
    return re.sub(r"[^a-zA-Z0-9 ]", "", ascii_bytes.decode().strip().lower())


ARTICLES = {"the", "el", "la", "le", "der", "die",
            "das", "los", "las", "les", "il", "lo", "gli"}


def title_candidates(title: str) -> set:
    """Generate all candidate name forms from a story title."""
    cands = set()
    t = title.strip()
    cands.add(normalize(t))

    for sep in [": ", " – ", " — ", " - ", " (", " / "]:
        if sep in t:
            part = normalize(t.split(sep)[0])
            cands.add(part)
            # Strip leading article from part
            pwords = part.split()
            if pwords and pwords[0] in ARTICLES:
                cands.add(" ".join(pwords[1:]))

    return cands


# ---- Build creature index ----

exact_idx = {}       # normalized name → [(slug, name)]
contain_idx = {}     # multi-word name → (slug, name)
first_word_names = {}  # single-word name (≥5 chars, non-generic) → [(slug, name)]

for c in creatures:
    name = c.get("name", "").strip()
    slug = c.get("slug", "")

    norm = normalize(name)
    norm_words = norm.split()
    entries = [(slug, name)]

    # Phase 1: exact match
    exact_idx.setdefault(norm, []).extend(entries)
    for part in re.split(r"[\(\)\[\]]", name):
        p = normalize(part)
        if p and p != norm:
            exact_idx.setdefault(p, []).extend(entries)
    for alt in c.get("alt_names", []):
        exact_idx.setdefault(normalize(alt), []).extend(entries)

    # Index the main name (before parenthetical) separately
    main_name = re.split(r"\s*[\(\[\{]", name)[0].strip()
    main_norm = normalize(main_name)
    if main_norm != norm and main_norm:
        exact_idx.setdefault(main_norm, []).extend(entries)

    # Phase 2: first-word match (single-word creature names, non-generic)
    if len(norm_words) == 1 and len(norm) >= 4 and norm not in GENERIC_NAMES:
        first_word_names.setdefault(norm, []).extend(entries)
    # Also index the main name (without parenthetical)
    if main_norm and main_norm != norm and len(main_norm.split()) == 1 and len(main_norm) >= 4 and main_norm not in GENERIC_NAMES:
        first_word_names.setdefault(main_norm, []).extend(entries)

    # Phase 3: multi-word containment
    if len(norm_words) >= 2 and all(len(w) >= 2 for w in norm_words):
        contain_idx[norm] = (slug, name)


# ---- Apply links ----

unlinked = [s for s in stories if not s.get("creatures")]
print(f"Unlinked stories: {len(unlinked)}")

linked_p1 = 0
linked_p2 = 0
linked_p3 = 0

for s in unlinked:
    title = s.get("title", "").strip()
    title_norm = normalize(title)
    title_words = title_norm.split()
    matched = set()

    # Phase 1
    for cand in title_candidates(title):
        if cand and len(cand) >= 2 and cand in exact_idx:
            for slug, _ in exact_idx[cand]:
                matched.add(slug)

    if matched:
        linked_p1 += 1
        s["creatures"] = list(matched)
        print(f"  [P1] → {', '.join(matched)}")
        continue

    # Phase 2: first word
    if title_words:
        first = title_words[0]
        if first in first_word_names:
            for slug, _ in first_word_names[first]:
                matched.add(slug)

    if matched:
        linked_p2 += 1
        s["creatures"] = list(matched)
        print(f"  [P2] {s['title'][:52]:52s} → {', '.join(matched)[:50]}")
        continue

    # Phase 3: word sequence containment
    for norm_name, (slug, _) in contain_idx.items():
        nwords = norm_name.split()
        for i in range(len(title_words) - len(nwords) + 1):
            if title_words[i:i + len(nwords)] == nwords:
                matched.add(slug)
                break

    if matched:
        linked_p3 += 1
        print(f"  [P3] {s['title'][:52]:52s} → {', '.join(matched)[:50]}")
        s["creatures"] = list(matched)

print(f"\nPhase 1 (exact match): {linked_p1}")
print(f"Phase 2 (first-word match): {linked_p2}")
print(f"Phase 3 (word-seq containment): {linked_p3}")
print(f"Total: {linked_p1 + linked_p2 + linked_p3}")
print(f"Remaining unlinked: {len(unlinked) - linked_p1 - linked_p2 - linked_p3}")

# Save
backup = STORY_FILE.with_suffix(".backup3.json")
if not backup.exists():
    shutil.copy2(STORY_FILE, backup)
    print(f"Backup: {backup}")

STORY_FILE.write_text(json.dumps(stories, indent=2, ensure_ascii=False))
print(f"Saved {len(stories)} stories")
