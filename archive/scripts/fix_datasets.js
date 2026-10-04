const fs = require('fs');

function getSlug(name) {
    if (!name) return 'unknown';
    return name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function fixStories() {
    console.log('Fixing stories.json...');
    try {
        const data = JSON.parse(fs.readFileSync('data/datasets/stories.json'));
        const usedSlugs = new Set();
        let fixedCount = 0;

        const processed = data.map(story => {
            let slug = story.slug;
            if (!slug) {
                slug = getSlug(story.title);
                fixedCount++;
            }

            // Handle collisions
            let finalSlug = slug;
            let counter = 1;
            while (usedSlugs.has(finalSlug)) {
                finalSlug = `${slug}-${counter++}`;
            }
            usedSlugs.add(finalSlug);
            
            return { ...story, slug: finalSlug };
        });

        fs.writeFileSync('data/datasets/stories.json', JSON.stringify(processed, null, 2));
        console.log(`Fixed ${fixedCount} missing slugs. Total entries: ${processed.length}. Unique slugs: ${usedSlugs.size}.`);
    } catch (e) {
        console.error(`Error fixing stories: ${e.message}`);
    }
}

function fixCreatures() {
    console.log('Fixing creatures.json...');
    try {
        const data = JSON.parse(fs.readFileSync('data/datasets/creatures.json'));
        const usedSlugs = new Set();
        let fixedCount = 0;

        const processed = data.map(creature => {
            let slug = creature.slug;
            
            // We only fix if the slug is already used by another entry
            // Since we process sequentially, if the slug is in usedSlugs, it's a duplicate.
            if (usedSlugs.has(slug)) {
                const baseSlug = slug || getSlug(creature.name);
                let finalSlug = baseSlug;
                let counter = 1;
                while (usedSlugs.has(finalSlug)) {
                    finalSlug = `${baseSlug}-${counter++}`;
                }
                slug = finalSlug;
                fixedCount++;
            }
            
            usedSlugs.add(slug);
            return { ...creature, slug: slug };
        });

        fs.writeFileSync('data/datasets/creatures.json', JSON.stringify(processed, null, 2));
        console.log(`Fixed ${fixedCount} duplicate slugs. Total entries: ${processed.length}. Unique slugs: ${usedSlugs.size}.`);
    } catch (e) {
        console.error(`Error fixing creatures: ${e.message}`);
    }
}

fixStories();
fixCreatures();
