import json, os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CREATURES_PATH = os.path.join(BASE, 'data', 'datasets', 'creatures.json')

# Known active living traditions — keep these as True
# These are creatures still part of active folk belief/worship today
KEEP_TRUE = {
    # Pacific
    'taniwha',           # Maori — still part of living Maori belief
    'taotaomo-na',       # Chamorro — still believed in Guam/CNMI
    'aumakua',           # Hawaiian — still part of Hawaiian spiritual practice
    'patupaiarehe-maori',# Maori — still part of folklore
    'menehune',          # Hawaiian — still part of folklore
    'rainbow-serpent',   # Aboriginal Australian — living tradition
    'yowie',             # Australian cryptid — still reported

    # Philippines (still widely believed)
    'aswang',
    'kapre',
    'tiyanak',
    'penanggalan',
    'manananggal',
    'sigbin',
    'duwende-filipino',
    'pugot',
    'mambabarang',
    'tikbalang-tigbalang',
    'tik-tik-or-wakwak',
    'kuntilanak',
    'pocong-indonesia',
    'pocong-malaysia',
    'pocong',
    'pontianakkuntilanak-indonesia',
    'pontianakkuntilanak-malaysia',
    'pontianak-brunei',
    'pontianak-singapore',
    'krasue',
    'kuman-thong',
    'toyol-malaysia',
    'toyol-indonesia',
    'toyol-singapore',
    'tuyul',

    # Thailand/Laos/Cambodia (phi spirits — still part of living belief)
    'phi',
    'phi-kam',
    'phi-khao',
    'phi-khao-nang',
    'phi-kret',
    'phi-lam',
    'phi-phong',
    'phi-phong-ngam',
    'phi-phrai',
    'phi-phraya',
    'phi-pom',
    'phi-pop',
    'phi-ta-khon',
    'phaya-nak-thai',
    'phisuea-samud-thai',
    'mae-nak-phra-khanong',
    'mae-yanang-thai',

    # SE Asia — still believed
    'orangbunian-malaysia',
    'orangbunian-singapore',
    'orang-minyak-oily-man',
    'harimau-jadian',
    'hantu-bedar',
    'hantu-penyet',
    'hantu-pintal-kamal',
    'jembalang',
    'jenglot',
    'tulisan',

    # Mesoamerica
    'alux',              # Maya — still believed in Yucatan
    'tataduende-guatemala',  # Still believed
    'tataduende-belize',     # Still believed

    # South America
    'kurupira',          # Amazon — still believed
    'curupira',          # Amazon — still believed
    'pombero-uruguay',   # Guarani — still believed
    'pombero-argentina', # Guarani — still believed
    'madremonte',        # Colombia — still believed
    'la-madre-del-monte',# Still believed
    'ciguapa-cuba',      # Still believed
    'ciguapa-dominicanrepublic', # Still believed
    'invunche',          # Chile — still believed
    'trauco-del-fuego',  # Still believed

    # Caribbean
    'papabois-saintlucia',
    'papabois-trinidadandtobago',
    'papabois-grenada',
    'ti-malice',

    # European household/nature spirits (still believed in some rural areas)
    'tomte',
    'domovoi',
    'domovoy',
    'domovoy-slavic-house-spirit',
    'kobold',
    'niss',              # if exists, Scandinavian

    # South Asia — still believed
    'yeti',
    'churail',
    'churel',
    'preta',
    'yaksha',
    'yakshini',
    'rakshasa',
    'asura',
    'vetal',
    'vetala',
    'vet-la',
    'pishacha',
    'pishacha-bondh',
    'kalu-devata',
    'gramya-devata',
    'maha-sohona',
    'mujna',
    'rani',

    # West Africa / diaspora — still living traditions
    'elegua',
    'eshu',
    'anansi-ghana',
    'anansi-jamaica',
    'anansi-ivorycoast',
    'egungun',
    'shetani',

    # General
    'fairy',             # but these need to be checked
    'fairy-europe',
    'fairy-england',
    'fairy-scotland',
    'fairy-italy',
    'fairy-norway',
    'fairy-czechrepublic',
    'fairy-germany',
    'fairy-france',
    'fairy-denmark',
    'fairy-canada',
    'fairy-poland',

    # Ghosts/ancestors
    'ankou-brittany',
    'ankou-cornwall',
}

