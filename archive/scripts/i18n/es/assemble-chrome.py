#!/usr/bin/env python3
import json
import re
import sys

ROOT = "/Users/mafolsson/Desktop/DEMO-PROJECT 2/Whispering Lore"
d = {}
for i in (1, 2, 3, 4):
    with open(f"{ROOT}/archive/scripts/i18n/es/chrome-batch-{i}.json") as fh:
        for rec in json.load(fh):
            k, v = rec["key"], rec["value"]
            assert k not in d, f"dup key {k}"
            assert isinstance(v, str) and len(v) > 0, f"empty value {k}"
            if "'" in v or "\n" in v:
                print(f"WARN {k}: value contains apostrophe/newline: {v[:60]!r}")
            d[k] = v

with open(f"{ROOT}/js/i18n.js") as fh:
    src = fh.read()

m = re.search(r"\n    en: \{", src)
assert m, "en dict not found"
if "\n    es: {" in src:
    print("es block already present — aborting (avoid double splice)")
    sys.exit(1)

body = "".join(f"      '{k}': '{v}',\n" for k, v in d.items())
block = "    es: {\n" + body + "    },\n"
pos = src.index("\n    sv: {")
new = src[:pos] + "\n" + block + src[pos:]

with open(f"{ROOT}/js/i18n.js", "w") as fh:
    fh.write(new)
print("es chrome keys spliced:", len(d))