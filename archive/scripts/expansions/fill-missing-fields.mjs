import fs from "fs";

const dbPath = "data/datasets/creatures.json";
const creatures = JSON.parse(fs.readFileSync(dbPath, "utf8"));

const fills = {
  // ---- appearance fills (24) ----
  "templeguardianmixtec-mexico": {
    appearance: "Unattested as a named Mixtec 'temple guardian' figure; no canonical appearance is recorded in surviving sources."
  },
  "templeguardianmixtec-usa": {
    appearance: "Ñuhu guardians of Mixtec (Ñuu Dzaui) belief have no fixed canonical form; they are sacred beings who dwell within the earth and mountains and may appear in human or animal shape."
  },
  "tulafale": {
    appearance: "A tall figure in the regalia of a Samoan orator-chief, fine mats ('ie toga) draped over the shoulder with a ceremonial staff in hand, seen at night near the village malae and chiefly houses."
  },
  "moonmaidencherokee-usa": {
    appearance: "Unattested as a specific Cherokee 'moon maiden' being; no canonical appearance is recorded."
  },
  "moonmaidencherokee-canada": {
    appearance: "Unattested in Cherokee folklore and doubly misattributed to Canada; no canonical appearance is recorded."
  },
  "yeay-lac": {
    appearance: "A female guardian spirit (yeay, 'grandmother') depicted as an elderly woman in traditional Khmer dress, seated or standing watch near shrines, streams, and temple gates."
  },
  "restless-spirit-blackfoot": {
    appearance: "No recorded appearance; the being is unattested as a distinct Blackfoot spirit."
  },
  "river-mother-cherokee": {
    appearance: "A beautiful water-woman with long dark hair who rises from the river, luring travelers toward the water; some accounts give her a siren-like song."
  },
  "riverwomanzapotec-mexico": {
    appearance: "Unattested as a named Zapotec 'river woman' in the record's sense; no canonical appearance is recorded."
  },
  "riverwomanzapotec-usa": {
    appearance: "Lucía Zenteno appears as a radiant Zapotec woman with long black hair, so beautiful that her reflection draws men to the water."
  },
  "shadeolmec-mexico": {
    appearance: "Unattested as a distinct Olmec 'shade' or vengeful ghost; no canonical appearance is recorded."
  },
  "shadeolmec-colombia": {
    appearance: "Misattributed; the Olmec were a Mesoamerican civilization, so no Colombian 'shade' is attested. No canonical appearance recorded."
  },
  "shadeolmec-usa": {
    appearance: "Misattributed; no North American Olmec 'shade' is attested. No canonical appearance recorded."
  },
  "sky-father-cheyenne": {
    appearance: "Conceived as a supreme presence above rather than an anthropomorphic figure — the creator who lives above the sky; sometimes described as an old man dwelling in the heavens."
  },
  "sungoddessmuisca-colombia": {
    appearance: "The Muisca sun deity Sué (Xué, Zuhé) is a radiant being who travels across the sky; tradition pairs the moon goddess Chía with the masculine sun deity Sué, so the record's gender is incorrect."
  },
  "sungoddessmuisca-usa": {
    appearance: "Sué, the masculine Muisca sun deity, is a radiant sky-being with no fixed human appearance in surviving Muisca sources."
  },
  "phantom-zapotec": {
    appearance: "The Matlazihua appears as a woman carrying a whipping snare (matlazíhuatl), sometimes as an alluring woman with one animal foot or a rattlesnake, who lures men at night."
  },
  "protector-cherokee": {
    appearance: "No canonical appearance; 'protector' is not attested as a specific named Cherokee being."
  },
  "watchmantupi-brazil": {
    appearance: "Unattested as a named 'Watchman' in Tupi tradition; no canonical appearance is recorded."
  },
  "watchmantupi-mexico": {
    appearance: "Curupira is a small red-haired, red-skinned man with backwards feet, the guardian of the hunt who confuses hunters with reversed footprints."
  },
  "whiteladytupi-brazil": {
    appearance: "Unattested in Tupi tradition; 'White Lady' is a European ghost archetype. No canonical appearance recorded."
  },
  "whiteladytupi-mexico": {
    appearance: "Iara (Uiara) is a beautiful river siren with long dark hair and fair skin, half-woman half-fish, who lures young men to drown beneath the river."
  },
  "whiteladytupi-usa": {
    appearance: "Iara is the Tupi-Guarani river spirit of the Amazon — a beautiful long-haired water-woman; this record misplaces her in the USA."
  },
  "waaq-somali": {
    appearance: "Waaq is the supreme sky god, conceived as a celestial presence without fixed human form; the creator associated with the heavens."
  },

  // ---- habitat fills (25) ----
  "tsilwalagame-kwakwaka-wakw": {
    habitat: "The deep coastal forest of the Northwest Coast, where Dzunukwa and her children roam far from villages."
  },
  "patsallht-first-born-nuxalk": {
    habitat: "Unattested under this name in Nuxalk records; no specific habitat is attested."
  },
  "masmasalanicw-four-carpenters-nuxalk": {
    habitat: "The supernatural workshop of the Nuxalk cosmos, associated with the sky world and the fashioning of celestial beings."
  },
  "one-who-walks-all-over-the-sky-tsimshian": {
    habitat: "The sky world of Tsimshian cosmology above the earth, tied to the origin of the sun and moon."
  },
  "komokwa-copper-maker-kwakwaka-wakw": {
    habitat: "The undersea kingdom beneath the ocean, where Komokwa (Kumugwe) keeps his treasure-house of copper and sea wealth."
  },
  "weeget-txamsem-giant-raven-tsimshian": {
    habitat: "The Northwest Coast from the Nass and Skeena rivers to the sea and sky, where Raven moves between worlds."
  },
  "gwaxwgwakwalanuksiwe-kwakwaka-wakw": {
    habitat: "The forest and the Hamatsa winter ceremonial grounds of the Kwakwaka'wakw, where cannibal spirits gather."
  },
  "weeget-txamsem-raven-tsimshian": {
    habitat: "The coast, rivers, and sky of Tsimshian territory; Raven is a shapeshifter who moves freely among all realms."
  },
  "xe-las-the-changer-coast-salish": {
    habitat: "The Coast Salish lands around the Salish Sea — shores, rivers, and islands from the Pacific coast to inland waterways."
  },
  "bukwus-wild-man-of-the-woods-kwakwaka-wakw": {
    habitat: "The deep coastal forest and its edges, where Bukwus lurks along the border of the woods."
  },
  "ho-ho-e-ap-bess-two-men-who-changed-things-coast-salish": {
    habitat: "The Makah territory of the Olympic Peninsula coast near Neah Bay, where the twin transformers worked."
  },
  "chulyen-crow-nuu-chah-nulth": {
    habitat: "South-central Alaska around the Kenai Peninsula, homeland of the Dena'ina people."
  },
  "raven-guguyni-nuu-chah-nulth": {
    habitat: "The Pacific coast of Vancouver Island, the homeland of the Nuu-chah-nulth people."
  },
  "bear-husband-tsimshian": {
    habitat: "The forest and mountains of the Nass River region, where bears live in their own human-like villages."
  },
  "bear-wife-tsimshian": {
    habitat: "The Nass River mountains and forests, where the Grizzly Bear wife dwells."
  },
  "salmon-boy-nuxalk": {
    habitat: "The rivers and salmon runs of Nuxalk territory on the central British Columbia coast."
  },
  "crow-tlingit": {
    habitat: "Unattested as a separate Tlingit being; no habitat is attested."
  },
  "salmon-of-wisdom": {
    habitat: "The River Boyne in Ireland, where Fintan the Salmon of Knowledge swam beneath the hazel tree of wisdom."
  },
  "kushtaka-land-otter-man-tlingit": {
    habitat: "The shores, tidal flats, and forest streams of Southeast Alaska Tlingit territory, where land otters dwell near the water."
  },
  "blue-heron-coast-salish": {
    habitat: "The shores, wetlands, and tidal flats of the southern Coast Salish (Lushootseed) territory of Puget Sound."
  },
  "andaokut-nuu-chah-nulth": {
    habitat: "The forests and coast of Nuu-chah-nulth territory, where child-stealing sky beings take children."
  },
  "sgaana-supernatural-killer-whale-haida": {
    habitat: "The sea and undersea world of Haida Gwaii, where supernatural killer whales dwell as powerful sea-beings."
  },
  "xanaax-atwaayaa-tlingit": {
    habitat: "The stream and river world of the Tlingit Salmon Box story, where the supernatural salmon live."
  },
  "d-sonoqua-dzunukwa-kwakwaka-wakw": {
    habitat: "The deep, dark woods of Kwakwaka'wakw territory, the forest interior away from villages."
  },
  "duk-ib-the-changer-coast-salish": {
    habitat: "The rivers, lakes, and land of Lushootseed (southern Coast Salish) territory, where the Changer transformed the world."
  }
};

let appearanceFilled = 0;
let habitatFilled = 0;

const updated = creatures.map(c => {
  const fill = fills[c.slug];
  if (!fill) return c;
  let changed = false;
  if (fill.appearance && (!c.appearance || c.appearance === "Not documented" || c.appearance.trim() === "")) {
    c.appearance = fill.appearance;
    appearanceFilled++;
    changed = true;
  }
  if (fill.habitat && (!c.habitat || c.habitat === "Not documented" || c.habitat.trim() === "")) {
    c.habitat = fill.habitat;
    habitatFilled++;
    changed = true;
  }
  if (changed) {
    c.lastUpdated = "2026-08-07";
  }
  return c;
});

const tmpPath = `${dbPath}.tmp.${Date.now()}`;
fs.writeFileSync(tmpPath, JSON.stringify(updated, null, 2), "utf8");
fs.renameSync(tmpPath, dbPath);

console.log(`Filled appearance on ${appearanceFilled} creatures`);
console.log(`Filled habitat on ${habitatFilled} creatures`);
