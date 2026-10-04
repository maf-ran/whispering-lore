#!/usr/bin/env python3
"""Fix mechanical data quality issues in stories.json.

Fixes:
1. Type normalization (fairy tale → fairy-tale, folk-tale → folktale, etc.)
2. Period capitalization normalization
3. Period variant consolidation
4. Report unlinked stories
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "datasets" / "stories.json"

stories = json.loads(DATA.read_text())

changes = {"type": 0, "period": 0, "summary": 0}

# --- 1. Type normalization ---
TYPE_MAP = {
    "fairy tale": "fairy-tale",
    "folk-tale": "folktale",
    "folk tale": "folktale",
    "creation": "creation-myth",
    "origin": "creation-myth",
    "origin-myth": "creation-myth",
    "mythology": "myth",
}

for s in stories:
    t = s.get("type", "").strip()
    tl = t.lower()
    if tl in TYPE_MAP and t != TYPE_MAP[tl]:
        s["type"] = TYPE_MAP[tl]
        changes["type"] += 1

# --- 2. Period capitalization normalization ---
PERIOD_LOWERCASE = {
    "Oral tradition", "Oral Tradition",
    "traditional (ancient origins, oral tradition)",
    "Traditional (ancient origins, oral tradition)",
    "mythological",
    "Mythological",
    "pre-columbian",
    "Pre-Columbian",
    "pre-colonial",
    "Pre-Colonial",
    "Colonial era",
    "folklore",
    "Folklore",
    "Unknown",
    "oral tradition (ancient)",
    "Oral Tradition (Ancient)",
    "ancient oral tradition",
    "Ancient Oral Tradition",
    "Ancient (pre-history)",
    "Ancient (Pre-History)",
    "Celtic tradition",
    "oral tradition",
    "Traditional (ancient origins, still widely practiced)",
    "Traditional (ongoing festival tradition)",
    "Traditional Hmong oral literature",
    "Traditional Vietnamese oral literature",
    "Traditional (pre-Angkorian origins)",
    "Traditional (stupa likely constructed 6th-10th century CE)",
    "Epic tradition",
    "Slavic tradition",
    "African diaspora",
    "Modern (post-1945)",
    "Modern",
}

PERIOD_MAP = {
    "oral tradition (ancient)": "oral tradition",
    "ancient oral tradition": "oral tradition",
    "Oral tradition": "oral tradition",
    "Oral Tradition": "oral tradition",
    "oral tradition": "oral tradition",
    "Oral Tradition (Ancient)": "oral tradition",
    "traditional (ancient origins, oral tradition)": "traditional",
    "Traditional (ancient origins, oral tradition)": "traditional",
    "mythological": "ancient",
    "Mythological": "ancient",
    "folklore": "oral tradition",
    "Folklore": "oral tradition",
    "Unknown": "",
    "Celtic tradition": "ancient",
    "Epic tradition": "ancient",
    "Slavic tradition": "ancient",
    "African diaspora": "oral tradition",
    "ancient oral tradition": "oral tradition",
    "Ancient Oral Tradition": "oral tradition",
    "Ancient (pre-history)": "ancient",
    "Ancient (Pre-History)": "ancient",
    "Ancient Native American": "ancient",
    "Pre-Columbian (before 1500)": "pre-columbian",
    "pre-columbian": "pre-columbian",
    "Pre-Columbian": "pre-columbian",
    "Pre-Colonial (ancient)": "pre-colonial",
    "Pre-Colonial (50,000+ years)": "ancient",
    "pre-colonial": "pre-colonial",
    "Pre-Colonial": "pre-colonial",
    "Colonial": "colonial era",
    "Colonial era": "colonial era",
    "Colonial era (Spanish influence)": "colonial era",
    "Modern (post-1945)": "modern",
    "Modern": "modern",
    "Traditional (ancient origins, still widely practiced)": "traditional",
    "Traditional (ongoing festival tradition)": "traditional",
    "Traditional Hmong oral literature": "oral tradition",
    "Traditional Vietnamese oral literature": "oral tradition",
    "Traditional (pre-Angkorian origins)": "traditional",
    "Traditional (stupa likely constructed 6th-10th century CE)": "traditional",
    "Ancient (ongoing annual tradition)": "ancient",
    "Ancient (ongoing tradition)": "ancient",
    "Ancient (ongoing ritual practice)": "ancient",
    "Ancient (Vedic)": "ancient",
    "Ancient (Trojan War era)": "ancient",
    "Ancient (pre-500 BCE)": "ancient",
    "Ancient Hmong oral tradition": "oral tradition",
    "Ancient Hmong tradition (ongoing practice)": "oral tradition",
    "Ancient Hmong tradition": "oral tradition",
    "Ancient Buddhist cosmological tradition": "ancient",
    "Ancient Hindu-Buddhist syncretic tradition, Angkor period (12th century+)": "ancient",
    "Ancient Mon kingdoms (pre-11th century)": "ancient",
    "Ancient Greece (700 BC)": "ancient",
    "Ancient China": "ancient",
    "Ancient Celtic": "ancient",
    "Ancient and Medieval": "medieval",
    "Medieval (12th-15th century)": "medieval",
    "Medieval (12th-13th century)": "medieval",
    "Medieval (15th century)": "medieval",
    "Medieval (recorded 16th century)": "medieval",
    "Medieval (9th-11th century)": "medieval",
    "Viking Age": "medieval",
    "Viking era": "medieval",
    "Heian period": "medieval",
    "Heian era": "medieval",
    "Heian-Medieval": "medieval",
    "Muromachi period": "medieval",
    "Angkor period": "medieval",
    "Angkorian period (11th-12th century)": "medieval",
    "Angkorian period (12th-13th century, Jayavarman VII)": "medieval",
    "Pagan period (11th century King Anawrahta)": "medieval",
    "Sukhothai period": "medieval",
    "Sukhothai period onwards (13th century+)": "medieval",
    "Ayutthaya period": "medieval",
    "Ayutthaya period (14th-18th century)": "medieval",
    "Joseon dynasty (1392-1910)": "medieval",
    "Ming Dynasty": "medieval",
    "Tang dynasty": "medieval",
    "Tang dynasty and later (17th century written)": "medieval",
    "Han Dynasty": "medieval",
    "15th century (Later Le Dynasty)": "medieval",
    "Hung Vuong period (ancient, pre-1st century BCE)": "ancient",
    "1st century CE (40-43 CE)": "ancient",
    "1st century CE (Funan period)": "ancient",
    "1st century CE": "ancient",
    "3rd century BCE": "ancient",
    "5th century BCE and earlier": "ancient",
    "5th century BCE (Buddha's lifetime)": "ancient",
    "10th century BCE": "ancient",
    "3rd-2nd century BCE (Trieu Da / An Duong Vuong period)": "ancient",
    "4th century AD": "ancient",
    "Ancient Rome (8 AD)": "ancient",
    "Pre-Christian": "ancient",
    "Pre-Christian origins": "ancient",
    "Pre-Christian oral tradition": "ancient",
    "Pre-Hindu oral tradition": "oral tradition",
    "Pre-Islamic": "ancient",
    "Pre-Polynesian tradition": "oral tradition",
    "Post-Reformation (1537 onward)": "early modern",
    "Spanish colonial": "colonial era",
    "10th century oral tradition": "oral tradition",
    "11th-15th Century": "medieval",
    "18th Century onward": "early modern",
    "13th century (older tradition)": "medieval",
    "13th century": "medieval",
    "13th century legend": "medieval",
    "10th century (older tradition)": "medieval",
    "10th century": "medieval",
    "11th century": "medieval",
    "12th century and earlier": "medieval",
    "14th century": "medieval",
    "15th century": "medieval",
    "16th century": "early modern",
    "16th-17th century": "early modern",
    "17th century": "early modern",
    "17th-19th century": "early modern",
    "17th century (1634) / 1812": "early modern",
    "17th century - present": "early modern",
    "18th century": "early modern",
    "19th century": "19th century",
    "19th century (King Rama IV era)": "19th century",
    "19th century (older tradition)": "19th century",
    "20th century": "modern",
    "6th century": "ancient",
    "7th century": "medieval",
    "8th century": "medieval",
    "9th century": "medieval",
    "9th-13th century": "medieval",
    "1990s": "modern",
    "1995 (Modern)": "modern",
    "1966 (Modern)": "modern",
    "1881 (literary adaptation of oral tradition)": "19th century",
    "Modern (ongoing tradition)": "modern",
    "Traditional (ancient origins, documented in 19th century)": "traditional",
    "14th-15th century chronicle (mythic origins: ancient)": "medieval",
    "14th-19th century (palm-leaf manuscripts)": "medieval",
    "1st century BCE – 1st century CE": "ancient",
    "2nd century": "ancient",
    "Heian Period": "medieval",
    "Oral tradition ancient": "oral tradition",
    "Ancient (Hung Vuong period, pre-1st century BCE)": "ancient",
    "1697 (Perrault) / 1812 (Grimm)": "17th century",
    "1350": "medieval",
    "1800": "18th century",
    "1621": "17th century",
    "1697": "17th century",
    "1782": "18th century",
    "1835": "19th century",
    "1837": "19th century",
    "1838": "19th century",
    "1841": "19th century",
    "1844": "19th century",
    "1845": "19th century",
    "1861": "19th century",
    "1816": "19th century",
    "1820": "19th century",
    "1890": "19th century",
    "1892": "19th century",
    "1900": "20th century",
    "1902": "20th century",
    "1903": "20th century",
    "1904": "20th century",
    "1907": "20th century",
    "1908": "20th century",
    "1909": "20th century",
    "1910": "20th century",
    "1911": "20th century",
    "1912": "20th century",
    "1913": "20th century",
    "1914": "20th century",
    "1915": "20th century",
    "1920": "20th century",
    "1966 (Modern)": "modern",
    "1995 (Modern)": "modern",
    "Edo Period": "Edo period",
    "Medieval": "medieval",
    "Ancient": "ancient",
    "Pre-colonial": "pre-colonial",
}
# Add lower variants
MORE = {}
for k, v in list(PERIOD_MAP.items()):
    if k[0].isupper() and k.lower() != k:
        MORE[k.lower()] = v
PERIOD_MAP.update(MORE)

for s in stories:
    p = s.get("period", "").strip()
    if not p:
        continue
    # Lowercase normalization
    if p in PERIOD_LOWERCASE:
        pl = p.lower().strip()
        if pl in PERIOD_MAP:
            target = PERIOD_MAP[pl]
            if target != p.lower():
                if target:
                    s["period"] = target
                else:
                    s["period"] = ""
                changes["period"] += 1
                continue
    # Direct map
    if p in PERIOD_MAP:
        target = PERIOD_MAP[p]
        if target != p:
            if target:
                s["period"] = target
            else:
                s["period"] = ""
            changes["period"] += 1

# --- 3. Fix very short summaries ---
SHORT_SUMMARIES = {
    "Davy Crockett": "The legendary king of the wild frontier, folk hero of American expansion and tall-tale tradition.",
    "The Legend of the Morning Star": "The poignant story of the first morning star and its place in the night sky.",
    "The Rainbow Snake": "The great creator serpent of Aboriginal Australian mythology who shaped the land and rivers.",
    "The Dreamtime": "The time before time when ancestral spirits created the world and all living things.",
    "The Nun's Priest Tale": "A clever rooster and a cunning fox star in this comic beast fable from Chaucer.",
    "Coviella": "The winter witch of Asturian folklore who brings snow and ice each year.",
    "The Tale of the Black Duck": "A boy is transformed into a duck and must find his way back to human form.",
    "The Wendigo": "The cannibal spirit of Algonquian legend, a gaunt creature of insatiable hunger.",
    "The Story of the Girl Who Was Never Seen": "A mysterious invisible girl whose presence is known only through her voice and actions.",
    "The Origin of Fire": "How fire first came to the world, stolen from the gods for the benefit of humanity.",
    "The Origin of the Tiki": "The first man carved from wood by the god Tāne in Māori tradition.",
    "Maui and the Sun": "The demigod Maui slows the sun with a rope to lengthen the days.",
    "The Legend of Manitou": "The Great Spirit, creator and life-giver of Algonquian belief.",
    "The Tale of the First Fire": "How fire was first brought to the people, stolen from the fire-keepers.",
    "Pele's Tears": "The volcano goddess Pele creates the Hawaiian Islands with her fiery tears.",
    "The Legend of the Bong Bong": "A dog transformed into a man must navigate human customs and relationships.",
    "The Tale of the Bak Bak": "A vampire-like creature of Filipino folklore that feeds on the living.",
    "The Kapre": "A giant tree spirit of Philippine folklore that waits and watches from the branches.",
    "Matsya": "The fish avatar of Vishnu who saves humanity from the great deluge.",
    "Hou Yi and the Arrows": "The legendary archer who shoots down nine suns to save the earth.",
    "Sundew and the Ghosts": "A lonely girl who befriends the spirits of the forest and marsh.",
    "The Weeping Stones": "Sacred stones that weep before a death, foretelling tragedy to come.",
    "Myrkr": "The enchanted mist of Norse lore that causes travelers to become hopelessly lost.",
    "Trolls in Church": "Trolls who venture into a church are turned to stone by the rising sun.",
    "Dullahan": "The headless rider of Irish folklore who heralds death with his grim procession.",
    "Púca": "The shapeshifting horse spirit of Samhain who leads travelers astray.",
    "The Blue Caps": "Brownie-like spirits who wear blue caps and help with household chores.",
    "Selkie": "Mysterious seal-folk who shed their skins to become human on land.",
    "Nuckelavee": "The terrible orc of Orkney folklore, a skinless horse-human hybrid of the sea.",
    "Djinn": "Supernatural spirits of smokeless fire in Arabic and Islamic tradition.",
}

for s in stories:
    title = s.get("title", "")
    summary = s.get("summary", "")
    if title in SHORT_SUMMARIES and len(summary) < 30:
        s["summary"] = SHORT_SUMMARIES[title]
        changes["summary"] += 1

# Save backup
backup_path = DATA.with_suffix(".backup.json")
if not backup_path.exists():
    import shutil
    shutil.copy2(DATA, backup_path)
    print(f"Backup saved to {backup_path}")

# Write
DATA.write_text(json.dumps(stories, indent=2, ensure_ascii=False))
print(f"Written {len(stories)} stories to {DATA}")
print(f"\nChanges made:")
for k, v in changes.items():
    print(f"  {k}: {v}")

# Report unlinked stories
unlinked = [s for s in stories if not s.get("creatures")]
print(f"\nStories with no creature links: {len(unlinked)}")
# Group by region
from collections import Counter
regions = Counter(s.get("region", "?") for s in unlinked)
print("  By region:")
for r, c in regions.most_common(10):
    print(f"    {r}: {c}")
print("\nSample (first 5):")
for s in unlinked[:5]:
    print(f"  [{s.get('region','?')}] {s.get('title','?')}")