# Entries with no specific cultural/regional context — template-generated
# These have type: ancestor-spirit/nature-spirit/guardian with no cultural roots
TEMPLATE_PREFIXES = {
    'turtle-', 'moose-', 'salmon-', 'raven-', 'eagle-', 'hawk-',
    'coyote-', 'deer-', 'fox-', 'elk-', 'cougar-', 'crane-',
    'panther-', 'owl-', 'moth-', 'mosquito-',
    'mooseguardian', 'mooseancestor', 'moosetrickster', 'moosenature',
    'turtletrickster', 'turtleguardian', 'turtlenature',
    'ravenguardian', 'ravenancestor', 'raventrickster', 'ravernature',
    'eagleguardian', 'eagleancestor', 'eagletrickster', 'eaglenature',
    'hawkguardian', 'hawkancestor', 'hawktrickster', 'hawknature',
    'coyoteguardian', 'coyoteancestor', 'coyotetrickster', 'coyotenature',
    'deerguardian', 'deerancestor', 'deertrickster', 'deernature',
    'foxguardian', 'foxancestor', 'foxtrickster', 'foxnature',
    'elkgwardian', 'elkancestor', 'elktrickster', 'elknature',
    'cougarguardian', 'cougarancestor', 'cougartrickster', 'cougarnature',
    'craneguardian', 'craneancestor', 'cranetrickster', 'cranenature',
    'pantherguardian', 'pantherancestor', 'panthertrickster', 'panthernature',
    'owlguardian', 'owlancestor', 'owltrickster', 'ownature',
    'keepermaya', 'gatekeeper-maya',
    'templeguardianmixtec',
    'templeguardian',
    'moonmaidencherokee',
    'deitykikuyu',  # hawkdeitykikuyu
    'eagleguardianzulu',
    'mooseguardianmapuche',
    'coyoteguardianburmese',
    'coyotetricksterlaotian',
    'elknaturespiritburmese',
    'elkguardianguarani',
}

def slug_matches_prefix(slug, prefixes):
    for p in prefixes:
        if slug.startswith(p):
            return True
    return False

def is_phi_spirit(slug):
    return slug == 'phi' or slug.startswith('phi-')

def is_turtle_entry(slug):
    return slug.startswith('turtle-') or slug.startswith('turtletrickster') or slug.startswith('turtleguardian') or slug.startswith('turtlenature')

def is_sea_asia_myth(slug):
    """Southeast Asian mythological figures (not living traditions)."""
    SE_ASIA_MYTH = {
        't-y', 'th-ch-tinh', 'thanh-minh', 'l', 'l-c-long-qu-n',
        'lafaek-crocodile-spirit', 'au-co-vietnamese',
        'kim-qui-vietnamese', 'r-ng-vietnamese-dragon', 'r-ng-bi-n',
        'r-ng-h', 'c-trong', 'son-tinh-vietnamese',
        'my-chau-vietnamese', 'thuy-tinh-vietnamese',
        'trung-sisters-vietnamese', 'lac-long-quan-vietnamese',
        'qu', 'ho-ng-t', 'x-c', 'm-ng', 'gia-l-m',
        'hundred-egg-beings-vietnamese',
        'awang-semaun-bruneian', 'malakas-filipino', 'maganda-filipino',
        'maria-makiling-filipino', 'labaw-donggon', 'humadapnon',
        'ibong-adarna-filipino', 'sangkuriang-indonesian',
        'roro-jonggrang-indonesian', 'rangda-indonesian',
        'malin-kundang-indonesian', 'jaka-tarub-indonesian',
        'dewi-sri-indonesian', 'kebo-iwa-indonesian',
        'timun-mas-indonesian', 'galone',
        'saka', 'thaman-kyah', 'siring', 'hantu-bedar',
        'hantu-penyet', 'hantu-pintal-kamal',
        'lulik-spirits', 'garuda',
        'apsara-cambodian', 'preah-thaong-cambodian',
        'preah-ko-cambodian', 'preah-keo-cambodian',
        'khun-borom-lao', 'phaya-thaen-lao',
        'thagyamin-burmese', 'mahagiri-nat-burmese',
        'popa-medaw-burmese', 'popa-nat-burmese',
        'hintha-bird-burmese', 'chinthe',
        'shwe-pyat', 'shwe-temperature', 'ma-dray', 'ma-sue',
        'pwint', 'let-htau',
        'lhamu', 'puteri-gunung-ledang-malaysian',
        'seri-gumum-malaysian', 'sang-kancil-malaysian',
        'mutiara-rooster',
        'chang-pheuak-thai',
        'dragon-brunei-bay-bruneian',
        'crocodile-prince-east-timorese',
        'corn-spirit-east-timorese',
        'great-whale-east-timorese',
        'hang-tuah-malaysian', 'hang-jebat-malaysian',
        'dab-pog-hmong', 'yawm-saub-hmong', 'siv-yis-hmong',
        'hmong-creation-spirits-hmong',
        'p-ban-or-phibaan',
        'pocong-indonesia', 'pocong-malaysia', 'pocong', # already in KEEP_TRUE? no wait, pocong IS living
        'fish-wife-lake-toba-indonesian',
    }
    return slug in SE_ASIA_MYTH

