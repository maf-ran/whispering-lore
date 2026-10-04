const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'datasets');
const QUIZ_DIR = path.join(__dirname, '..', 'data', 'quiz-pool');

const creatures = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'creatures.json'), 'utf-8'));

// Question templates by difficulty
const templates = {
  1: [
    { prompt: (c) => `Which country is the ${c.name} from?`,
      makeChoices: (c, pool) => {
        const correct = c.country;
        const wrong = pool.filter(p => p.country !== correct).map(p => p.country);
        const distinct = [...new Set(wrong)];
        const shuffled = [correct, ...shuffle(distinct).slice(0, 3)];
        const choices = shuffle(shuffled);
        return { choices, correctIndex: choices.indexOf(correct) };
      }
    },
    { prompt: (c) => `What type of creature is a ${c.name}?`,
      makeChoices: (c, pool) => {
        const correct = c.type;
        const wrong = pool.filter(p => p.type !== correct).map(p => p.type);
        const distinct = [...new Set(wrong)];
        const sliced = distinct.slice(0, 3);
        if (sliced.length < 3) return null;
        const shuffled = [correct, ...sliced];
        const choices = shuffle(shuffled);
        return { choices, correctIndex: choices.indexOf(correct) };
      }
    }
  ],
  2: [
    { prompt: (c) => `Which region does the ${c.name} come from?`,
      makeChoices: (c, pool) => {
        const correct = c.region || 'Unknown';
        const wrong = pool.filter(p => p.region !== correct).map(p => p.region);
        const distinct = [...new Set(wrong)];
        const sliced = distinct.slice(0, 3);
        if (sliced.length < 3) return null;
        const shuffled = [correct, ...sliced];
        const choices = shuffle(shuffled);
        return { choices, correctIndex: choices.indexOf(correct) };
      }
    }
  ],
  3: [
    { prompt: (c) => `Where is a ${c.name} said to dwell?`,
      makeChoices: (c, pool) => {
        const correct = c.habitat && c.habitat.length > 10 ? c.habitat.slice(0, 60) : 'Forests and wilderness';
        const wrong = pool.filter(p => p.habitat && p.habitat !== c.habitat).map(p => p.habitat);
        const distinct = [...new Set(wrong)].filter(h => h && h.length > 5);
        const sliced = distinct.slice(0, 3);
        if (sliced.length < 3) return null;
        const shuffled = [correct, ...sliced];
        const choices = shuffle(shuffled);
        return { choices, correctIndex: choices.indexOf(correct) };
      }
    }
  ],
  4: [
    { prompt: (c) => `How is a ${c.name} described?`,
      makeChoices: (c, pool) => {
        const correct = c.appearance && c.appearance.length > 15 ? c.appearance.slice(0, 80) : null;
        if (!correct) return null;
        const wrong = pool.filter(p => p.appearance && p.appearance !== c.appearance).map(p => p.appearance);
        const distinct = [...new Set(wrong)].filter(a => a && a.length > 10);
        const sliced = distinct.slice(0, 3);
        if (sliced.length < 3) return null;
        const shuffled = [correct, ...sliced];
        const choices = shuffle(shuffled);
        return { choices, correctIndex: choices.indexOf(correct) };
      }
    }
  ],
  5: [
    { prompt: (c) => `What cultural significance does the ${c.name} hold?`,
      makeChoices: (c, pool) => {
        if (!c.cultural_significance || c.cultural_significance.length < 15) return null;
        const correct = c.cultural_significance.slice(0, 80);
        const wrong = pool.filter(p => p.cultural_significance && p.cultural_significance !== c.cultural_significance).map(p => p.cultural_significance);
        const distinct = [...new Set(wrong)].filter(s => s && s.length > 10);
        const sliced = distinct.slice(0, 3);
        if (sliced.length < 3) return null;
        const shuffled = [correct, ...sliced];
        const choices = shuffle(shuffled);
        return { choices, correctIndex: choices.indexOf(correct) };
      }
    }
  ],
  6: [
    {
      prompt: (c) => `True or false: The ${c.name} is from ${c.country}.`,
      isTrueFalse: true,
      correctBool: true,
      sub_question: { prompt: (c) => `The ${c.name} is a type of ${c.type}.`, true_is_correct: true }
    },
    {
      prompt: (c) => `True or false: The ${c.name} primarily dwells in ${c.habitat ? c.habitat.split(/[,.]/)[0].trim() : 'the wilderness'}.`,
      isTrueFalse: true,
      correctBool: true,
      sub_question: { prompt: (c) => `The ${c.name} is native to ${c.region || 'its region'}.`, true_is_correct: true }
    }
  ]
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const byRegion = {};
creatures.forEach(c => {
  const region = c.region || 'Unknown';
  if (!byRegion[region]) byRegion[region] = [];
  byRegion[region].push(c);
});

let questionCounter = 0;
const questions = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

Object.entries(byRegion).forEach(([region, pool]) => {
  const shuffled = shuffle(pool);
  const targetPerRegion = Math.max(2, Math.floor(shuffled.length / 30));

  shuffled.slice(0, targetPerRegion).forEach(c => {
    [1, 2, 3, 4, 5, 6].forEach(level => {
      (templates[level] || []).forEach(tmpl => {
        if (tmpl.isTrueFalse) {
          questionCounter++;
          const q = {
            type: 'creatures',
            prompt: tmpl.prompt(c),
            choices: ['True', 'False'],
            correctIndex: tmpl.correctBool ? 0 : 1,
            extra: {
              geo: { country: c.country, region: c.region },
              trueFalse: {
                prompt: tmpl.sub_question.prompt(c),
                answer: tmpl.sub_question.true_is_correct
              }
            }
          };
          questions[level].push(q);
          return;
        }
        const result = tmpl.makeChoices(c, creatures);
        if (!result) return;
        questionCounter++;
        questions[level].push({
          type: 'creatures',
          prompt: tmpl.prompt(c),
          choices: result.choices,
          correctIndex: result.correctIndex,
          extra: {
            geo: { country: c.country, region: c.region }
          }
        });
      });
    });
  });
});

console.log(`Generated ${questionCounter} questions total`);

[1, 2, 3, 4, 5, 6].forEach(level => {
  const dir = path.join(QUIZ_DIR, `level${level}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const existing = fs.readdirSync(dir).filter(f => f.startsWith('auto-'));
  existing.forEach(f => fs.unlinkSync(path.join(dir, f)));

  const pool = (questions[level] || []);
  const files = [];
  pool.forEach((q, i) => {
    const fn = `auto-${level}-${i + 1}.json`;
    fs.writeFileSync(path.join(dir, fn), JSON.stringify(q, null, 2), 'utf-8');
    files.push(fn);
  });

  const existingFiles = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('auto-') && f !== 'index.json');
  const allFiles = [...existingFiles, ...files];

  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(allFiles, null, 2), 'utf-8');
  console.log(`Level ${level}: ${pool.length} auto-generated + ${existingFiles.length} existing = ${allFiles.length} total`);
});
