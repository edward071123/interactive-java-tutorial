const SECTION_MAP = {
    'fullstack': 'sec-fullstack',
    'web-quartet': 'sec-web-quartet',
    'entry': 'sec-entry',
    'var-mem': 'sec-var-mem',
    'object': 'tab-object-sec',
    'ifelse': 'sec-ifelse',
    'forloop': 'sec-forloop',
    'ai-magic': 'sec-ai-magic',
    'sql': 'sec-sql'
};
const SECTION_STORAGE_KEY = 'java-lab-active-section';
const SECTION_ANIMATION_MS = 650;
const FOR_LOOP_SPEED_STORAGE_KEY = 'java-lab-for-speed';
const FOR_LOOP_SPEED_PRESETS = {
    slow: { label: '慢速', multiplier: 1.45 },
    normal: { label: '標準', multiplier: 1 },
    fast: { label: '快速', multiplier: 0.7 }
};
let currentForLoopSpeed = 'normal';

function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
}

function debounce(fn, wait = 120) {
    let timeoutId;
    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => fn(...args), wait);
    };
}

function persistActiveSection(sectionId) {
    try {
        localStorage.setItem(SECTION_STORAGE_KEY, sectionId);
    } catch (_) {
        // Ignore storage failures (private mode / disabled storage)
    }
}

function restoreActiveSection() {
    try {
        const saved = localStorage.getItem(SECTION_STORAGE_KEY);
        if (saved && SECTION_MAP[saved]) {
            showSection(saved, { skipPersist: true });
        }
    } catch (_) {
        // Ignore storage failures
    }
}

function getForLoopSpeedProfile() {
    return FOR_LOOP_SPEED_PRESETS[currentForLoopSpeed] || FOR_LOOP_SPEED_PRESETS.normal;
}

