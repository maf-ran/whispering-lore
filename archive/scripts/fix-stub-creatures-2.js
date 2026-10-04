const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const filePath = path.join(root, 'data/datasets/creatures.json');
const creatures = require(filePath);

const expansions = {
  'lindworm-scandinavia': {
    description: 'The Lindworm is a serpentine dragon from Scandinavian mythology, a massive legless or two-legged reptile that guards treasures, haunts deep forests, and terrorizes rural communities. Unlike the winged dragons of southern Europe, the Lindworm crawls on its belly like a great snake, with iridescent scales and a venomous bite. In Swedish and Norwegian folklore, Lindworms often appear as cursed princes or princesses who can only be freed by a brave knight or a clever maiden. They are associated with ancient burial mounds and the wild, untamed spaces of the Nordic landscape, and stories of Lindworm encounters served as cautionary tales about venturing too deep into the forest.',
    appearance: 'The Lindworm appears as a massive serpentine creature, sometimes dozens of meters long, with a thick body covered in overlapping scales of dark green, black, or iridescent blue. It has small or vestigial front legs, a horned head with glowing eyes, and a forked tongue that flickers with venom. Some traditions depict it wearing a golden crown or entwined with treasure.',
    behavior: 'Territorial and cunning, the Lindworm coils around its hoard and strikes at any intruder. It can be deceived by riddles, clever bargains, or the scent of linen. In many stories, it offers a choice between wisdom and treasure, punishing the greedy and rewarding the humble.',
    habitat: 'Deep Nordic forests, burial mounds, underground caverns, and the wilderness between settlements',
    cultural_significance: 'The Lindworm embodies the Scandinavian fear and respect for the wild, untamed forces of nature. Its stories explore themes of transformation, the power of cleverness over strength, and the boundary between the human and monstrous worlds.'
  },
  'lindwurm': {
    description: 'The Lindwurm is the German variant of the Lindworm dragon, a great serpentine beast that haunts the forests, caves, and river valleys of the Germanic lands. In German folklore, Lindwurms are often depicted as guardians of ancient hoards or as the cursed forms of human beings punished for their sins. The city of Linz, Austria, takes its name from a Lindwurm legend in which a great dragon terrorized the Danube valley until slain by a brave knight. Lindwurms in German tradition tend to be more bestial than their Scandinavian counterparts, lacking the capacity for speech or bargains, and are instead forces of pure destruction that must be overcome through martial valor.',
    appearance: 'The German Lindwurm is a massive wingless dragon with a thick, muscular body covered in dark iron-grey scales. It has two pairs of clawed legs, a heavy jaw lined with rows of serrated teeth, and a long whiplike tail capable of shattering trees. Its eyes burn like coals, and smoke curls from its nostrils.',
    behavior: 'Aggressive and territorial, the Lindwurm attacks anything that enters its domain. Unlike the Scandinavian Lindworm, it cannot be bargained with or reasoned with — it must be fought and defeated. It raids villages for livestock and burns crops with its fiery breath.',
    habitat: 'Mountain caves, dense forests, and river gorges throughout the German-speaking lands',
    cultural_significance: 'The Lindwurm represents the raw destructive power of nature that must be overcome by human courage. Its legends inspired the dragon-slaying traditions of medieval Germanic chivalry and are preserved in city coats of arms across Central Europe.'
  }
};

let updated = 0;
creatures.forEach(c => {
  if (expansions[c.slug]) {
    const e = expansions[c.slug];
    Object.assign(c, e);
    updated++;
  }
});

fs.writeFileSync(filePath, JSON.stringify(creatures, null, 2) + '\n');
console.log(`Updated ${updated} creatures`);
