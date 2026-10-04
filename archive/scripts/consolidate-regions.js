const fs = require('fs');
const path = require('path');

const creaturesPath = path.join(__dirname, '../data/datasets/creatures.json');

const REGION_MAP = {
    'Japanese': 'East Asia and Pacific',
    'Korean': 'East Asia and Pacific',
    'Chinese': 'East Asia and Pacific',
    'Vietnamese': 'East Asia and Pacific',
    'Thai': 'Southeast Asia',
    'Indonesian': 'Southeast Asia',
    'Malaysian': 'Southeast Asia',
    'Filipino': 'Southeast Asia',
    'Cambodian': 'Southeast Asia',
    'Laotian': 'Southeast Asia',
    'Indian': 'South Asia',
    'Pakistani': 'South Asia',
    'Bengali': 'South Asia',
    'Sri Lankan': 'South Asia',
    'Nepali': 'South Asia',
    'Bhutanese': 'South Asia',
    'Ghanaian': 'West Africa',
    'Nigerian': 'West Africa',
    'Senegalese': 'West Africa',
    'Akan': 'West Africa',
    'Yoruba': 'West Africa',
    ' la la l la': 'West Africa',
    'Egyptian': 'North Africa',
    'Tunisian': 'North Africa',
    'Algerian': 'North Africa',
    'Moroccan': 'North Africa',
    'Libyan': 'North Africa',
    ' la la l la': 'North Africa',
    'Swedish': 'Nordic',
    'Norwegian': 'Nordic',
    'Danish': 'Nordic',
    'Icelandic': 'Nordic',
    'Finnish': 'Nordic',
    'Sami': 'Nordic',
    'English': 'Germanic',
    'Scottish': 'Celtic',
    'Irish': 'Celtic',
    'Welsh': 'Celtic',
    'French': 'Germanic',
    'German': 'Germanic',
    'Italian': 'Mediterranean',
    'Spanish': 'Mediterranean',
    'Greek': 'Mediterranean',
    'Turkish': 'Middle East and North Africa',
    'Persian': 'Middle East and North Africa',
    'Arabic': 'Middle East and North Africa',
    'Mexican': 'Mesoamerica',
    'Guatemalan': 'Mesoamerica',
    'Belizean': 'Mesoamerica',
    'Honduran': 'Mesoamerica',
    'Salvadoran': 'Mesoamerica',
    'Nicaraguan': 'Mesoamerica',
    'Costa Rican': 'Mesoamerica',
    'Panamanian': 'Mesoamerica',
    'Brazilian': 'South America',
    'Argentine': 'South America',
    'Chilean': 'South America',
    'Colombian': 'South America',
    'Peruvian': 'South America',
    'Venezuelan': 'South America',
    'Ecuadorian': 'South America',
    'Bolivian': 'South America',
    'Paraguayan': 'South America',
    'Uruguayan': 'South America',
    'Canadian': 'North America',
    'American': 'North America',
    'Navajo': 'North America',
    'Hopi': 'North America',
    'Zuni': 'North America',
    'Apache': 'North America',
    'Lakota': 'North America',
    'Cherokee': 'North America',
    'Inuit': 'Arctic',
};

try {
    const creatures = JSON.parse(fs.readFileSync(creaturesPath, 'utf8'));
    
    let fixedCount = 0;
    const updatedCreatures = creatures.map(c => {
        const originalRegion = c.region;
        let newRegion = originalRegion;

        if (REGION_MAP[originalRegion]) {
            newRegion = REGION_MAP[originalRegion];
        } else {
            // Heuristic: try to match common words
            for (const [key, val] of Object.entries(REGION_MAP)) {
                if (originalRegion.includes(key)) {
                    newRegion = val;
                    break;
                }
            }
        }

        if (newRegion !== originalRegion) {
            fixedCount++;
            return { ...c, region: newRegion };
        }
        return c;
    });

    fs.writeFileSync(creaturesPath, JSON.stringify(updatedCreatures, null, 2));
    console.log(`Consolidated ${fixedCount} creature regions.`);
} catch (error) {
    console.error('Error consolidating regions:', error);
    process.exit(1);
}
