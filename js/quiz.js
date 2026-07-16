// Updated quiz logic for Whispering Lore
// Supports scope, geography, difficulty, question count, and creature/story mix.

(() => {
  const quizRoot = document.getElementById('quiz-root');
  const startBtn = document.getElementById('start-quiz');
  const levelSelect = document.getElementById('quiz-level');
  const countSelect = document.getElementById('quiz-count');
  const scopeSelect = document.getElementById('quiz-scope');
  const geoSelect = document.getElementById('quiz-geo');

  let maxQuestions = 10;
  let currentLevel = 1;
  let score = 0;
  let asked = 0;
  let timerId = null;
  let timeLeft = 0;
  let pool = [];
  let askedIndices = [];
  let answering = false;

  const difficultySettings = {
    1: {time: 30},
    2: {time: 30},
    3: {time: 20},
    4: {time: 20},
    5: {time: 10},
    6: {time: 10},
  };

  // ---------------------------------------------------------------------------
  // Helper: fetch JSON
  const fetchJSON = (url) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText)); }
          catch (e) { reject(e); }
        } else { reject(new Error(xhr.statusText)); }
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send();
    });
  };

  // ---------------------------------------------------------------------------
  // Load unique countries and regions for the dropdown
  const initGeoDropdown = async () => {
    try {
      const [regions, countries] = await Promise.all([
        fetchJSON('data/datasets/geo-regions.json'),
        fetchJSON('data/datasets/geo-countries.json')
      ]);
      populateGeoDropdown(regions, countries);
    } catch (e) {
      console.warn('Fetch for geo data failed, trying inline data...', e);
      if (window.__REGIONS && window.__COUNTRIES) {
        populateGeoDropdown(window.__REGIONS, window.__COUNTRIES);
      } else {
        console.error('Failed to populate geography dropdown:', e);
      }
    }
  };

  const populateGeoDropdown = (regions, countries) => {
    regions.sort();
    countries.sort();
    const regionSet = new Set(regions);
    const geoSelect = document.getElementById('quiz-geo');
    const regionDivider = document.createElement('option');
    regionDivider.textContent = '---- Regions ----';
    regionDivider.disabled = true;
    geoSelect.appendChild(regionDivider);
    regions.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r;
      geoSelect.appendChild(opt);
    });
    const countryDivider = document.createElement('option');
    countryDivider.textContent = '---- Countries ----';
    countryDivider.disabled = true;
    geoSelect.appendChild(countryDivider);
    countries.forEach(c => {
      if (regionSet.has(c)) return;
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      geoSelect.appendChild(opt);
    });
  };

  // ---------------------------------------------------------------------------
  // Load pool based on current settings
  const loadPool = async () => {
    const level = currentLevel;
    const index = await fetchJSON(`data/quiz-pool/level${level}/index.json`);
    const promises = index.map(fn => fetchJSON(`data/quiz-pool/level${level}/${fn}`).then(q => ({...q, __file: fn})).catch(function() { return null; }));
    const valid = (await Promise.all(promises)).filter(Boolean);
    applyFilters(valid);
  };

  // Helper to apply scope/geography filters and set the pool
  const applyFilters = (all) => {
    const scope = scopeSelect.value;
    const geoValue = geoSelect.value;
    const filtered = all.filter(q => {
      if (scope !== 'both' && q.type && q.type !== scope) return false;
      if (geoValue !== 'all') {
        if (!q.extra || !q.extra.geo) return false;
        if (q.extra.geo.country !== geoValue && q.extra.geo.region !== geoValue) return false;
      }
      return true;
    });
    pool = filtered;
  };

  // ---------------------------------------------------------------------------
  // Transform question shape to match UI expectations
  const normalizeQuestion = (q) => {
    const answers = q.choices.map((c,i) => ({text: c, is_correct: i === q.correctIndex}));
    const result = {...q, answers};
    if (q.extra && q.extra.trueFalse) {
      result.sub_question = {
        prompt: q.extra.trueFalse.prompt,
        true_is_correct: q.extra.trueFalse.answer === true
      };
    }
    return result;
  };

  // ---------------------------------------------------------------------------
  // Render next question or final screen
  const renderNext = async () => {
    if (asked >= maxQuestions) {
      showFinal();
      return;
    }
    if (askedIndices.length >= pool.length) {
      if (asked > 0) { showFinal(); return; }
      quizRoot.innerHTML = `<p>No questions match the selected filters.</p>`;
      return;
    }
    // Pick an unused question
    let idx;
    do {
      idx = Math.floor(Math.random() * pool.length);
    } while (askedIndices.indexOf(idx) !== -1);
    askedIndices.push(idx);
    const raw = pool[idx];
    const question = normalizeQuestion(raw);
    const correctIndex = question.correctIndex;
    asked++;
    timeLeft = difficultySettings[currentLevel].time;
    const html = `
      <section class="quiz-question">
        <h2>Question ${asked}/${maxQuestions}</h2>
        <p class="quiz-prompt">${window.__sharedUtils.escapeXml(question.prompt)}</p>
        <div class="quiz-answers">
          ${question.answers.map((a, i) => `<button class="quiz-answer" data-index="${i}">${window.__sharedUtils.escapeXml(a.text)}</button>`).join('')}
        </div>
        <div class="quiz-timer">Time left: <span id="timer-display">${timeLeft}</span>s</div>
      </section>
    `;
    quizRoot.innerHTML = html;
    document.getElementById('timer-display').textContent = timeLeft;
    timerId = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(timerId);
        handleAnswer(null, question);
      } else {
        document.getElementById('timer-display').textContent = timeLeft;
      }
    }, 1000);
    document.querySelectorAll('.quiz-answer').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(parseInt(btn.dataset.index, 10) === correctIndex, question, parseInt(btn.dataset.index, 10)));
    });
  };

  const handleAnswer = (isCorrect, q, chosenIndex) => {
    if (answering) return;
    answering = true;
    clearInterval(timerId);
    const fb = document.createElement('div');
    fb.className = 'quiz-feedback';
    if (isCorrect) { score++; fb.textContent = 'Correct!'; }
    else { fb.textContent = 'Incorrect.'; }
    document.querySelectorAll('.quiz-answer').forEach(btn => {
      const idx = parseInt(btn.dataset.index, 10);
      if (idx === q.correctIndex) btn.classList.add('correct');
      else if (idx === chosenIndex && !isCorrect) btn.classList.add('incorrect');
    });
    quizRoot.appendChild(fb);
    if (currentLevel === 6 && q.sub_question && asked <= maxQuestions) {
      setTimeout(() => { answering = false; renderSubQuestion(q.sub_question); }, 1500);
    } else {
      setTimeout(() => { answering = false; renderNext(); }, 1500);
    }
  };

  const renderSubQuestion = (sub) => {
    const trueIsCorrect = sub.true_is_correct;
    timeLeft = difficultySettings[currentLevel].time;
    const html = `
      <section class="quiz-subquestion">
        <h3>Sub‑question</h3>
        <p>${window.__sharedUtils.escapeXml(sub.prompt)}</p>
        <div class="quiz-answers">
          <button class="quiz-answer" data-answer="true">True</button>
          <button class="quiz-answer" data-answer="false">False</button>
        </div>
        <div class="quiz-timer">Time left: <span id="timer-display">${timeLeft}</span>s</div>
      </section>
    `;
    quizRoot.innerHTML = html;
    document.getElementById('timer-display').textContent = timeLeft;
    timerId = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(timerId);
        if (answering) return;
        answering = true;
        document.querySelectorAll('.quiz-answer').forEach(b => {
          b.classList.add(b.dataset.answer === 'true' === trueIsCorrect ? 'correct' : 'incorrect');
        });
        const fb = document.createElement('div');
        fb.className = 'quiz-feedback';
        fb.textContent = 'Time\'s up!';
        quizRoot.appendChild(fb);
        setTimeout(() => { answering = false; renderNext(); }, 1500);
      } else {
        document.getElementById('timer-display').textContent = timeLeft;
      }
    }, 1000);
    document.querySelectorAll('.quiz-answer').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answering) return;
        answering = true;
        clearInterval(timerId);
        const chosen = btn.dataset.answer === 'true';
        const correct = chosen === trueIsCorrect;
        if (correct) score++;
        document.querySelectorAll('.quiz-answer').forEach(b => {
          b.classList.add((b.dataset.answer === 'true') === trueIsCorrect ? 'correct' : 'incorrect');
        });
        const fb = document.createElement('div');
        fb.className = 'quiz-feedback';
        fb.textContent = correct ? 'Correct!' : 'Incorrect.';
        quizRoot.appendChild(fb);
        setTimeout(() => { answering = false; renderNext(); }, 1500);
      });
    });
  };

  const showFinal = () => {
    const displayScore = Math.min(score, maxQuestions);
    const percent = Math.round((displayScore / maxQuestions) * 100);
    const html = `
      <section class="quiz-final">
        <h2>Quiz Complete</h2>
        <p>You answered ${displayScore} out of ${maxQuestions} correctly (${percent}%).</p>
        <button id="restart-quiz" class="btn-ghost">Play Again</button>
      </section>
    `;
    quizRoot.innerHTML = html;
    document.getElementById('restart-quiz').addEventListener('click', startQuiz);
  };

  const startQuiz = async () => {
    clearInterval(timerId);
    score = 0; asked = 0; askedIndices = [];
    currentLevel = parseInt(levelSelect.value, 10);
    maxQuestions = parseInt(countSelect.value, 10);
    quizRoot.innerHTML = `<p style="text-align:center;padding:2rem;color:var(--text-secondary);">Loading questions…</p>`;
    await loadPool();
    renderNext();
  };

  if (startBtn) startBtn.addEventListener('click', startQuiz);
  initGeoDropdown();
})();