def is_pacific_myth(slug):
    """Pacific mythological figures (not living traditions)."""
    PACIFIC_MYTH = {
        'tagaloa', 'tamaiti', 'tamapua', 'te-ngaru',
        'the-tuku-uru', 'the-vao', 'tiddalik-the-frog',
        'tui-fiti', 'tulafale', 't-ne-mahuta', 't-whaki',
        'tokwai', 'tamate', 'tui-delaivugalei-fijian',
        'to-kabinana-papua', 'to-karvuvu-papua',
        'tagaro-vanuatu', 'tane-mahuta-maori',
        'tangaroa-maori', 'tawhiri-matea-maori',
        'tu-mata-uenga-maori', 'te-wheke-a-muturangi-maori',
        'tigilau-samoan', 'tui-manua-samoan',
        'tangata-manu-rapanui', 'tangaroa-cookislands',
        'te-pusi-mo-te-ali', 'tefolaha', 'telematua', 'tepuhi',
        'a-men-rainbow-serpent', 'aitu', 'adaro', 'abaia',
        'areop-enap-nauruan', 'anulap-micronesian',
        'ahoeitu-tongan', 'aku-aku-rapanui',
        'fisaga', 'kalai',
        'ma-i', 'maring', 'masalai-papua-new-guinea',
        'matau', 'matuku', 'maui-hawaii', 'maui-newzealand',
        'mimi', 'mo-o', 'ma-i',
        'morningstar-australia',
        'mosquito-animal-spirit-fijian',
        'mosquito-nature-spirit-maori',
        'm-ui', 'manup-papua', 'marawa-vanuatu',
        'muldjewangk-aboriginal', 'maui-polynesian',
        'moso-samoan', 'makemake-rapanui',
        'pa-itele', 'pangkarlangu', 'pekapeka',
        'potkoorok-aboriginal',
        'papa-maori', 'ponaturi-maori',
        'poliaku-hawaiian', 'pulotu-tongan',
        'daramulum-aboriginal',
        'dakuwaqa', 'degei', 'degei-ndengei',
        'detora', 'delal-a-ngibtal',
        'hale-mo-o', 'hikule-o',
        'hatuibwari-solomon', 'haumia-tiketike-maori',
        'hine-nui-te-po-maori', 'hine-titama-maori',
        'hatupatu-maori', 'hi-iaka-hawaiian',
        'hiro-tahitian', 'hotu-matua-rapanui',
        'haua-rapanui', 'eigigu',
        'isokelekel-micronesian', 'ina-cookislands',
        'julunggul-aboriginal',
        'kupua',
        'kilobob-and-manup', 'kaiamunu', 'karemanua',
        'kilibob-papua', 'kerepunu-papua',
        'kamata-vanuatu', 'kakamora-solomon',
        'kahausibware-solomon', 'kunmanggur-aboriginal',
        'kupe-maori', 'kurangaituku-maori',
        'kanaloa-hawaiian', 'kane-hawaiian', 'ku-hawaiian',
        'ligobubfanu-micronesian', 'lono-hawaiian',
        'la-ieikawai-hawaiian', 'lohiau-hawaiian',
        'loa', 'letao', 'lemjel',
        'sawa-fonu-i-a-sa', 'seven-sisters-aboriginal',
        'sina-samoan',
        'spider-spirit-maori',
        'umi-hawaiian', 'uab', 'vinmara-vanuatu',
        'yawk-yawk', 'yara-ma-yha-who-aboriginal',
        'qat', 'raywaterspiritbotswana-tonga',
        'ratu-mai-mbula-fijian', 'rangi-maori',
        'rongo-maori', 'rongo-cookislands',
        'darambul-aboriginal',
        'papa-maori', 'patupaiarehe-maori',  # wait, patupaiarehe is KEEP_TRUE
        'pele-hawaii',
    }
    # Don't override KEEP_TRUE entries
    return slug in PACIFIC_MYTH and slug not in KEEP_TRUE