function applyForLoopSpeedUI() {
    Object.keys(FOR_LOOP_SPEED_PRESETS).forEach(mode => {
        const button = document.getElementById(`for-speed-${mode}`);
        if (!button) return;
        const isActive = currentForLoopSpeed === mode;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
}

function setForLoopSpeed(mode) {
    if (!FOR_LOOP_SPEED_PRESETS[mode]) return;
    currentForLoopSpeed = mode;
    applyForLoopSpeedUI();
    try {
        localStorage.setItem(FOR_LOOP_SPEED_STORAGE_KEY, mode);
    } catch (_) {
        // Ignore storage failures
    }
}

function restoreForLoopSpeed() {
    try {
        const saved = localStorage.getItem(FOR_LOOP_SPEED_STORAGE_KEY);
        if (saved && FOR_LOOP_SPEED_PRESETS[saved]) {
            currentForLoopSpeed = saved;
        }
    } catch (_) {
        // Ignore storage failures
    }
    applyForLoopSpeedUI();
}

function setForLoopSpeedControlsDisabled(disabled) {
    document.querySelectorAll('#for-speed-controls .for-speed-btn').forEach(button => {
        button.disabled = disabled;
        button.classList.toggle('is-disabled', disabled);
    });
}

function setupTabKeyboardNavigation() {
    const navButtons = Array.from(document.querySelectorAll('nav button[id^="tab-"]'));
    if (!navButtons.length) return;

    navButtons.forEach((button, index) => {
        button.setAttribute('aria-pressed', button.classList.contains('active-tab') ? 'true' : 'false');
        button.addEventListener('keydown', (event) => {
            let nextIndex = index;
            if (event.key === 'ArrowRight') nextIndex = (index + 1) % navButtons.length;
            if (event.key === 'ArrowLeft') nextIndex = (index - 1 + navButtons.length) % navButtons.length;
            if (event.key === 'Home') nextIndex = 0;
            if (event.key === 'End') nextIndex = navButtons.length - 1;

            if (nextIndex !== index) {
                event.preventDefault();
                navButtons[nextIndex].focus();
                return;
            }

            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                button.click();
            }
        });
    });
}

function showSection(sectionId, options = {}) {
    const { skipPersist = false } = options;
    const targetSectionId = SECTION_MAP[sectionId];
    const targetSection = targetSectionId ? document.getElementById(targetSectionId) : null;
    if (!targetSection) return;

    document.querySelectorAll('.concept-section').forEach(s => s.classList.add('hidden'));
    targetSection.classList.remove('hidden');
    targetSection.classList.remove('section-enter');
    void targetSection.offsetWidth;
    targetSection.classList.add('section-enter');
    setTimeout(() => targetSection.classList.remove('section-enter'), SECTION_ANIMATION_MS);

    document.querySelectorAll('nav button').forEach(b => {
        b.classList.remove('active-tab');
        b.classList.add('text-slate-500');
        b.setAttribute('aria-pressed', 'false');
    });
    const activeBtn = document.getElementById('tab-' + sectionId);
    if (activeBtn) {
        activeBtn.classList.add('active-tab');
        activeBtn.classList.remove('text-slate-500');
        activeBtn.setAttribute('aria-pressed', 'true');
    }

    if (!skipPersist) persistActiveSection(sectionId);
    refreshIcons();
    if (sectionId === 'fullstack') setTimeout(syncPaths, 100);
}

// --- FOR LOOP SIMULATION LOGIC ---
let isForRunning = false;
async function simulateForLoop() {
    if (isForRunning) return;
    isForRunning = true;

    const btn = document.getElementById('btn-run-for');
    const countDisplay = document.getElementById('for-visual-count');
    const progBar = document.getElementById('for-progress-bar');
    const progPercent = document.getElementById('for-progress-percent');
    const statusMsg = document.getElementById('for-status-msg');
    const tooltip = document.getElementById('for-tooltip');
    const worker = document.getElementById('for-worker');
    const hammer = document.getElementById('for-hammer');
    const smoke = document.getElementById('factory-smoke');
    const conveyor = document.getElementById('conveyor-belt');
    const conveyorTrack = document.getElementById('for-conveyor-track');
    const sparksContainer = document.getElementById('for-sparks-container');
    const forCodeBlock = document.getElementById('for-loop-code-block');
    const visualContainer = document.getElementById('for-visual-container');

    const partInit = document.getElementById('for-part-init');
    const partCond = document.getElementById('for-part-cond');
    const partInc = document.getElementById('for-part-inc');
    const lineBody = document.getElementById('for-line-body');
    const totalCars = 10;

    if (!btn || !countDisplay || !progBar || !progPercent || !statusMsg || !tooltip || !worker || !hammer || !smoke || !conveyor || !conveyorTrack || !sparksContainer || !forCodeBlock || !partInit || !partCond || !partInc || !lineBody) {
        isForRunning = false;
        return;
    }

    const speedProfile = getForLoopSpeedProfile();
    const pace = speedProfile.multiplier;
    const speedLabel = speedProfile.label;
    const t = (ms) => Math.max(120, Math.round(ms * pace));

    const timing = {
        init: t(850),
        condition: t(600),
        assembly: t(720),
        increment: t(420),
        finish: t(700)
    };
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const clearCodeHighlight = () => {
        forCodeBlock.querySelectorAll('span, div').forEach(e => e.classList.remove('bg-indigo-500/30', 'font-black', 'text-white'));
    };
    const animateProgressTo = (targetPercent, duration = t(520)) => new Promise(resolve => {
        const startPercent = Number.parseFloat(progBar.style.width) || 0;
        const startAt = performance.now();
        const step = (now) => {
            const raw = Math.min((now - startAt) / duration, 1);
            const eased = 1 - Math.pow(1 - raw, 3);
            const current = startPercent + (targetPercent - startPercent) * eased;
            const rounded = Math.round(current);
            progBar.style.width = `${current}%`;
            progPercent.innerText = `${rounded}%`;
            if (raw < 1) {
                window.requestAnimationFrame(step);
                return;
            }
            progBar.style.width = `${targetPercent}%`;
            progPercent.innerText = `${Math.round(targetPercent)}%`;
            resolve();
        };
        window.requestAnimationFrame(step);
    });

    btn.disabled = true;
    btn.classList.add('opacity-50');
    setForLoopSpeedControlsDisabled(true);

    // Reset
    countDisplay.innerText = "0";
    progBar.style.width = "0%";
    progPercent.innerText = "0%";
    conveyor.innerHTML = '';
    statusMsg.innerText = `🏭 工廠生產線啟動中...（${speedLabel}）`;
    smoke.classList.remove('opacity-0');
    worker.classList.add('factory-worker-busy');
    conveyorTrack.classList.add('conveyor-running');
    visualContainer?.classList.add('for-visual-active');

    const highlight = (el, tip, colorClass) => {
        clearCodeHighlight();
        el.classList.add('bg-indigo-500/30', 'font-black', 'text-white');
        tooltip.innerText = tip;
        tooltip.style.opacity = '1';
        tooltip.className = `absolute top-2 right-4 text-white text-[10px] px-3 py-1 rounded-full font-bold transition-all ${colorClass}`;
    };

    // Step 1: Initialization
    highlight(partInit, "1. 初始化: i = 1", "bg-sky-600");
    await sleep(timing.init);

    for (let i = 1; i <= totalCars; i++) {
        // Step 2: Condition
        highlight(partCond, `2. 判斷: ${i} <= ${totalCars} ? (YES)`, "bg-emerald-600");
        await sleep(timing.condition);

        // Step 3: Body (The Action)
        highlight(lineBody, `3. 執行: 生產第 ${i} 輛汽車`, "bg-indigo-600");
        statusMsg.innerText = `正在組裝第 ${i} 輛汽車...`;

        // Hammer & Spark Animation
        hammer.classList.remove('opacity-0');
        hammer.classList.add('hammer-animate');

        for (let s = 0; s < 6; s++) {
            const spark = document.createElement('div');
            spark.className = "absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping";
            spark.style.left = `calc(50% + ${(Math.random() - 0.5) * 120}px)`;
            spark.style.top = `calc(50% + ${(Math.random() - 0.5) * 120}px)`;
            sparksContainer.appendChild(spark);
            setTimeout(() => spark.remove(), 400);
        }

        // Create Car on Conveyor (Smaller icons to fit 10)
        const car = document.createElement('div');
        car.className = "flex flex-col items-center transition-all duration-500 transform translate-y-4 scale-95 opacity-0";
        car.style.minWidth = "40px";
        car.innerHTML = `
            <i data-lucide="car" class="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" size="24"></i>
            <span class="text-[7px] font-black text-indigo-300 mt-0.5">#${i}</span>
        `;
        conveyor.appendChild(car);
        refreshIcons();
        requestAnimationFrame(() => {
            car.classList.remove('translate-y-4', 'scale-95', 'opacity-0');
            car.classList.add('translate-y-0', 'scale-100', 'opacity-100');
        });

        countDisplay.innerText = String(i);
        const targetPercent = (i / totalCars) * 100;
        statusMsg.innerText = `正在組裝第 ${i} 輛汽車... (${Math.round(targetPercent)}%)`;
        await Promise.all([
            animateProgressTo(targetPercent),
            sleep(timing.assembly)
        ]);

        hammer.classList.remove('hammer-animate');
        hammer.classList.add('opacity-0');

        // Step 4: Increment
        highlight(partInc, `4. 執行次數: i 變 ${i + 1}`, "bg-amber-600");
        await sleep(timing.increment);
    }

    // End
    highlight(partCond, `結束: ${totalCars + 1} <= ${totalCars} ? (NO)`, "bg-rose-600");
    statusMsg.innerText = "✅ 訂單達成！10 輛汽車已完成交付。";
    tooltip.innerText = "迴圈結束";
    smoke.classList.add('opacity-0');
    worker.classList.remove('factory-worker-busy');
    conveyorTrack.classList.remove('conveyor-running');
    visualContainer?.classList.remove('for-visual-active');

    await sleep(timing.finish);
    tooltip.style.opacity = '0';
    clearCodeHighlight();

    btn.disabled = false;
    btn.classList.remove('opacity-50');
    setForLoopSpeedControlsDisabled(false);
    isForRunning = false;
}

// --- IF-ELSE SIMULATION LOGIC ---
function simulateIfElse(age) {
    const valAge = document.getElementById('ie-val-age');
    const p1 = document.getElementById('ie-path-1');
    const p1b = document.getElementById('ie-path-1-body');
    const p2 = document.getElementById('ie-path-2');
    const p2b = document.getElementById('ie-path-2-body');
    const p3 = document.getElementById('ie-path-3');
    const p3b = document.getElementById('ie-path-3-body');

    const vGate = document.getElementById('ie-visual-gate');
    const vTitle = document.getElementById('ie-visual-title');
    const vDesc = document.getElementById('ie-visual-desc');
    const vBadge = document.getElementById('ie-result-badge');

    // Reset Styles
    [p1, p1b, p2, p2b, p3, p3b].forEach(el => {
        el.classList.remove('text-indigo-400', 'font-black', 'bg-indigo-500/20', 'rounded-lg', 'scale-105');
        if (el.id.includes('body')) {
            el.classList.add('text-slate-500');
            el.classList.remove('text-emerald-400');
        } else {
            el.classList.add('text-slate-400');
        }
    });

    valAge.innerText = age;

    let result = "";
    let color = "";
    let icon = "";

    if (age >= 18) {
        p1.classList.add('text-indigo-400', 'font-black', 'bg-indigo-500/20', 'rounded-lg', 'scale-105');
        p1b.classList.remove('text-slate-500');
        p1b.classList.add('text-emerald-400', 'font-black');
        result = "限制級 (R)";
        color = "bg-rose-600";
        icon = "shield-alert";
    } else if (age >= 12) {
        p2.classList.add('text-indigo-400', 'font-black', 'bg-indigo-500/20', 'rounded-lg', 'scale-105');
        p2b.classList.remove('text-slate-500');
        p2b.classList.add('text-emerald-400', 'font-black');
        result = "輔導級 (PG-13)";
        color = "bg-amber-500";
        icon = "info";
    } else {
        p3.classList.add('text-indigo-400', 'font-black', 'bg-indigo-500/20', 'rounded-lg', 'scale-105');
        p3b.classList.remove('text-slate-500');
        p3b.classList.add('text-emerald-400', 'font-black');
        result = "普遍級 (G)";
        color = "bg-emerald-500";
        icon = "check-circle";
    }

    // Visual Update
    vGate.className = `w-24 h-24 ${color} rounded-full flex items-center justify-center mb-6 transition-all duration-500 shadow-lg transform scale-110`;
    vGate.innerHTML = `<i data-lucide="${icon}" size="48" class="text-white"></i>`;
    vTitle.innerText = `判定結果：${result}`;
    vDesc.innerText = `年齡 ${age} 歲符合條件，程式進入了對應的代碼區塊並執行。`;
    vBadge.innerText = result;
    vBadge.className = `mt-8 px-8 py-4 rounded-2xl ${color} text-white font-black text-xl shadow-xl animate-bounce`;
    vBadge.classList.remove('hidden');

    refreshIcons();
}

// --- WEB QUARTET LAB LOGIC ---
let currentLabColor = '#4f46e5';
let currentLabRadius = 12;

function updateLabPreview() {
    const input = document.getElementById('lab-html-input');
    const display = document.getElementById('lab-text');
    const htmlCode = document.getElementById('lab-html-code');
    const text = input.value || " ";
    display.innerText = text;
    htmlCode.innerText = `<h1 id="text">${text}</h1>`;
}

function setLabCss(bgClass, hex) {
    const el = document.getElementById('lab-element');
    const cssCode = document.getElementById('lab-css-code');
    // Remove existing bg classes
    el.classList.remove('bg-indigo-600', 'bg-emerald-600', 'bg-rose-600', 'bg-amber-600');
    el.classList.add(bgClass);
    currentLabColor = hex;
    updateLabCssCode();
}

function setLabRadius(val) {
    const el = document.getElementById('lab-element');
    el.style.borderRadius = val + 'px';
    currentLabRadius = val;
    updateLabCssCode();
}

function updateLabCssCode() {
    const cssCode = document.getElementById('lab-css-code');
    cssCode.innerHTML = `#text {<br>&nbsp;&nbsp;background-color: ${currentLabColor};<br>&nbsp;&nbsp;border-radius: ${currentLabRadius}px;<br>}`;
}

async function runLabJsAction() {
    const el = document.getElementById('lab-element');
    const status = document.getElementById('lab-js-status');
    const codeSnippet = document.getElementById('js-code-snippet');

    if (!el || !status) return;

    codeSnippet.innerText = "for(let i=0; i<10; i++) {\n  el.style.transform = `translateX(${i%2?15:-15}px)`;\n}";
    status.innerText = "原生 JavaScript 震動中...";
    status.classList.add('text-yellow-400', 'font-bold');

    const originalTransition = el.style.transition;
    el.style.transition = 'none';

    for (let i = 0; i < 12; i++) {
        const offset = (i % 2 === 0) ? '15px' : '-15px';
        el.style.transform = `translateX(${offset})`;
        await new Promise(r => setTimeout(r, 40));
    }
    el.style.transform = `translateX(0)`;
    el.style.transition = originalTransition;

    status.innerText = "原生 JavaScript 執行完成";
    status.classList.replace('text-yellow-400', 'text-emerald-400');

    setTimeout(() => {
        status.innerText = "等待互動中...";
        status.classList.remove('text-emerald-400', 'font-bold');
    }, 2000);
}

function runLabJQueryAction() {
    const $el = $('#lab-element');
    const $status = $('#lab-js-status');
    const $codeSnippet = $('#js-code-snippet');

    $codeSnippet.text("$('#el').css('transform', 'translateX(15px)')...");
    $status.text("jQuery 極速震動中 (50Hz)...").addClass('text-indigo-400 font-bold');

    const originalTransition = $el.css('transition');
    $el.css('transition', 'none'); // 關鍵：關閉所有過渡效果

    let count = 0;
    const interval = setInterval(() => {
        const offset = count % 2 === 0 ? '15px' : '-15px';
        $el.css('transform', `translateX(${offset})`);
        count++;

        if (count > 25) { // 震動 25 次
            clearInterval(interval);
            $el.css('transform', 'translateX(0)');
            $el.css('transition', originalTransition);
            $status.text("jQuery 執行完成").replaceClass('text-indigo-400', 'text-emerald-400');
            setTimeout(() => {
                $status.text("等待互動中...").removeClass('text-emerald-400 font-bold');
            }, 2000);
        }
    }, 20); // 20毫秒一次 = 50Hz 極速
}

// Helper for class replacement
$.fn.replaceClass = function (oldClass, newClass) {
    return this.removeClass(oldClass).addClass(newClass);
};

// --- SQL SIMULATION LOGIC ---
let dbData = [
    { id: 1, name: 'Edward', email: 'ed@example.com', status: 'Active' },
    { id: 2, name: 'Alice', email: 'alice@web.com', status: 'Pending' }
];
let nextId = 3;
let selectToggle = 0; // 0: Select All, 1: Select Active

function renderSqlTable(highlightIds = [], isSelection = false) {
    const tbody = document.getElementById('sql-table-body');
    const emptyMsg = document.getElementById('table-empty-msg');
    tbody.innerHTML = '';

    // Ensure highlightIds is always an array
    const targets = Array.isArray(highlightIds) ? highlightIds : (highlightIds ? [highlightIds] : []);

    if (dbData.length === 0) {
        emptyMsg.classList.remove('hidden');
    } else {
        emptyMsg.classList.add('hidden');
        dbData.forEach(row => {
            const isTarget = targets.includes(row.id);
            const tr = document.createElement('tr');

            let highlightClass = '';
            if (isTarget) {
                highlightClass = isSelection ? 'bg-sky-100 border-sky-200' : 'bg-emerald-50';
            } else if (isSelection) {
                highlightClass = 'opacity-30 grayscale-[0.5]';
            }

            tr.className = `border-b border-slate-50 transition-all duration-700 ${highlightClass}`;
            tr.innerHTML = `
                <td class="p-4 font-mono text-slate-400">#${row.id}</td>
                <td class="p-4 font-bold text-slate-700">${row.name}</td>
                <td class="p-4 text-slate-500">${row.email}</td>
                <td class="p-4">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}">
                        ${row.status}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

async function simulateSql(action) {
    const displayCode = document.getElementById('sql-display-code');
    const statusText = document.getElementById('db-action-status');
    let syntax = '';
    let highlightIds = [];
    let isSelection = false;

    switch (action) {
        case 'INSERT':
            const newName = ['Bob', 'Charlie', 'Diana', 'Eve'][Math.floor(Math.random() * 4)];
            const newRow = { id: nextId++, name: newName, email: `${newName.toLowerCase()}@db.com`, status: 'Active' };
            dbData.push(newRow);
            syntax = `INSERT INTO users (name, email, status) \nVALUES ('${newRow.name}', '${newRow.email}', 'Active');`;
            highlightIds = [newRow.id];
            statusText.innerText = `Query OK, 1 row affected (0.01 sec)`;
            break;
        case 'SELECT':
            if (selectToggle === 0) {
                syntax = `SELECT * FROM users;`;
                highlightIds = dbData.map(r => r.id);
                isSelection = true;
                statusText.innerText = `${dbData.length} rows in set (0.00 sec)`;
                selectToggle = 1; // Prepare for next click: Select Active
            } else {
                syntax = `SELECT * FROM users \nWHERE status = 'Active';`;
                const activeRows = dbData.filter(r => r.status === 'Active');
                highlightIds = activeRows.map(r => r.id);
                isSelection = true;
                statusText.innerText = `${activeRows.length} rows in set (0.00 sec)`;
                selectToggle = 0; // Prepare for next click: Select All
            }
            break;
        case 'UPDATE':
            if (dbData.length > 0) {
                const targetIdx = Math.floor(Math.random() * dbData.length);
                dbData[targetIdx].status = dbData[targetIdx].status === 'Active' ? 'Pending' : 'Active';
                syntax = `UPDATE users SET status = '${dbData[targetIdx].status}' \nWHERE id = ${dbData[targetIdx].id};`;
                highlightIds = [dbData[targetIdx].id];
                statusText.innerText = `Rows matched: 1  Changed: 1  Warnings: 0`;
            } else {
                syntax = `-- No data to update!`;
            }
            break;
        case 'DELETE':
            if (dbData.length > 0) {
                const deleted = dbData.pop();
                syntax = `DELETE FROM users \nWHERE id = ${deleted.id};`;
                statusText.innerText = `Query OK, 1 row affected (0.02 sec)`;
            } else {
                syntax = `-- Table is already empty!`;
            }
            break;
    }

    displayCode.innerText = syntax;
    renderSqlTable(highlightIds, isSelection);

    // Animation for syntax box
    const box = document.getElementById('sql-syntax-box');
    box.classList.add('border-emerald-500/50', 'bg-emerald-950/20');
    setTimeout(() => {
        box.classList.remove('border-emerald-500/50', 'bg-emerald-950/20');
    }, 500);
}

// --- AI MAGIC SIMULATION ---
let currentAiEx = 1;

function switchAiExample(exNum) {
    currentAiEx = exNum;
    const btn1 = document.getElementById('btn-ex-1');
    const btn2 = document.getElementById('btn-ex-2');
    const btn3 = document.getElementById('btn-ex-3');

    // Reset all to inactive style
    [btn1, btn2, btn3].forEach(btn => {
        if (btn) btn.className = "px-8 py-3 rounded-full font-black text-sm transition-all shadow-md bg-white text-slate-500 border border-slate-200 hover:bg-slate-50";
    });

    // Set active style
    const activeBtn = document.getElementById('btn-ex-' + exNum);
    if (activeBtn) activeBtn.className = "px-8 py-3 rounded-full font-black text-sm transition-all shadow-md bg-indigo-600 text-white transform scale-105";

    resetAiSimulation();
}

function resetAiSimulation() {
    const typingArea = document.getElementById('prompt-typing-area');
    const responseArea = document.getElementById('ai-response-area');
    const codeBox = document.getElementById('ai-generated-code-box');
    const editorDisplay = document.getElementById('editor-code-display');
    const outputArea = document.getElementById('magic-output-area');
    const outputStatus = document.getElementById('output-status');

    typingArea.innerText = '';
    responseArea.classList.add('hidden');
    codeBox.style.opacity = '0';
    outputStatus.innerText = 'Waiting...';
    outputStatus.className = 'px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full text-[10px] font-bold italic';
    outputArea.innerHTML = '點擊按鈕，見證 AI 與 Java 的協作魔法...';
    outputArea.className = 'code-font text-[11px] space-y-1 text-slate-400 italic text-center py-12';

    if (currentAiEx === 1) {
        editorDisplay.innerHTML = `
            <div class="text-slate-500">public class Main {</div>
            <div class="pl-4 text-slate-500">public static void main(String[] args) {</div>
            <div class="pl-8 text-indigo-300">for (int i = 1; i <= 10; i++) {</div>
            <div class="pl-12 text-indigo-300">System.out.println("第 " + i + " 次: 我以後會用 AI 寫程式 ");</div>
            <div class="pl-8 text-indigo-300">}</div>
            <div class="pl-4 text-slate-500">}</div>
            <div class="text-slate-500">}</div>`;
    } else if (currentAiEx === 2) {
        editorDisplay.innerHTML = `
            <div class="text-slate-500">public class Main {</div>
            <div class="pl-4 text-slate-500">public static void main(String[] args) {</div>
            <div class="pl-8 text-emerald-400">int[] scores = {85, 42, 93, 60, 77};</div>
            <div class="pl-8 text-indigo-300">for (int i = 0; i < scores.length; i++) {</div>
            <div class="pl-12 text-indigo-300">System.out.println("學生 " + (i+1) + " 分數: " + scores[i]);</div>
            <div class="pl-8 text-indigo-300">}</div>
            <div class="pl-4 text-slate-500">}</div>
            <div class="text-slate-500">}</div>`;
    } else {
        editorDisplay.innerHTML = `
            <div class="text-slate-600 italic">// 準備從零開始寫新程式...</div>
            <div class="text-slate-500">public class Main {</div>
            <div class="pl-4 text-slate-500">public static void main(String[] args) {</div>
            <div class="pl-8 text-slate-400">|</div>
            <div class="pl-4 text-slate-500">}</div>
            <div class="text-slate-500">}</div>`;
    }
}

async function runAiMagicSimulation() {
    const btn = document.getElementById('btn-start-magic');
    const typingArea = document.getElementById('prompt-typing-area');
    const responseArea = document.getElementById('ai-response-area');
    const codeBox = document.getElementById('ai-generated-code-box');
    const editorDisplay = document.getElementById('editor-code-display');
    const selectionMask = document.getElementById('editor-selection-mask');
    const outputArea = document.getElementById('magic-output-area');
    const outputStatus = document.getElementById('output-status');
    const aiCodeContent = document.getElementById('ai-code-content');

    btn.disabled = true;
    btn.classList.add('opacity-50');
    resetAiSimulation();

    // Define Content based on Example
    const prompts = [
        "(Role) 你是一位幽默的 Java 教練。\n(Context) 我是剛學會 for 迴圈的初學者。\n(Task) 幫我修改這段程式碼，讓它每次印出的句子後面都隨機加上 Emoji！",
        "(Role) 你是一位嚴謹但溫暖的資深軟體架構師。\n(Context) 我剛學會用 int[] 陣列存放 5 位學生的分數並用迴圈印出。\n(Task) 請進化這段代碼：1. 判斷及格(60分)並印出 🎓 或 ❌。 2. 計算平均分數。",
        "(Role) 資深遊戲工程師。\n(Context) 我正在開發樂透遊戲。\n(Task) 從頭幫我寫一個 Java 程式，自動生成 6 個 1~49 之間不重複的樂透號碼，排序後印出結果。"
    ];

    const aiResponses = [
        `<div class="text-emerald-400">import java.util.Random;</div>
        <div class="text-slate-300">public class Main {</div>
        <div class="pl-4 text-slate-300">public static void main(String[] args) {</div>
        <div class="pl-8 text-emerald-400">String[] emojis = {"(^_^)", "(T_T)", "(>_<)", "(O_O)"};</div>
        <div class="pl-8 text-emerald-400">Random rand = new Random();</div>
        <div class="pl-8 text-slate-300">for (int i = 1; i <= 10; i++) {</div>
        <div class="pl-12 text-indigo-200 italic">System.out.println("第 " + i + " 次: 會用 AI 寫程式 " + emojis[rand.nextInt(4)]);</div>
        <div class="pl-8 text-slate-300">}</div>
        <div class="pl-4 text-slate-300">}</div>
        <div class="text-slate-300">}</div>`,
        `<div class="text-slate-300">public class Main {</div>
        <div class="pl-4 text-slate-300">public static void main(String[] args) {</div>
        <div class="pl-8 text-emerald-400">int[] scores = {85, 42, 93, 60, 77};</div>
        <div class="pl-8 text-emerald-400">double sum = 0;</div>
        <div class="pl-8 text-slate-300">for (int i = 0; i < scores.length; i++) {</div>
        <div class="pl-12 text-emerald-400">String res = (scores[i]>=60) ? "及格 🎓" : "不及格 ❌";</div>
        <div class="pl-12 text-indigo-200">System.out.println("學生 "+(i+1)+": "+scores[i]+" ["+res+"]");</div>
        <div class="pl-12 text-emerald-400">sum += scores[i];</div>
        <div class="pl-8 text-slate-300">}</div>
        <div class="pl-8 text-indigo-200">System.out.println("平均分數: " + (sum/5));</div>
        <div class="pl-4 text-slate-300">}</div>
        <div class="text-slate-300">}</div>`,
        `<div class="text-emerald-400">import java.util.*;</div>
        <div class="text-slate-300">public class Lottery {</div>
        <div class="pl-4 text-slate-300">public static void main(String[] args) {</div>
        <div class="pl-8 text-emerald-400">Set<Integer> nums = new TreeSet<>();</div>
        <div class="pl-8 text-emerald-400">Random rand = new Random();</div>
        <div class="pl-8 text-slate-300">while (nums.size() < 6) {</div>
        <div class="pl-12 text-slate-300">nums.add(rand.nextInt(49) + 1);</div>
        <div class="pl-8 text-slate-300">}</div>
        <div class="pl-8 text-indigo-200 font-bold">System.out.println("中獎號碼: " + nums);</div>
        <div class="pl-4 text-slate-300">}</div>
        <div class="text-slate-300">}</div>`
    ];
    // Step 1: Typing Prompt
    const promptText = prompts[currentAiEx - 1];
    for (let i = 0; i < promptText.length; i++) {
        typingArea.innerText += promptText[i];
        await new Promise(r => setTimeout(r, 15));
    }

    // Step 2 & 3: AI Response & Code
    await new Promise(r => setTimeout(r, 800));
    aiCodeContent.innerHTML = aiResponses[currentAiEx - 1];
    responseArea.classList.remove('hidden');
    refreshIcons();
    await new Promise(r => setTimeout(r, 600));
    codeBox.style.opacity = '1';

    // Step 4: Simulate Paste
    await new Promise(r => setTimeout(r, 1200));
    selectionMask.classList.remove('hidden');
    await new Promise(r => setTimeout(r, 400));
    editorDisplay.innerHTML = aiResponses[currentAiEx - 1];
    selectionMask.classList.add('hidden');

    // Step 5: Execute
    outputStatus.innerText = 'Running...';
    outputStatus.className = 'px-2 py-0.5 bg-yellow-100 text-yellow-600 rounded-full text-[10px] font-bold italic animate-pulse';

    if (currentAiEx === 3) {
        // Special Lottery Animation
        outputArea.innerHTML = '<div class="flex gap-2 justify-center py-4" id="rolling-balls"></div>';
        outputArea.className = 'code-font text-[11px] space-y-1 text-slate-600 text-center px-4';
        const ballsCont = document.getElementById('rolling-balls');
        for (let b = 0; b < 6; b++) {
            const bEl = document.createElement('div');
            bEl.className = "w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-400 animate-bounce";
            bEl.innerText = "?";
            ballsCont.appendChild(bEl);
            await new Promise(r => setTimeout(r, 300));
        }
        await new Promise(r => setTimeout(r, 1000));
        const lucky = [8, 12, 25, 33, 41, 49];
        ballsCont.innerHTML = '';
        for (let n of lucky) {
            const bEl = document.createElement('div');
            bEl.className = "w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg transform scale-110 transition-all duration-500";
            bEl.innerText = n;
            ballsCont.appendChild(bEl);
            await new Promise(r => setTimeout(r, 400));
        }
    } else {
        await new Promise(r => setTimeout(r, 1000));
        outputArea.innerHTML = '';
        outputArea.className = 'code-font text-[11px] space-y-1 text-slate-600 text-left px-4';
        if (currentAiEx === 1) {
            const ems = ["(^_^)", "(T_T)", "(>_<)", "(O_O)"];
            for (let i = 1; i <= 10; i++) {
                outputArea.innerHTML += `<div class="fade-in-up">第 ${i} 次: 我以後會用 AI 寫程式 ${ems[Math.floor(Math.random() * 4)]}</div>`;
                await new Promise(r => setTimeout(r, 100));
            }
        } else {
            const lines = ["學生 1: 85 [及格 🎓]", "學生 2: 42 [不及格 ❌]", "學生 3: 93 [及格 🎓]", "學生 4: 60 [及格 🎓]", "學生 5: 77 [及格 🎓]", "---", "平均分數: 71.4"];
            for (let line of lines) {
                outputArea.innerHTML += `<div>${line}</div>`;
                await new Promise(r => setTimeout(r, 200));
            }
        }
    }

    outputStatus.innerText = 'Execute Success';
    outputStatus.className = 'px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-bold italic';
    btn.disabled = false;
    btn.classList.remove('opacity-50');
}

// --- DETAILED FLOW LOGIC ---
let isFlowing = false;

async function startDetailedFlow(isSuccess) {
    if (isFlowing) return;
    isFlowing = true;

    const btnS = document.getElementById('btn-success-sim');
    const btnF = document.getElementById('btn-fail-sim');
    const packet = document.getElementById('login-packet');
    const addrBar = document.getElementById('addr-bar');
    const uiInitial = document.getElementById('ui-initial');
    const uiLogin = document.getElementById('ui-page-login');
    const uiSuccess = document.getElementById('ui-page-success');
    const uiFail = document.getElementById('ui-page-fail');
    const inputUser = document.getElementById('input-user');
    const inputPass = document.getElementById('input-pass');

    const sSSL = document.getElementById('s-step-ssl');
    const sStatic = document.getElementById('s-step-static');
    const sCompare = document.getElementById('s-step-compare');
    const sResp = document.getElementById('s-step-resp');

    const cardHttp = document.getElementById('card-http');
    const cardHttps = document.getElementById('card-https');

    btnS.disabled = btnF.disabled = true;
    btnS.classList.add('opacity-50'); btnF.classList.add('opacity-50');

    // Reset UI
    addrBar.innerText = '';
    addrBar.className = 'bg-white flex-1 rounded px-1 truncate text-red-500 font-bold';
    uiInitial.classList.remove('hidden');
    uiLogin.classList.add('hidden'); uiSuccess.classList.add('hidden'); uiFail.classList.add('hidden');
    inputUser.innerText = ''; inputPass.innerText = '';
    packet.classList.remove('encrypted');
    cardHttp.classList.remove('highlight-card');
    cardHttps.classList.remove('highlight-card');
    document.querySelectorAll('.step-item').forEach(s => s.classList.remove('step-highlight'));
    [sSSL, sStatic, sCompare, sResp].forEach(el => el.classList.remove('server-step-active'));

    const runStep = async (stepNum, node, path = null, callback = null, duration = 5000) => {
        document.querySelectorAll('.step-item').forEach(s => s.classList.remove('step-highlight'));
        const currentStep = document.getElementById(`step-${stepNum}`);
        if (currentStep) {
            currentStep.classList.add('step-highlight');
            currentStep.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        document.querySelectorAll('.web-node').forEach(n => n.classList.remove('active'));
        if (node) document.getElementById(node).classList.add('active');
        if (callback) await callback();
        if (path) {
            packet.style.display = 'block';
            await animatePacketAlongPath('login-packet', path, duration);
        } else {
            await new Promise(r => setTimeout(r, 6000));
        }
    };

    // 1. Enter URL
    await runStep(1, 'lnode-client', null, async () => {
        cardHttp.classList.add('highlight-card');
        const url = 'http://edward.com/login';
        for (let char of url) {
            addrBar.innerText += char;
            await new Promise(r => setTimeout(r, 80));
        }
    });

    // 2. DNS
    await runStep(2, 'lnode-dns', 'lpath-dns-in');
    await runStep(3, 'lnode-dns', 'lpath-dns-out', () => {
        addrBar.innerText = '104.26.10.22/login';
    });

    // 4. SSL Handshake
    await runStep(4, 'lnode-client', 'lpath-req');
    await runStep(5, 'lnode-server', 'lpath-res', () => {
        sSSL.classList.add('server-step-active');
    });

    // 6. HTTPS Transition
    await runStep(6, 'lnode-client', null, () => {
        sSSL.classList.remove('server-step-active');
        cardHttp.classList.remove('highlight-card');
        cardHttps.classList.add('highlight-card');
        addrBar.innerHTML = '<span class="text-emerald-600">🔒 https://edward.com/login</span>';
        addrBar.className = 'bg-white flex-1 rounded px-1 truncate text-emerald-600 font-bold';
        packet.classList.add('encrypted');
    });

    // 7. Request Static
    await runStep(7, 'lnode-client', 'lpath-req');
    await runStep(8, 'lnode-server', 'lpath-res', () => {
        sStatic.classList.add('server-step-active');
    });

    // 9. Interaction
    await runStep(9, 'lnode-client', null, () => {
        sStatic.classList.remove('server-step-active');
        uiInitial.classList.add('hidden'); uiLogin.classList.remove('hidden');
    });

    // 10. Typing
    await runStep(10, 'lnode-client', null, async () => {
        const user = "Edward";
        for (let char of user) { inputUser.innerHTML += char; await new Promise(r => setTimeout(r, 250)); }
        await new Promise(r => setTimeout(r, 800));
        const pass = isSuccess ? "1234" : "wrong";
        for (let char of pass) { inputPass.innerHTML += char; await new Promise(r => setTimeout(r, 250)); }
        document.getElementById('fake-login-btn').classList.remove('opacity-50');
    });

    // 11. Submit
    await runStep(11, 'lnode-client', 'lpath-req');

    // 12. Java Logic Start
    await runStep(12, 'lnode-server', 'lpath-db-in', () => {
        sCompare.classList.add('server-step-active');
    });
    await runStep(13, 'lnode-db', 'lpath-db-out');

    // 14. Branching & Packaging
    await runStep(14, 'lnode-server', 'lpath-res', () => {
        sCompare.classList.remove('server-step-active');
        sResp.classList.add('server-step-active');
    });

    // 15. Final Render
    await runStep(15, 'lnode-client', null, () => {
        sResp.classList.remove('server-step-active');
        uiLogin.classList.add('hidden');
        if (isSuccess) uiSuccess.classList.remove('hidden'); else uiFail.classList.remove('hidden');
        refreshIcons();
    });

    packet.style.display = 'none';
    btnS.disabled = btnF.disabled = false;
    btnS.classList.remove('opacity-50'); btnF.classList.remove('opacity-50');
    isFlowing = false;
}

function animatePacketAlongPath(packetId, pathId, duration = 4500) {
    syncPaths(); // Ensure paths are correctly positioned before animation
    return new Promise(resolve => {
        const path = document.getElementById(pathId);
        const p = document.getElementById(packetId);
        const len = path.getTotalLength();
        let start = null;
        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const r = Math.min(progress / duration, 1);
            const pt = path.getPointAtLength(r * len);
            p.setAttribute('cx', pt.x); p.setAttribute('cy', pt.y);
            if (r < 1) window.requestAnimationFrame(step); else resolve();
        }
        window.requestAnimationFrame(step);
    });
}

function syncPaths() {
    const svg = document.getElementById('login-svg');
    if (!svg) return;

    const dnsIn = document.getElementById('lpath-dns-in');
    const dnsOut = document.getElementById('lpath-dns-out');
    const reqPath = document.getElementById('lpath-req');
    const resPath = document.getElementById('lpath-res');
    const dbIn = document.getElementById('lpath-db-in');
    const dbOut = document.getElementById('lpath-db-out');
    if (!dnsIn || !dnsOut || !reqPath || !resPath || !dbIn || !dbOut) return;

    const rect = svg.getBoundingClientRect();

    const getCenter = (id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
            x: r.left - rect.left + r.width / 2,
            y: r.top - rect.top + r.height / 2
        };
    };

    const c = getCenter('lnode-client');
    const d = getCenter('lnode-dns');
    const s = getCenter('lnode-server');
    const db = getCenter('lnode-db');
    if (!c || !d || !s || !db) return;

    // DNS Paths (Curved)
    dnsIn.setAttribute('d', `M${c.x},${c.y} Q${(c.x + d.x) / 2},${Math.min(c.y, d.y) - 80} ${d.x},${d.y}`);
    dnsOut.setAttribute('d', `M${d.x},${d.y} Q${(c.x + d.x) / 2},${Math.min(c.y, d.y) - 50} ${c.x},${c.y}`);

    // Req/Res Paths (Curved)
    reqPath.setAttribute('d', `M${c.x},${c.y} Q${(c.x + s.x) / 2},${Math.min(c.y, s.y) - 100} ${s.x},${s.y}`);
    resPath.setAttribute('d', `M${s.x},${s.y} Q${(c.x + s.x) / 2},${Math.max(c.y, s.y) + 100} ${c.x},${c.y}`);

    // DB Paths (Straight/L-shape)
    dbIn.setAttribute('d', `M${s.x - 10},${s.y} L${db.x - 10},${db.y}`);
    dbOut.setAttribute('d', `M${db.x + 10},${db.y} L${s.x + 10},${s.y}`);
}

window.addEventListener('resize', debounce(syncPaths, 120));
window.addEventListener('DOMContentLoaded', () => {
    renderSqlTable();
    setupTabKeyboardNavigation();
    restoreActiveSection();
    restoreForLoopSpeed();
    updateLabPreview();
    refreshIcons();
    setTimeout(syncPaths, 100);
});

// --- SECTION 3: FACTORY & VARIABLE LOGIC ---
let carCounterGlobal = 0;
function resetFactory() {
    carCounterGlobal = 0;
    document.getElementById('factory-floor').innerHTML = '<div class="text-center text-slate-400 text-[11px] mt-12 italic">物件將在此處生成...</div>';
    document.getElementById('dynamic-declaration').innerHTML = '// 點擊按鈕執行 new Car()';
    refreshIcons();
}
function handleInstantiation(color, type) {
    carCounterGlobal++;
    const varName = 'c' + carCounterGlobal;

    // Set attributes based on type
    const name = type === 'Sport' ? '紅跑車' : '藍貨車';
    const maxSpeed = type === 'Sport' ? 300 : 90;
    const maxLoad = type === 'Sport' ? 50 : 200;

    // Generate Code
    const decLine = `
        <div class="mb-1"><span class="text-green-300 font-bold">Car</span> <span class="text-white underline">${varName}</span> = <span class="text-yellow-400 font-bold">new</span> Car();</div>
        <div class="mb-1 text-slate-400 text-[9px]">${varName}.name = "${name}"; ${varName}.color = "${color}";</div>
        <div class="mb-1 text-slate-400 text-[9px]">${varName}.maxSpeed = ${maxSpeed}; ${varName}.maxLoad = ${maxLoad};</div>
        <div class="mb-2"><span class="text-sky-300 font-bold">${varName}.accelerate();</span> <span class="text-sky-300 font-bold">${varName}.loadCargo();</span></div>
    `;

    const dynamicArea = document.getElementById('dynamic-declaration');
    if (carCounterGlobal === 1) dynamicArea.innerHTML = '';
    dynamicArea.innerHTML += decLine;

    const floor = document.getElementById('factory-floor');
    if (floor.innerText.includes('物件將在此處生成')) floor.innerHTML = '';

    const addr = '0x' + Math.random().toString(16).slice(2, 6).toUpperCase();
    const colorClass = color === 'red' ? 'text-red-500' : 'text-blue-500';
    const icon = type === 'Sport' ? 'zap' : 'truck';

    const card = document.createElement('div');
    card.id = `obj-${varName}`;
    card.className = 'car-instance bg-white p-4 rounded-2xl shadow-md border-l-4 border-indigo-500 flex flex-col gap-3 transition-all hover:scale-[1.02]';
    card.innerHTML = `
        <div class="flex items-center justify-between border-b pb-2">
            <span class="text-[9px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-md">變數: ${varName}</span>
            <span class="text-[8px] font-mono text-slate-400">位址: ${addr}</span>
        </div>
        <div class="flex items-center gap-4">
            <div id="icon-${varName}" class="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center ${colorClass} shadow-inner transition-all">
                <i data-lucide="${icon}" size="24"></i>
            </div>
            <div class="flex-1">
                <div class="font-bold text-slate-800 text-xs">${name} Object</div>
                <div class="grid grid-cols-2 gap-x-2 mt-1">
                    <div class="text-[9px] text-slate-500">Speed: <span class="font-bold">${maxSpeed}</span></div>
                    <div class="text-[9px] text-slate-500">Load: <span class="font-bold">${maxLoad}</span></div>
                </div>
            </div>
        </div>
        <!-- Dual Action Buttons -->
        <div class="grid grid-cols-2 gap-2 mt-1">
            <button onclick="triggerObjectAction('${varName}', 'accelerate', ${maxSpeed}, ${maxLoad})" 
                class="py-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg text-[9px] font-black border border-slate-200 transition-all flex items-center justify-center gap-1">
                <i data-lucide="zap" size="10"></i> 加速
            </button>
            <button onclick="triggerObjectAction('${varName}', 'loadCargo', ${maxSpeed}, ${maxLoad})" 
                class="py-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg text-[9px] font-black border border-slate-200 transition-all flex items-center justify-center gap-1">
                <i data-lucide="package" size="10"></i> 載重
            </button>
        </div>
        <div id="msg-${varName}" class="text-[9px] text-center font-black h-3 transition-all opacity-0"></div>
    `;
    floor.prepend(card);
    refreshIcons();

    const codeBox = document.getElementById('main-code-display');
    codeBox.scrollTop = codeBox.scrollHeight;
}

async function triggerObjectAction(varName, actionType, speed, load) {
    const iconWrap = document.getElementById(`icon-${varName}`);
    const msg = document.getElementById(`msg-${varName}`);

    let actionText = "";
    let textColor = "";

    if (actionType === 'accelerate') {
        actionText = `🚀 加速！時速 ${speed} km/h`;
        textColor = "text-red-500";
        iconWrap.classList.add('animate-bounce');
    } else {
        actionText = `📦 載重！達成 ${load} kg`;
        textColor = "text-blue-500";
        iconWrap.style.transform = 'translateY(8px)';
    }

    // UI Update
    iconWrap.classList.add('scale-125', 'bg-slate-100');
    msg.innerText = actionText;
    msg.className = `text-[9px] text-center font-black h-3 transition-all opacity-100 ${textColor}`;

    await new Promise(r => setTimeout(r, 1200));

    iconWrap.classList.remove('scale-125', 'bg-slate-100', 'animate-bounce');
    iconWrap.style.transform = 'none';
    msg.classList.add('opacity-0');
    setTimeout(() => { msg.innerText = ''; }, 300);
}

// --- INTERACTIVE ANATOMY LOGIC ---
function copyMainCode(btn) {
    const code = `public class Main {
    public static void main(String[] args) throws Exception {
System.out.println("Hello World");
printIdentity();
    }

    public static void printIdentity() {
System.out.println("I am Edward.");
    }
}`;
    navigator.clipboard.writeText(code).then(() => {
        const span = btn.querySelector('span');
        const icon = btn.querySelector('i');
        const originalText = span.innerText;

        btn.classList.add('success');
        span.innerText = '已複製！';
        icon.setAttribute('data-lucide', 'check');
        refreshIcons();

        setTimeout(() => {
            btn.classList.remove('success');
            span.innerText = originalText;
            icon.setAttribute('data-lucide', 'copy');
            refreshIcons();
        }, 2000);
    });
}

function copyEditorCode(btn) {
    const editor = document.getElementById('editor-code-display');
    const lines = [];

    // Extract code lines and preserve indentation based on padding classes
    Array.from(editor.children).forEach(child => {
        if (child.tagName === 'DIV') {
            let text = child.innerText.trim();
            if (!text && child.children.length === 0) {
                lines.push("");
                return;
            }

            let indent = 0;
            child.classList.forEach(cls => {
                if (cls.startsWith('pl-')) {
                    const val = parseInt(cls.split('-')[1]);
                    indent = val;
                }
            });
            lines.push(' '.repeat(indent) + text);
        }
    });

    const code = (lines.length > 0) ? lines.join('\n') : editor.innerText.trim();

    navigator.clipboard.writeText(code).then(() => {
        const span = btn.querySelector('span');
        const icon = btn.querySelector('i');
        const originalText = span ? span.innerText : "";

        btn.classList.add('text-emerald-400');
        if (span) span.innerText = '已複製！';
        if (icon) {
            icon.setAttribute('data-lucide', 'check');
            refreshIcons();
        }

        setTimeout(() => {
            btn.classList.remove('text-emerald-400');
            if (span) span.innerText = originalText;
            if (icon) {
                icon.setAttribute('data-lucide', 'copy');
                refreshIcons();
            }
        }, 2000);
    });
}

function focusAnatomy(eventOrKey, fallbackKey) {
    const key = typeof eventOrKey === 'string' ? eventOrKey : fallbackKey;
    const sourceEvent = typeof eventOrKey === 'object' ? eventOrKey : window.event;
    if (!key) return;

    document.querySelectorAll('.clickable-word').forEach(el => el.classList.remove('word-highlight'));
    document.getElementById('word-body').classList.remove('word-highlight');
    document.getElementById('method-def-block').classList.remove('word-highlight');
    if (document.getElementById('word-class-braces-open')) document.getElementById('word-class-braces-open').classList.remove('word-highlight');
    if (document.getElementById('word-class-braces-close')) document.getElementById('word-class-braces-close').classList.remove('word-highlight');

    // New Method Braces Reset
    ['word-main-braces-open', 'word-main-braces-close', 'word-id-braces-open', 'word-id-braces-close'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('word-highlight');
    });

    const detailBox = document.getElementById('anatomy-detail');
    detailBox.classList.remove('hidden');
    const data = {
        'class': { title: 'Class (類別關鍵字)', body: '<code>class</code> 用於定義一個物件的「藍圖」。所有的程式碼都必須寫在類別裡面。', icon: 'file-code' },
        'main_class': { title: 'Class Name (類別名稱)', body: '如果類別宣告為 <code>public</code>，其名稱必須與檔案名稱完全一致。此檔案應命名為 <code>Main.java</code>。', icon: 'file-type' },
        'class-braces': { title: 'Class Scope (類別範圍)', body: '大括號定義了類別的起點與終點。所有的方法與變數都必須在這個範圍內。', icon: 'frame' },
        'method-braces': { title: 'Method Scope (方法範圍)', body: '大括號定義了方法的實作區塊。當方法被呼叫時，會執行這一對大括號內的程式碼。', icon: 'box' },
        'public': {
            title: 'Access Specifier (存取修飾字)',
            body: `定義成員的能見度。設為 <code>public</code> 代表 JVM 可以從類別外部自由進入。
                <table class="modifier-table"><thead><tr><th>修飾字</th><th>同類別 (Class)</th><th>同封包 (Package)</th><th>子類別 (Subclass)</th><th>世界 (World)</th></tr></thead><tbody>
                <tr class="current-row"><td>public</td><td>O</td><td>O</td><td>O</td><td>O</td></tr>
                <tr><td>protected</td><td>O</td><td>O</td><td>O</td><td>X</td></tr>
                <tr><td>(default)</td><td>O</td><td>O</td><td>X</td><td>X</td></tr>
                <tr><td>private</td><td>O</td><td>X</td><td>X</td><td>X</td></tr></tbody></table>`,
            icon: 'lock-open'
        },
        'static': { title: 'Keyword (關鍵字 - 靜態)', body: '<b>static</b> 讓這個方法屬於「類別」而非物件。JVM 不需要執行 <code>new Main()</code> 就能啟動。', icon: 'zap' },
        'void': { title: 'Return Type (回傳型別)', body: '<b>void</b> 代表「空」。方法執行完後不需要傳回任何數值給 JVM。', icon: 'arrow-down-to-dot' },
        'main': { title: 'Identifier (識別碼 - 方法名)', body: '<b>main</b> 是 JVM 唯一認可的入口名稱。', icon: 'door-open' },
        'args': { title: 'Parameter (參數列表)', body: '儲存啟動時輸入的參數容器。', icon: 'package' },
        'throws': { title: 'Throws (宣告例外拋出)', body: '告訴 JVM 如果發生錯誤我不處理，往上丟給上層。', icon: 'share-2' },
        'exception': { title: 'Exception (例外狀況)', body: '代表程式可能會遇到的突發錯誤處理。', icon: 'alert-triangle' },
        'hello-world': { title: 'Execution Code (執行語句)', body: '系統印出字串: "Hello World"', icon: 'terminal' },
        'call': { title: 'Method Call (方法呼叫)', body: '跳轉執行自定義動作。', icon: 'phone-forwarded' },
        'identity': { title: 'Identifier (識別碼 - 方法名)', body: 'printIdentity 為自定義的方法名稱', icon: 'git-branch' },
        'params-def': { title: 'Parameter (參數列表)', body: '未定義任何需帶入的參數', icon: 'package' },
        'body': { title: 'Execution Code (執行語句)', body: '系統印出字串: "I am Edward."', icon: 'terminal' }
    };
    const selected = data[key];
    if (!selected) return;

    document.getElementById('detail-title').innerText = selected.title;
    document.getElementById('detail-body').innerHTML = selected.body;
    document.getElementById('detail-icon').innerHTML = `<i data-lucide="${selected.icon}"></i>`;
    if (key === 'public') {
        document.getElementById('word-public-class').classList.add('word-highlight');
        document.getElementById('word-public-main').classList.add('word-highlight');
        document.getElementById('word-public-def').classList.add('word-highlight');
    } else if (key === 'static') {
        document.getElementById('word-static-main').classList.add('word-highlight');
        document.getElementById('word-static-def').classList.add('word-highlight');
    } else if (key === 'void') {
        document.getElementById('word-void-main').classList.add('word-highlight');
        document.getElementById('word-void-def').classList.add('word-highlight');
    } else if (key === 'body') {
        document.getElementById('word-body').classList.add('word-highlight');
    } else if (key === 'call') {
        document.getElementById('word-call').classList.add('word-highlight');
        document.getElementById('method-def-block').classList.add('word-highlight');
    } else if (key === 'class-braces') {
        document.getElementById('word-class-braces-open').classList.add('word-highlight');
        document.getElementById('word-class-braces-close').classList.add('word-highlight');
    } else if (key === 'method-braces') {
        // Find which pair was clicked
        const clickedId = sourceEvent?.target?.id || document.activeElement?.id || '';
        if (clickedId.includes('main')) {
            document.getElementById('word-main-braces-open').classList.add('word-highlight');
            document.getElementById('word-main-braces-close').classList.add('word-highlight');
        } else {
            document.getElementById('word-id-braces-open').classList.add('word-highlight');
            document.getElementById('word-id-braces-close').classList.add('word-highlight');
        }
    } else {
        document.getElementById(`word-${key}`).classList.add('word-highlight');
    }
    refreshIcons();
    if (window.innerWidth < 768) detailBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// --- MEMORY SIMULATIONS ---
const stack = document.getElementById('stack-v2');
const heap = document.getElementById('heap-v2');
const explanation = document.getElementById('explanation-text');
function getAddr() { return '0x' + Math.random().toString(16).slice(2, 6).toUpperCase(); }
function highlightLine(id) {
    document.querySelectorAll('.code-font div').forEach(d => d.classList.remove('line-active'));
    const target = document.getElementById('line-' + id);
    if (target) target.classList.add('line-active');
}
function clearAllMemory() {
    stack.innerHTML = `<div id="static-area" class="border-2 border-purple-400 bg-purple-50 p-2 rounded-lg mb-4 hidden"><div class="text-[8px] font-bold text-purple-600 uppercase mb-1">Method Area</div><div id="static-content"></div></div>`;
    heap.innerHTML = ''; explanation.innerHTML = '重置完成。';
    document.querySelectorAll('.code-font div').forEach(d => d.classList.remove('line-active'));
}
function simStatic() {
    highlightLine('static');
    const sArea = document.getElementById('static-area');
    const sContent = document.getElementById('static-content');
    sArea.classList.remove('hidden');
    sContent.innerHTML = `<div class="text-[10px] font-bold text-purple-800">count: <span class="bg-purple-200 px-2 rounded">0</span></div>`;
    explanation.innerHTML = `<b>🚗 比喻：公用腳踏車 (Static)</b><br>全場共用這一台設施。`;
}
function simChar() {
    highlightLine('char');
    const node = document.createElement('div');
    node.className = 'memory-node parking-spot bg-blue-100 border-2 border-blue-400 p-2 rounded-lg text-xs';
    node.innerHTML = `<div class="font-bold text-blue-800">key (char)</div><div class="flex justify-center py-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600"><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M12 18V9c0-1.7 1.3-3 3-3h3"/><path d="M16 18H8"/><path d="M10 11l.7 3.5"/><path d="M14 6l3.5 10"/></svg><span class="ml-1">'A'</span></div>`;
    stack.appendChild(node); explanation.innerHTML = `<b>🚗 比喻：機車 (char)</b><br>基本型別。直接停在室內小空間 (Stack)。`;
}
function simInt() {
    highlightLine('int');
    const node = document.createElement('div');
    node.className = 'memory-node parking-spot bg-blue-100 border-2 border-blue-400 p-2 rounded-lg text-xs';
    node.innerHTML = `<div class="font-bold text-blue-800">age (int)</div><div class="flex justify-center py-1"><i data-lucide="bike" size="14"></i><span class="ml-1">25</span></div>`;
    stack.appendChild(node); refreshIcons(); explanation.innerHTML = `<b>🚗 比喻：腳踏車 (int)</b><br>基本型別。數值直接寫在小空間內的車位上。`;
}
function simFloat() {
    highlightLine('float');
    const node = document.createElement('div');
    node.className = 'memory-node parking-spot bg-blue-100 border-2 border-blue-400 p-2 rounded-lg text-xs';
    node.innerHTML = `<div class="font-bold text-blue-800">pi (float)</div><div class="flex justify-center py-1"><i data-lucide="zap" size="14"></i><span class="ml-1">3.14</span></div>`;
    stack.appendChild(node); refreshIcons(); explanation.innerHTML = `<b>🚗 比喻：滑板車 (float)</b><br>基本型別。直接存放在室內小空間中。`;
}
function simString() {
    highlightLine('string'); const addr = getAddr();
    const sNode = document.createElement('div');
    sNode.className = 'memory-node parking-spot bg-green-100 border-2 border-green-500 p-2 rounded-lg text-xs';
    sNode.innerHTML = `<div class="font-bold text-green-800">s (String)</div><div class="text-center font-mono">${addr}</div>`;
    stack.appendChild(sNode);
    const hNode = document.createElement('div');
    hNode.className = 'memory-node bg-white border-2 border-green-400 p-2 rounded-lg text-xs shadow-sm';
    hNode.innerHTML = `<div class="text-[8px] opacity-40">位址: ${addr}</div><div class="font-bold">"Hi"</div>`;
    heap.appendChild(hNode);
    explanation.innerHTML = `<b>🚗 比喻：個人單據管理 (String)</b><br>變數存放的是<b>車位位址: ${addr}</b>，真正的物件在室外大空間 (Heap)。`;
}
function simPerson() {
    highlightLine('person'); const addr = getAddr();
    const sNode = document.createElement('div');
    sNode.className = 'memory-node parking-spot bg-indigo-100 border-2 border-indigo-500 p-2 rounded-lg text-xs';
    sNode.innerHTML = `<div class="font-bold text-indigo-800">bus1 (Car)</div><div class="text-center font-mono">${addr}</div>`;
    stack.appendChild(sNode);
    const hNode = document.createElement('div');
    hNode.className = 'memory-node bg-white border-2 border-indigo-400 p-2 rounded-lg text-xs shadow-md';
    hNode.innerHTML = `<div class="text-[8px] opacity-40">位址: ${addr}</div><div class="font-bold flex items-center gap-1"><i data-lucide="car" size="12"></i> 巴士</div>`;
    heap.appendChild(hNode); refreshIcons();
    explanation.innerHTML = `<b>🚗 比喻：領取大巴士位址 (Car)</b><br>物件很大，變數 <code>bus1</code> 存放的是指向室外大空間 (Heap) 的<b>位址: ${addr}</b>。`;
}
function simIntArray() {
    highlightLine('int-arr'); const addr = getAddr();
    const sNode = document.createElement('div');
    sNode.className = 'memory-node parking-spot bg-sky-100 border-2 border-sky-500 p-2 rounded-lg text-xs';
    sNode.innerHTML = `<div class="font-bold text-sky-800">row (int[])</div><div class="text-center font-mono">${addr}</div>`;
    stack.appendChild(sNode);
    const hNode = document.createElement('div');
    hNode.className = 'memory-node bg-sky-50 border-2 border-sky-400 p-2 rounded-lg text-xs w-full';
    hNode.innerHTML = `
        <div class="text-[9px] font-mono text-sky-700 border-b border-sky-200 mb-2 pb-1">位址: ${addr}</div>
        <div class="flex gap-1">
            <div class="bg-white border flex-1 text-center font-mono py-1 rounded">1</div>
            <div class="bg-white border flex-1 text-center font-mono py-1 rounded">2</div>
        </div>`;
    heap.appendChild(hNode);
    explanation.innerHTML = `<b>🚗 比喻：連號腳踏車位 (int[] 陣列)</b><br>在室外大空間 (Heap) 租了大排連號位。室內變數指向該區塊的<b>位址: ${addr}</b>。`;
}
function simStrArray() {
    highlightLine('str-arr');
    const arrAddr = getAddr(); const aAddr = getAddr(); const bAddr = getAddr(); const cAddr = getAddr();
    const sNode = document.createElement('div');
    sNode.className = 'memory-node parking-spot bg-emerald-100 border-2 border-emerald-500 p-2 rounded-lg text-xs';
    sNode.innerHTML = `<div class="font-bold text-emerald-800">tags (String[])</div><div class="text-center font-mono">${arrAddr}</div>`;
    stack.appendChild(sNode);
    const hArrNode = document.createElement('div');
    hArrNode.className = 'memory-node bg-emerald-50 border-2 border-emerald-400 p-2 rounded-lg text-[8px] w-full';
    hArrNode.innerHTML = `
        <div class="font-mono mb-1 text-emerald-800">位址: ${arrAddr} (大看板)</div>
        <div class="flex gap-1">
            <div class="bg-white border p-1 flex-1 text-center font-mono">${aAddr}</div>
            <div class="bg-white border p-1 flex-1 text-center font-mono">${bAddr}</div>
            <div class="bg-white border p-1 flex-1 text-center font-mono">${cAddr}</div>
        </div>`;
    heap.appendChild(hArrNode);
    [{ a: aAddr, v: "A" }, { a: bAddr, v: "B" }, { a: cAddr, v: "C" }].forEach(item => {
        const hn = document.createElement('div');
        hn.className = 'memory-node bg-white border border-emerald-300 p-1 px-3 rounded-full text-[10px] self-end shadow-sm';
        hn.innerHTML = `<span class="opacity-40 font-mono">位址: ${item.a}</span> <b>"${item.v}"</b>`;
        heap.appendChild(hn);
    });
    explanation.innerHTML = `<b>🚗 比喻：公司單據管理櫃 (String[] 陣列)</b><br>
        1. 變數指向室外 Heap 的<b>大看板 (位址: ${arrAddr})</b>。<br>
        2. 看板上每格記錄著一個<b>車位位址 (地址 ${aAddr}...)</b>。<br>
        3. 透過這些位址，才能找到室外另一處真正的貨物 "A", "B", "C"。`;
}
