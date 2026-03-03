let PROMPTS = {}, spans = [], idx = 0;
let started = false, timer;
let timeLeft, initialTime;
let correct = 0, total = 0, combo = 0, bestCombo = 0;
let wpmSamples = [], errorSamples = [];

const el = id => document.getElementById(id);

/* -------- load prompts -------- */
fetch('prompts.json')
    .then(r => r.json())
    .then(j => { PROMPTS = j; reset(); });

function buildPrompt(diff, min) {
    let text = '';
    while (text.split(/\s+/).length < min) {
        text += (text ? ' ' : '') +
            PROMPTS[diff][Math.floor(Math.random() * PROMPTS[diff].length)];
    }
    return text;
}

/* -------- reset -------- */
function reset() {
    clearInterval(timer);
    document.removeEventListener('keydown', keyHandler);

    idx = correct = total = combo = bestCombo = 0;
    wpmSamples = [];
    errorSamples = [];
    started = false;

    initialTime = timeLeft = +el('time').value;
    el('timeDisplay').textContent = timeLeft;
    el('wpm').textContent = 0;
    el('accuracy').textContent = 100;
    el('combo').textContent = 0;
    el('bestCombo').textContent = 0;

    el('textDisplay').innerHTML = '';
    spans = [...buildPrompt(el('difficulty').value, +el('length').value)]
        .map((c, i) => {
            const s = document.createElement('span');
            s.textContent = c;
            if (i === 0) s.classList.add('current');
            el('textDisplay').appendChild(s);
            return s;
        });

    setTimeout(() => document.addEventListener('keydown', keyHandler), 50);
}

/* -------- timer -------- */
function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        el('timeDisplay').textContent = timeLeft;

        const elapsed = initialTime - timeLeft;
        const wpm = Math.round((correct / 5) / (elapsed / 60) || 0);
        wpmSamples.push(wpm);
        el('wpm').textContent = wpm;

        if (timeLeft <= 0) finish();
    }, 1000);
}

/* -------- typing -------- */
function keyHandler(e) {
    if (!started) {
        started = true;
        startTimer();
    }

    if (
        ['Shift', 'Alt', 'Control', 'Meta', 'Enter', 'Tab'].includes(e.key)
    ) return;

    if (e.key === 'Backspace') {
        if (idx > 0) {
            spans[idx]?.classList.remove('current');
            idx--;
            spans[idx].classList.remove('correct', 'incorrect');
            spans[idx].classList.add('current');
            combo = 0;
        }
        return;
    }

    e.preventDefault();

    const s = spans[idx];
    if (!s) return finish();

    if (e.key === s.textContent) {
        s.classList.add('correct');
        correct++;
        combo++;
        bestCombo = Math.max(bestCombo, combo);
    } else {
        s.classList.add('incorrect');
        combo = 0;
        errorSamples.push(wpmSamples.length);
    }

    total++;
    s.classList.remove('current');
    idx++;
    spans[idx]?.classList.add('current');

    el('combo').textContent = combo;
    el('bestCombo').textContent = bestCombo;
    el('accuracy').textContent = Math.round((correct / total) * 100);

    if (idx >= spans.length) finish();
}

/* -------- consistency -------- */
function consistencyScore() {
    const avg = wpmSamples.reduce((a, b) => a + b, 0) / wpmSamples.length;
    const variance = wpmSamples.reduce((a, b) => a + (b - avg) ** 2, 0) / wpmSamples.length;
    return Math.max(0, 100 - Math.sqrt(variance)).toFixed(0);
}

/* -------- graph -------- */
function drawGraph() {
    const c = el('graph'), ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);

    const pad = 20;
    const max = Math.max(...wpmSamples) * 1.1;

    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary');
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, c.height - pad);
    ctx.lineTo(c.width - pad, c.height - pad);
    ctx.stroke();

    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--secondary');
    ctx.lineWidth = 2;
    ctx.beginPath();
    wpmSamples.forEach((w, i) => {
        const x = pad + (i / (wpmSamples.length - 1)) * (c.width - pad * 2);
        const y = c.height - pad - (w / max) * (c.height - pad * 2);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.stroke();
}

/* -------- finish -------- */
function finish() {
    clearInterval(timer);
    document.removeEventListener('keydown', keyHandler);

    el('mWpm').textContent = el('wpm').textContent;
    el('mAcc').textContent = el('accuracy').textContent + '%';
    el('mTime').textContent = (initialTime - timeLeft) + 's';
    el('mCons').textContent = consistencyScore() + '%';

    el('modal').classList.add('show');
    drawGraph();
}

/* -------- events -------- */
el('restart').onclick = reset;
el('restartModal').onclick = () => {
    el('modal').classList.remove('show');
    reset();
};
el('close').onclick = () => el('modal').classList.remove('show');
['difficulty', 'length', 'time'].forEach(i => el(i).onchange = reset);
