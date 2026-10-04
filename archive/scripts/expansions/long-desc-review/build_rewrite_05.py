import json

entries = [
    {
        "slug": "gondol",
        "description": "Not independently attested in folklore literature. No Setesdal source, including Johannes Skar's Gamalt or Sætesdal, records a lake spirit named 'gondol', and the name is best known as a Norwegian cable-car brand. Genuine Setesdal water-lore centers on the nøkk (näk); 'gondol' appears in no ethnographic record.",
        "source": "Review finding: unattested; no Setesdal record found; closest analogue is the Norwegian nøkk",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: Skar's Gamalt or Sætesdal documents no 'gondol'; the term is a cable-car brand. Closest genuine figure is the nøkk of Norwegian water-lore."
    },
    {
        "slug": "goubet-monster",
        "description": "Ghoubbet al-Kharab, a cliff-ringed cove on the Gulf of Tadjoura in Djibouti, is locally known as the 'Gulf of Demons'; the enclosed basin, nearly 200 m deep with violent currents, has long been linked in Afar and Somali coastal belief to sheytan and other supernatural beings. Occasional cryptid-monster claims circulate, but no such creature has been documented.",
        "source": "Djiboutian place-lore: Ghoubbet al-Kharab and its 'Gulf of Demons' reputation (Afar/Somali coastal belief); Cousteau expeditions",
        "source_quality": "fair",
        "attested": True,
        "research_notes": "Trimmed: real site (Ghoubbet al-Kharab, ~200 m deep, Devil's Islands) with genuine local demon/supernatural association, but 'monster' cryptid claims are speculative; hedged accordingly."
    },
    {
        "slug": "gr-mannen",
        "description": "Not independently attested in folklore literature. No Norwegian source records a mountain spirit called 'Gråmannen' in Trollheimen; the only attested use is the place name Gråmannen, a small summit and viewpoint near Kristiansand in Agder. The troll-guardian narrative in this entry is invented and appears in no ethnographic or folk-tradition source.",
        "source": "Review finding: unattested; name attested only as a summit near Kristiansand",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: only a Kristiansand viewpoint of that name; no Trollheimen mountain-spirit tradition. Mountain-guardian story is fabricated."
    },
    {
        "slug": "gu",
        "description": "Gu is a spirit of the Guro people of central Ivory Coast, known as the wife of Zamble, the great mythical being of the Guro, from whom he learned how to appear to humans; her mask dances in Guro masquerades. The entry's attribution to the Mossi of Burkina Faso is mistaken; the attested tradition is Guro, not Mossi.",
        "source": "Guro (Ivory Coast) oral tradition and masquerade; Zamble cycle of Guro mythology",
        "source_quality": "documented",
        "attested": True,
        "research_notes": "Corrected from unattested Mossi 'gu' to the attested Guro figure: wife of Zamble, danced in Guro mask ceremonies. Country attribution fixed from Burkina Faso to Ivory Coast."
    },
    {
        "slug": "guardian-spirits",
        "description": "Among the Cheyenne, guardian figures and sacred bundles hold a central place: the culture hero Sweet Medicine brought the Four Sacred Arrows, and Standing-on-the-Ground brought the Buffalo Hat, objects that guard the tribe and are tended by designated keepers. Individuals also acquire personal spirit guardians through vision quests.",
        "source": "Cheyenne tradition: Sweet Medicine and the Four Sacred Arrows; the Buffalo Hat; vision-quest guardian spirits",
        "source_quality": "documented",
        "attested": True,
        "research_notes": "Trimmed: kept the attested Cheyenne elements (Sweet Medicine, Four Sacred Arrows, Buffalo Hat, vision-quest guardians) and condensed the synthetic umbrella framing."
    },
    {
        "slug": "guri-kunna",
        "description": "Guri Kunna is a troll-woman of the coastal tradition of Froan and the Fosen-Hitra district in Trøndelag. In the best-known legend she is a giantess who dragged the islands of Froan toward Hitra, and her name survives in local place names. The common 'mermaid luring fishermen' framing is a later overlay; the attested figure is a giant troll-woman of the islets.",
        "source": "Trøndelag coastal legend (Froan/Fosen/Hitra); Norwegian place-name tradition",
        "source_quality": "documented",
        "attested": True,
        "research_notes": "Trimmed and corrected: Guri Kunna is a giant troll-woman (island-dragging legend of Froan), not a mermaid; inverted mermaid framing removed."
    },
    {
        "slug": "gutjion",
        "description": "Not independently attested in folklore literature. No Nama or Khoekhoe source documents a spirit called 'Gutjion'; the entry's wilderness-guardian details and Richtersveld specifics are invented. Genuine Nama tradition centers on figures such as the trickster-culture hero Heitsi-Eibib, but no 'Gutjion' appears in the recorded lore.",
        "source": "Review finding: unattested; no Nama source found; closest analogue is Heitsi-Eibib",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: generic wilderness-guardian with invented specifics; no named Nama tradition or collector."
    },
    {
        "slug": "gyeong",
        "description": "Not independently attested in folklore literature. No Korean source records a vampire called 'gyeong'. The Korean term for the hopping corpse is gangsi (gangshi), a loan from the Chinese jiangshi; 'gyeong' is not attested as a creature name, and the description is generic jiangshi filler wrongly assigned a Korean variant.",
        "source": "Review finding: unattested; Korean term for the hopping corpse is gangsi",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: 'gyeong' not a Korean creature name; the Korean jiangshi equivalent is gangsi. Text was generic jiangshi filler."
    },
    {
        "slug": "gygrid",
        "description": "Not independently attested in folklore literature. No Norwegian tradition names a giantess 'Gygrid'; the real terms are gyger (singular) and gygjer (plural), from Old Norse gygr, and appear in place names such as Gygra. 'Gygrid' is better known as the Norwegian translation of the Harry Potter character Hagrid. The invented plural 'gygrier' and mountain lore are unfounded.",
        "source": "Review finding: unattested; real terms are gyger/gygjer (Old Norse gygr)",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: 'Gygrid' is the Norwegian Hagrid; the real giantess term is gyger (gygra). Etymology, plural, and place-name claims invented."
    },
    {
        "slug": "haggs",
        "description": "Not independently attested in folklore literature. No source records a Manx or Saint Vincent being called 'Haggs'. The entry pairs an unverifiable Isle of Man fairy description with Saint Vincent metadata and names no tradition, collector, or text. Genuine Manx spirits include the buggane and fenodyree; genuine Saint Vincent lore includes the la diablesse and soucouyant.",
        "source": "Review finding: unattested; closest analogues buggane/fenodyree (Manx), la diablesse/soucouyant (Saint Vincent)",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: no 'Haggs' in Manx or Saint Vincent tradition; vague fairy filler with a country/source mismatch (Isle of Man text, Saint Vincent metadata)."
    },
    {
        "slug": "hawkguardianofojibwe-canada",
        "description": "Not independently attested in folklore literature. No Ojibwe (Anishinaabe) source documents a 'Hawk Guardian' spirit with the wild-rice and maple-sap role described; the text is template filler naming no tradition or story. Ojibwe spiritual beings include the thunderbirds (animikii) and personal manidoo guides, but a 'Hawk Guardian' as such is unattested.",
        "source": "Review finding: unattested; no named Ojibwe tradition",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: fabricated animal-spirit with no named Ojibwe story; template filler ending."
    },
    {
        "slug": "hawkguardianofojibwe-usa",
        "description": "Not independently attested in folklore literature. This entry is a verbatim copy of the Canadian record, still set in 'Canadian territories', attached to a USA metadata record. No Ojibwe tradition documents a 'Hawk Guardian'. The text is template filler with no named story, and the duplicate framing confirms it is fabricated.",
        "source": "Review finding: unattested duplicate of the Canadian entry",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: verbatim copy of the Canada record for a USA slug; no genuine tradition."
    },
    {
        "slug": "hawkspiritofblackfoot-canada",
        "description": "Not independently attested in folklore literature. No Blackfoot (Niitsitapi) source documents a 'Hawk Spirit' guiding people to buffalo or water; the description is generic filler ending with an empty 'In Canada folklore' clause. Blackfoot traditions do feature the beaver in creation narratives, but a 'Hawk Spirit' as described is unattested.",
        "source": "Review finding: unattested; no named Blackfoot tradition",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: generic invented 'Hawk Spirit' with no named Blackfoot story; template filler ending."
    },
    {
        "slug": "hiisi-portti-hiisi-s-gate",
        "description": "Not independently attested in folklore literature. No Finnish source describes a portal called 'Hiisi's Gate'; the resemblance is to Hiidenportti, which is the name of a national park in Kainuu, not a folklore phenomenon. Hiisi is a genuine figure of Finnish and Karelian tradition (appearing in the Kalevala), but the gate/portal mechanics here are invented.",
        "source": "Review finding: unattested; Hiidenportti is a national park name; Hiisi itself is real Finnish/Karelian tradition",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: no 'Hiisi's gate' portal in folklore; crossroad/portal mechanics invented. Hiisi itself is attested (Kalevala, folk belief)."
    },
    {
        "slug": "hinn",
        "description": "The Hinn are a class of pre-Adamite beings in Islamic and Arabian tradition. Ibn Kathir's exegesis of Qur'an 2:30 relates that the Hinn (also written hinn and binn) shed blood on earth before humanity, prompting the angels' question to God about creating Adam. Later cosmology groups hinn with binn, timm, and rimm among jinn sub-races.",
        "source": "Islamic tradition: Ibn Kathir, al-Bidaya wa'l-Nihaya (exegesis of Qur'an 2:30); later jinn-classification works",
        "source_quality": "documented",
        "attested": True,
        "research_notes": "Trimmed: kept the attested pre-Adamite Hinn (Ibn Kathir, Qur'an 2:30) and dropped the fabricated Bedouin animal-spirit 'covenant with the wild'."
    },
    {
        "slug": "hoggar-spirits-berber",
        "description": "Among the Kel Ahaggar, a Tuareg people of the Hoggar massif in southern Algeria, the desert and mountains are held to be inhabited by invisible spirits of the wild, known as essuf or kel essuf. These beings demand respect and are linked with solitude, healing rites, and the liminal spaces of the empty land. The invented specifics (crystal-horned rams, a rain-spirit of Mount Tahat) are removed.",
        "source": "Kel Ahaggar (Tuareg) belief in essuf / kel essuf; documented by Lhote (1944) and later ethnography",
        "source_quality": "documented",
        "attested": True,
        "research_notes": "Trimmed: retained the attested Kel Ahaggar essuf/desert-spirit belief; removed invented rams, mirage-masters, and Tahat rain-spirit specifics."
    },
    {
        "slug": "hughaman",
        "description": "Not independently attested in folklore literature. No Norwegian source records a doppelganger spirit called 'hughaman' or 'hughamar'; the term appears to be built from hug (mind) and ham (shape). The genuine Norwegian traditions of the vardøger (preceding double) and fylgje (attendant spirit) cover this territory under attested names.",
        "source": "Review finding: unattested; closest analogues are vardøger and fylgje",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: 'hughaman' absent from Norwegian sources; appears invented from hug+ham. Real analogues: vardøger, fylgje."
    },
    {
        "slug": "hulduflk-iceland",
        "description": "In Iceland, huldufólk ('hidden people') are a parallel race believed to live in rocks and cliffs, largely invisible to humans. They are central to Icelandic folklore, collected by Jón Árnason and others, and were to be treated with respect: building or blasting in their dwelling-places could bring misfortune. The entry's text is corrected from a Faroese copy to the distinct Icelandic tradition.",
        "source": "Icelandic folklore: Jón Árnason, Íslenzkar Þjóðsögur og Æfintýri (1862); Icelandic folk tradition",
        "source_quality": "documented",
        "attested": True,
        "research_notes": "Trimmed and corrected: the prior text was a verbatim copy of the Faroese entry; rewritten for the Icelandic huldufólk tradition (rock-dwelling hidden people, respect obligations)."
    },
    {
        "slug": "ifriqiya-tunisian",
        "description": "Not independently attested in folklore literature. 'Ifriqiya' is the medieval Arabic name of the North African province (from the Roman Africa, named for the Berber goddess Ifri and the Afri people), not a serpent of Tunisian legend. No Tunisian source describes a guardian dragon of that name; the earthquake and 'city built over its head' details are invented.",
        "source": "Review finding: unattested as a serpent; Ifriqiya is the Arabic name of the province; the attested figure is the Berber goddess Ifri/Ifru",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: Ifriqiya is a region name, not a dragon. Genuine figure is the Berber goddess Ifri/Ifru (fertility, caves); earthquake/serpent details invented."
    },
    {
        "slug": "kaugjagjuk",
        "description": "Kaugjagjuk (also Kaujjarjuk) is a central Inuit legend: a mistreated orphan boy, kicked and humiliated by his community, is taken up by the Moon Man, who rescues him and brings him to the moon, where he becomes a protector of the abused. The tale, documented among Inuit communities and retold in collections of Inuit stories, is not a trickster tale; the prankster framing is corrected here.",
        "source": "Inuit oral tradition; documented in 'Inuit Stories of Being and Rebirth' and Inuit legend collections",
        "source_quality": "documented",
        "attested": True,
        "research_notes": "Corrected from unattested prankster framing: the real Kaugjagjuk is the mistreated orphan rescued by the Moon Man (Inuit tradition)."
    },
    {
        "slug": "keepermaya-guatemala",
        "description": "Not independently attested in folklore literature. No Maya source documents a guardian spirit called 'Keeper'; the description is a generic 'custodian of sacred places' built from cenotes and jungle-ruin imagery with no named tradition. Maya religion does include specific guardians and deities, but no attested figure corresponds to this entry.",
        "source": "Review finding: unattested; no named Maya figure",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: fabricated generic 'Keeper' guardian-of-cenotes with no attested Maya tradition."
    },
    {
        "slug": "keepermaya-mexico",
        "description": "Not independently attested in folklore literature. This record repeats the same fabricated 'Keeper' entry with Mexican metadata and closes with the empty phrase 'known among the Mexico people'. No Maya tradition documents a guardian spirit named 'Keeper'; the entry is template filler with no named source or story.",
        "source": "Review finding: unattested duplicate with template filler",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: duplicate of the Guatemala 'Keeper' entry, closed with empty 'known among the Mexico people' filler."
    },
    {
        "slug": "keiju",
        "description": "The keijukainen (modern keiju) are small spirits of Finnish folk tradition, attested since Ganander's Mythologia Fennica (1789) as tiny flying beings connected with the dead — seen near funerals, graveyards, and roads, resembling snowflakes, small dolls, or flames, and counted among the kirkonväki death-spirits. The 'beautiful winged fairy' image is a later literary overlay.",
        "source": "Finnish folk tradition: Ganander, Mythologia Fennica (1789); Finnish folklore-archive records of keijukaiset",
        "source_quality": "documented",
        "attested": True,
        "research_notes": "Corrected from unattested modern fairy: the traditional keijukainen are small death-connected spirits (Ganander 1789, kirkonväki); the winged benevolent fairy is a literary overlay."
    },
    {
        "slug": "kerkennah-island-spirits",
        "description": "Not independently attested in folklore literature. The sunken-kingdom 'Atlantis' legend of Kerkennah is a modern retelling with no traditional source, and the ghost-inhabitant framing is invented. The real Kerkennah origin stories concern the founding families, notably the Ouled Bou Ali, as studied by Katherine Platt; no sunken kingdom or island-spirit cult appears in the recorded tradition.",
        "source": "Review finding: unattested as a sunken kingdom; real origin myth is the Ouled Bou Ali tradition (K. Platt, SOAS)",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: Atlantis-style sunken-kingdom framing is modern speculation; the recorded Kerkennah origin myths concern the Ouled Bou Ali settlers."
    },
    {
        "slug": "khas-uu",
        "description": "Not independently attested in folklore literature. No Mongolian source documents a tiger spirit called 'khas-uu', and tigers are not native to the Khentii or Khangai ranges. 'Khas' in Mongolian tradition refers to the swastika-like eternal symbol (has tamga), not an animal. The entry is a generic animal-guardian fabrication.",
        "source": "Review finding: unattested; 'khas' is the Mongolian swastika-symbol term (has tamga)",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: no Mongolian tiger spirit; tigers not native to those ranges; 'khas' denotes the swastika-like has symbol, not an animal."
    },
    {
        "slug": "khorba-spirits-berber",
        "description": "In Maghrebi folk belief, jinn and spirits are commonly said to haunt khorba, the ruined or abandoned buildings of North Africa — collapsed granaries, deserted ksour, and old fortifications. These beings are feared for mischief and nocturnal disturbance, and ruins are avoided after dark.",
        "source": "Maghrebi folk belief in jinn of ruins (khorba); Moroccan and Algerian oral tradition",
        "source_quality": "documented",
        "attested": True,
        "research_notes": "Trimmed: real Maghrebi jinn-in-ruins belief retained; removed the padded guardian-of-ruins characterization."
    },
    {
        "slug": "kibanda",
        "description": "Not independently attested in folklore literature. No Bunyoro or Ugandan source documents a water spirit called 'Kibanda', and 'Lake Bunyoro' does not exist; the python-and-hippo master-of-the-fishery is generic filler. The genuine water-god of the region is Mugizi, associated with Lake Albert and the Cwezi kubandwa spirit cult.",
        "source": "Review finding: unattested; closest analogue is Mugizi of Lake Albert (Bunyoro/Cwezi cult)",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: no 'Kibanda' spirit in Bunyoro tradition; 'Lake Bunyoro' invented. Real analogue: Mugizi, Lake Albert water-god."
    },
    {
        "slug": "kiev-ghost",
        "description": "The Ghost of Kyiv is a Ukrainian wartime legend that emerged in the first days of the 2022 Russian invasion: a mysterious MiG-29 pilot reportedly downing multiple Russian aircraft over the capital. It became a symbol of resistance and morale before officials clarified that the story was a composite. The entry's medieval 'catacomb haunting' is replaced with the attested modern legend.",
        "source": "Ukrainian wartime legend (2022); Ukrainian officials and press coverage",
        "source_quality": "documented",
        "attested": True,
        "research_notes": "Corrected from unattested medieval haunting: the Ghost of Kyiv is the attested 2022 Ukrainian pilot legend (resistance symbol, later clarified as composite)."
    },
    {
        "slug": "kitchimanitou-usa",
        "description": "Kitchi-Manitou (Gitche Manitou, Gichi-manidoo) is the Great Spirit of Algonquian-speaking peoples such as the Ojibwe, Potawatomi, and Menominee: the supreme creative power behind all life and spiritual authority, including the Midewiwin (Grand Medicine Society). The entry is condensed to the attested Great Spirit, and the empty 'known among the USA people' filler is removed.",
        "source": "Ojibwe/Algonquian religion: Gichi-manidoo as Great Spirit; Midewiwin tradition",
        "source_quality": "expert",
        "attested": True,
        "research_notes": "Trimmed: attested duplicate of the Canada entry; condensed and removed the empty 'known among the USA people' template filler."
    },
    {
        "slug": "klabautermann-germany",
        "description": "The Klabautermann is a ship spirit of German, Frisian, and Scandinavian maritime lore: a small sailor-specter who lives aboard a vessel, working unseen at night — mending ropes, pumping leaks, polishing — and guarding the ship, but who may turn malicious toward a slovenly or blasphemous crew, and whose visible appearance foretells shipwreck.",
        "source": "German/Frisian/Scandinavian maritime folklore; documented in seamanship and folk-belief literature",
        "source_quality": "documented",
        "attested": True,
        "research_notes": "Trimmed: attested ship-spirit content retained; removed the empty 'known among the Germany people' template filler."
    },
    {
        "slug": "koreisha-geongumi",
        "description": "Not independently attested in folklore literature. 'Koreisha' is the Japanese word for 'elderly people', and no Korean ghost tradition uses this name; the aliases 'geongumi' and 'wonhon' conflate invented names with the real Korean concept of wonhon, the resentful spirit of a wronged dead person. The attested figure is wonhon, not 'koreisha'.",
        "source": "Review finding: unattested as a Korean ghost; the real concept is wonhon",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: 'koreisha' is Japanese for 'elderly'; no such Korean ghost. Real Korean vengeful-spirit term is wonhon."
    },
    {
        "slug": "kosenj-bi",
        "description": "Kosenjōbi are ghost-fires of Japanese folklore: will-o'-the-wisp flames that appear over old battlefields, said to be the spirits of soldiers and horses killed in war, rising from the ground at dusk. The name is recorded in early modern collections such as the Shūchin-sō (17th century) and depicted in Toriyama Sekien's Konjaku Gazu Zoku Hyakki.",
        "source": "Japanese folklore: Shūchin-sō (17th c.); Toriyama Sekien, Konjaku Gazu Zoku Hyakki; yokai literature",
        "source_quality": "documented",
        "attested": True,
        "research_notes": "Corrected from unattested lantern tsukumogami: real kosenjōbi are battlefield ghost-fires (onibi), spirits of fallen soldiers and horses, recorded in Shūchin-sō and by Sekien."
    },
    {
        "slug": "krahom",
        "description": "Not independently attested in folklore literature. No Cambodian tradition documents a vengeful ghost called 'Krahom'; the Khmer word krahom simply means 'red', and the invented etymology and vengeful-ghost details are filler. Khmer spirit belief does include neak ta (tutelary guardians) and various ghosts, but no attested figure corresponds to this entry.",
        "source": "Review finding: unattested; krahom means 'red'; Khmer spirit tradition centers on neak ta",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: 'krahom' is the Khmer word for red; no ghost of that name. Genuine Khmer tutelary spirits are neak ta."
    },
    {
        "slug": "kulfre",
        "description": "Not independently attested in folklore literature. No Albanian source documents a mountain spirit called 'Kulfre' or a headless dancing phantom of the Albanian Alps; the description appears to be invented. Genuine Albanian tradition includes figures such as the zana (mountain fairies) and orë, but no 'Kulfre' appears in the recorded folklore.",
        "source": "Review finding: unattested; closest analogues are zana and orë",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: no 'Kulfre' in Albanian folklore; headless dancing mountain-spirit description is invented. Real figures: zana, orë."
    },
    {
        "slug": "kumasi-ghost",
        "description": "Not independently attested in folklore literature. No Ashanti (Asante) source documents a 'Kumasi Ghost' as a royal-court messenger spirit; the description is generic ancestor-belief applied to an invented figure. Akan tradition does recognize spirits of the dead such as the saman and the restless atofo, but no attested 'Kumasi Ghost' corresponds to this entry.",
        "source": "Review finding: unattested; Akan spirit terms are saman and atofo",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: no 'Kumasi Ghost' in Ashanti tradition; generic ancestor philosophizing. Real Akan spirit terms: saman (ghost), atofo (restless ghost)."
    },
    {
        "slug": "kumvo",
        "description": "Not independently attested in folklore literature. No Kwakwaka'wakw source documents a spirit called 'Kumvo'; the description is hedged ('would have been understood') generic spirit-world filler with no named figure or story. The Kwakwaka'wakw do have a rich ceremonial spirit world, but this name is unattested in their recorded traditions.",
        "source": "Review finding: unattested; no Kwakwaka'wakw source found",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: no 'Kumvo' in Kwakwaka'wakw tradition; hedged wording with no actual content."
    },
    {
        "slug": "kupua",
        "description": "In Hawaiian tradition, kupua are shapeshifting demigods and magical beings who can take many forms, with well-known examples such as Kamapua'a (the hog-god) and figures in the epic cycles collected in the 19th century. The description is condensed to the attested shapeshifter-demi god tradition; the invented 'summoned by kahuna' and 'twilight veil' specifics are removed.",
        "source": "Hawaiian oral tradition: kupua demigods (e.g., Kamapua'a) in 19th-century collections",
        "source_quality": "documented",
        "attested": True,
        "research_notes": "Trimmed: kept the attested Hawaiian kupua (shapeshifter demigods such as Kamapua'a); removed invented kahuna-summoning and twilight-veil details."
    },
    {
        "slug": "ladejarlens-gjenferd",
        "description": "Not independently attested in folklore literature. No Norwegian source documents a ghost of the Lade Jarls haunting the Lade district of Trondheim; the entry wraps genuine history of the Earls of Lade in an invented spectral-horseman tale with no cited tradition. Trondheim does have attested ghost stories, but the 'Ladejarl's ghost' as such is unattested.",
        "source": "Review finding: unattested; real history of the Earls of Lade without a ghost tradition",
        "source_quality": "poor",
        "attested": False,
        "research_notes": "Marked unattested: no documented ghost tradition of the Lade Jarls; invented spectral-horseman haunting over real history."
    },
    {
        "slug": "ladiablesse-dominica",
        "description": "La Diablesse (Lajables) is a figure of Dominican and wider Francophone-Caribbean folklore: a beautiful, elegantly dressed woman who lures men into the forest at night, revealing a cloven hoof or a withered leg under her long skirt. Dominican accounts describe her as a jumbie to be avoided on lonely roads. The text is corrected from the Saint Lucian version to the Dominican tradition.",
        "source": "Dominican (Francophone Caribbean) oral tradition; DOM767 Dominican folklore anthology",
        "source_quality": "documented",
        "attested": True,
        "research_notes": "Trimmed and corrected: prior text described Saint Lucia (country mismatch) and was cut off; rewritten to attested Dominica-specific Diablesse/Lajables material."
    },
]

errors = []
for e in entries:
    d = e["description"]
    if not (150 <= len(d) <= 400):
        errors.append(f"{e['slug']}: {len(d)} chars")
    for k in ("slug", "description", "source", "source_quality", "attested", "research_notes"):
        if k not in e:
            errors.append(f"{e['slug']}: missing key {k}")
    if e["source_quality"] not in ("well-documented", "fair", "good", "academic", "expert", "researched", "verified", "documented", "primary", "poor"):
        errors.append(f"{e['slug']}: bad source_quality {e['source_quality']}")

if errors:
    print("ERRORS:")
    for e in errors:
        print(" ", e)
    raise SystemExit(1)

with open("rewrite-05-output.json", "w", encoding="utf-8") as f:
    json.dump(entries, f, ensure_ascii=False, indent=2)
    f.write("\n")

tru = sum(1 for e in entries if e["attested"])
print(f"Wrote {len(entries)} entries; attested=true: {tru}, attested=false: {len(entries)-tru}")