def should_be_false(slug, entry):
    """Determine if a flagged entry should be set to living_tradition: False."""
    # Already handled (previously fixed)
    if slug in KEEP_TRUE:
        return False  # Keep as True

    # Pacific mythological figure
    if is_pacific_myth(slug):
        return True

    # SE Asian mythological figure
    if is_sea_asia_myth(slug):
        return True

    # Template-generated entries with animal prefixes
    if slug_matches_prefix(slug, TEMPLATE_PREFIXES):
        return True

    # If it's a known turtle entry that somehow slipped through
    if is_turtle_entry(slug):
        return True

    # Tupilak is more artistic tradition vs living belief
    if slug == 'tupilak':
        return True

    # Generic ancestor-spirit entries with no region
    # Check: if the slug is just a generic name and type=ancestor-spirit with no cultural context
    type_only_ancestor = slug in [
        'keemse', 'imizimu', 'ira', 'tussepresten',
        'mazimu', 'famadihana', 'shetani',
        'haugfolk', 'm-llergut',
    ]
    if type_only_ancestor:
        return True

    # Generic nature-spirit entries
    type_only_nature = slug in [
        'acalica', 'akkedem', 'mborev', 'karakondzula',
        'kostroma', 'kurupira', 'kurup', 'pincoy',
        'povitrulya', 'p-anetnik', 'p-is', 'lussi',
        'listasanddjevelen', 'huanca', 'hyllemor',
        'skogmannen', 's-trevette', 'fjellvette',
        'halmasti', 'haldi-sami',
        'el-duende-del-tabaco',
        'sun-spirit-olmec', 'fire-keeper',
        'red-headband', 'river-mother-cherokee',
        'gambia-forest-spirit',
        'chil-kuyz', 'ippondatara', 'ise-n',
        'c-trong',
        'lunja',
        'rounce', 'vette', 'kvernknurr',
        'yrgan-e', 'g-idhr', 'gardvord', 'gr-mannen',
        'shteli-kherkher',
        'puk', 'chut', 'gazar-bichig',
        'landvttir-iceland', 'heinzelm-nnchen',
        'lazavik', 'trasgo', 'yeay-lac',
        'xjabil', 'x-c', 'yelmo',
        'kaji', 'yagwanggwi',
        'trickster-scorpion',
        'chameleon-messenger',
        'gullah-frog',
        'seychelles-soungoula',
        'yule-lads',
        'yurugu-dogon',
        'zankallala',
        'coqui-spirit-puerto-rican',
        'viejito-del-monte',
        'cipitio',
        'great-coyote-navajo',
        'first-angry-coyote-navajo',
        'coyote-navajo',
        'coyote-first-angry-navajo',
        'chief-no-vitals-crow',
        'sweet-medicine-cheyenne',
        'splinter-foot-girl-arapaho',
        'erect-horns-cheyenne',
        'glooscap',
        'gluskabe',
        'aldar-qose-kazakh',
        'iktomi',
        'kalulu-trickster',
        'gizo-hausa',
        'hlakanyana-xhosa',
        'kalala-ilunga-luba',
        'mbidi-kiluwe-luba',
        'liongo-fumo-swahili',
        'mbatian-maasai',
        'crowmaya-guatemala',
        'crowmaya-mexico',
        'crowmaya-canada',
        'spider-maya',
        'anansi-ghana', 'anansi-jamaica', 'anansi-ivorycoast', # actually these might be living
        'ivory-coast-anansi',
        'aunt-nancy',
    ]
    if type_only_nature:
        return True

    # Culture heroes (historical/mythological, not living traditions)
    culture_heroes = {
        'glooscap', 'gluskabe', 'kalala-ilunga-luba',
        'mbidi-kiluwe-luba', 'liongo-fumo-swahili',
        'mbatian-maasai', 'sweet-medicine-cheyenne',
        'splinter-foot-girl-arapaho', 'erect-horns-cheyenne',
        'chameleon-messenger',
        'erect-horns-cheyenne',
    }
    if slug in culture_heroes:
        return True

    # South Asian mythological figures (Hindu/Buddhist mythology, not living traditions)
    south_asia_myth = {
        'krishna', 'shiva', 'vishnu', 'durga', 'saraswati',
        'hanuman', 'ravana', 'garuda',
        'matsya', 'makara', 'yali', 'airavata',
        'kaliya-hindu', 'kumbhakarna-hindu',
        'jambavan-hindu', 'dhanvantari-hindu',
        'chhinnamasta-hindu',
        'kinnara-hindu', 'gandharva-hindu',
        'maya-mriga-hindu',
        'pasupata', 'singh-dhan',
        'rani', 'devatha', 'devi-india',
        'sri-lanka-naga',
        'kuveni-sri-lankan', 'kataragama-sri-lankan',
        'riri-yaksha-sri-lankan', 'rannamaari-maldivian',
        'rannamaari',
        'suniyam-sri-lankan', 'saman-deviyo-sri-lankan',
        'gara-yakka-sri-lankan',
        'kandu-fureytha-maldivian',
        'fureytha',
        'dakkhin-rai-bengali', 'druk-bhutanese',
        'migoi-bhutanese', 'lizard-spirit-bhutanese',
        'crane-spirit-bhutanese',
        'frog-guardian-bhutanese',
        'matsyendra-nepali', 'taleju-nepali',
        'lakhe',
        'singbonga-munda',
        'prince-sattva-indian',
        'surpanakha-indian', 'pisacha-indian',
        'vasuki-hindu',
        'handi',
        'r-kshasa',
        'dagas',
        'pattini',
        'peris',
        'pet-nat',
        'moppet',
        'sanni-yakku',
    }
    if slug in south_asia_myth:
        return True

    # Generic/unknown region entries
    unknown_generic = {
        'akkedem', 'adroanzi', 'akkarmora',
        'anjana', 'gwyllion',
        'kikimora-russia', 'kikimora-slovakia', 'kikimora-ukraine',
        'yagwanggwi',
    }
    if slug in unknown_generic:
        return True

    # If we haven't decided, keep the original value (no change)
    return None


