const fs = require('fs');
const path = require('path');

// Timer mapping per level
const LEVEL_TIMERS = {
  1: 30,
  2: 30,
  3: 20,
  4: 20,
  5: 20,
  6: 10,
};

/** Simple Fisher‑Yates shuffle that also updates the correct index */
function shuffleChoices(choices, correctIndex) {
  const arr = choices.slice();
  let correct = correctIndex;
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // swap
    [arr[i], arr[j]] = [arr[j], arr[i]];
    if (i === correct) correct = j;
    else if (j === correct) correct = i;
  }
  return { shuffled: arr, newCorrect: correct };
}

/** Load a random JSON file from a level directory */
async function loadRandomQuestion(level) {
  const levelDir = path.join(__dirname, '..', '..', 'data', 'quiz-pool', `level${level}`);
  try {
    const files = (await fs.promises.readdir(levelDir)).filter(f => f !== 'index.json');
    if (!files.length) throw new Error('No files in pool');
    const file = files[Math.floor(Math.random() * files.length)];
    const raw = await fs.promises.readFile(path.join(levelDir, file), 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    // fallback to static template (will be provided in data/quiz-templates)
    const templatePath = path.join(__dirname, '..', '..', 'data', 'quiz-templates', `level${level}.json`);
    const raw = await fs.promises.readFile(templatePath, 'utf8');
    return JSON.parse(raw);
  }
}

/** Public API */
async function getQuestion(level) {
  if (level < 1 || level > 6) throw new Error('Invalid level');
  const base = await loadRandomQuestion(level);
  const { shuffled, newCorrect } = shuffleChoices(base.choices, base.correctIndex);
  return {
    prompt: base.prompt,
    choices: shuffled,
    correctIndex: newCorrect,
    timer: LEVEL_TIMERS[level],
    extra: base.extra || {},
  };
}

module.exports = { getQuestion };
