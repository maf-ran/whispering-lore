#!/usr/bin/env python3
"""Gate + merge translated overlay chunks into data/i18n/es/<type>-<region>.json.

Usage: gate-overlay.py <type> <region>
  type: creatures | stories | items
  region: south-america | mesoamerica | caribbean | mediterranean
Chunks live at archive/scripts/i18n/es/<type>-<region>-chunk-*.json
EN source at /tmp/es-<region>-<type>-src.json (emitted from by-region shard).
"""
import json
import glob
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]

type_, region = sys.argv[1], sys.argv[2]
shard = json.load(open(ROOT / f"data/sharded/{type_}/by-region/{region}.json"))
src = json.load(open(f"/tmp/es-{region}-{type_}-src.json"))

en_slugs = [e["slug"] for e in src]
shard_slugs = [e["slug"] for e in shard]
assert en_slugs == shard_slugs, "src emit order drifted from shard"
assert len(en_slugs) == len(shard_slugs) == len(set(en_slugs)), "slug dups"

en_map = {e["slug"]: e for e in src}
FIELDS = {"creatures": ("name", "summary", "description"),
          "items": ("name", "description"),
          "stories": ("title", "summary")}[type_]

entries = {}
files = sorted(glob.glob(str(ROOT / f"archive/scripts/i18n/es/{type_}-{region}-chunk-*.json")))
assert files, f"no chunks found for {type_} {region}"
for f in files:
    for rec in json.load(open(f)):
        slug = rec["slug"]
        assert slug in en_map, f"unknown slug {slug} in {f}"
        assert slug not in entries, f"dup slug {slug}"
        for field in FIELDS:
            val = rec.get(field)
            assert isinstance(val, str) and val.strip(), f"{slug} missing {field}"
            assert "\\u" not in val, f"{slug}.{field} contains unescaped \\u"
        entries[slug] = rec

missing = set(en_slugs) - set(entries)
assert not missing, f"missing {len(missing)}: {sorted(missing)[:5]}"
assert set(entries) == set(en_slugs)

# parity length gates
for slug, rec in entries.items():
    en = en_map[slug]
    if type_ == "stories":
        se = len(en.get("summary", ""))
        ss = len(rec["summary"])
        assert ss <= max(150, int(se * 1.5)), f"{slug} summary too long ({ss} vs en {se})"
    else:
        de = len(en.get("description", ""))
        ds = len(rec["description"])
        assert de == 0 or ds >= int(de * 0.6), f"{slug} description too short ({ds} vs en {de})"
        se = len(en.get("summary", ""))
        ss = len(rec.get("summary", ""))
        assert ss <= max(150, int(se * 1.5)), f"{slug} summary too long ({ss} vs en {se})"

# quality scans
CYR = re.compile(r"[\u0400-\u04FF]")
DOUBLED = re.compile(r"\b([a-záéíóúüñ]+) \1\b")
hits = []
for slug, rec in entries.items():
    joined = " ".join(str(rec.get(f, "")) for f in FIELDS)
    cyr = CYR.search(joined.replace("ñ", "").replace("Ñ", ""))
    if cyr:
        hits.append((slug, "cyrillic", cyr.group(0)))
    dd = DOUBLED.findall(joined)
    if dd:
        hits.append((slug, "doubled", dd[:2]))
assert not hits, f"quality hits: {hits[:10]}"

meta_key = {"creatures": "name", "stories": "title", "items": "name"}[type_]
count = len(entries)
if type_ == "stories":
    full = [s for s, rec in entries.items() if rec.get("complete")]
    meta = {"lang": "es", "source": f"wave-{type_} es ({region})",
            "count": count, "fullEntries": len(full)}
else:
    meta = {"lang": "es", "source": f"wave-{type_} es ({region})",
            "count": count, "fullEntries": count}

out = {"_meta": meta, "entries": entries}
out_path = ROOT / f"data/i18n/es/{type_}-{region}.json"
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2))
print(f"es {type_} {region}: {count} entries -> {out_path.relative_to(ROOT)}")