with open(CREATURES_PATH) as f:
    creatures = json.load(f)

changed = 0
skipped_no_flag = 0
skipped_keep_true = 0
skipped_other = 0
changes = []

for i, entry in enumerate(creatures):
    slug = entry.get('slug', '')
    current = entry.get('living_tradition', None)

    # Only process flagged entries
    result = should_be_false(slug, entry)

    if result is True:
        if current is not False:
            entry['living_tradition'] = False
            changed += 1
            changes.append(slug)
            print(f'  FALSE: {slug}')
        else:
            skipped_no_flag += 1
    elif result is False:
        # Keep as True (explicit exception)
        if current is not True:
            entry['living_tradition'] = True
            changed += 1
            changes.append(f'{slug} (→True)')
            print(f'  TRUE:  {slug}')
        else:
            skipped_keep_true += 1
    else:
        # Not yet decided — skip
        skipped_other += 1

print(f'\n--- Summary ---')
print(f'Changed: {changed}')
print(f'Skipped (already False): {skipped_no_flag}')
print(f'Skipped (already True/keep): {skipped_keep_true}')
print(f'Skipped (undecided): {skipped_other}')
print(f'Total creatures: {len(creatures)}')

with open(CREATURES_PATH, 'w') as f:
    json.dump(creatures, f, indent=2, ensure_ascii=False)
    f.write('\n')

print(f'\nSaved {CREATURES_PATH}')

if changes:
    print('\nChanged slugs:')
    for c in changes:
        print(f'  {c}')
