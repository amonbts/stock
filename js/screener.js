let activeDataPath = '';
let previousWeek1WByOffset = {
  1: new Map(),
  2: new Map(),
  3: new Map()
};
let previousWeekLabelByOffset = {
  1: 'W-1',
  2: 'W-2',
  3: 'W-3'
};

let screenerRows = [];
let workingRows = [];
let activeTabId = 'overview';
let rowLimit = 'all';
let pipelineHistory = [];
let sortState = {
  tabId: 'overview',
  columnIndex: null,
  direction: 'asc'
};

const URL_PARAM_TAB = 'tab';
const URL_PARAM_STEPS = 'steps';
const URL_PARAM_SORT = 'sort';
const URL_PARAM_DIR = 'dir';
const URL_PARAM_TOP = 'top';

const TAB_CONFIG = [
  {
    id: 'overview',
    label: 'Overview',
    columns: [
      {
        key: 'symbol',
        label: 'Name',
        render: renderNameCell
      },
      { key: 3, label: 'Exchange', render: (row) => escapeHtml(String(row?.d?.[3] ?? '—')) },
      { key: 4, label: 'Price', className: 'text-end', render: (row) => formatNumber(row?.d?.[4]) },
      { key: 12, label: 'Chg %', className: 'text-end', render: (row) => formatPercent(row?.d?.[12]) },
      { key: 14, label: 'Rel vol', className: 'text-end', render: (row) => formatNumber(row?.d?.[14]) },
      { key: 15, label: 'Mkt cap', className: 'text-end', render: (row) => formatLargeNumber(row?.d?.[15]) },
      { key: 17, label: 'P/E', className: 'text-end', render: (row) => formatNumber(row?.d?.[17]) },
      { key: 18, label: 'EPS dil TTM', className: 'text-end', render: (row) => formatNumber(row?.d?.[18]) },
      { key: 19, label: 'EPS dil growth TTM YoY', className: 'text-end', render: (row) => formatPercent(row?.d?.[19]) },
      { key: 20, label: 'Div yield % TTM', className: 'text-end', render: (row) => formatPercent(row?.d?.[20]) },
      { key: 23, label: 'Sector', render: (row) => escapeHtml(String(row?.d?.[23] ?? '—')) },
      { key: 25, label: 'Analyst rating', render: (row) => escapeHtml(String(row?.d?.[25] ?? row?.d?.[24] ?? '—')) },
      { key: 13, label: 'Volume', className: 'text-end', render: (row) => formatInteger(row?.d?.[13]) }
      
    ]
  },
  {
    id: 'performance',
    label: 'Performance',
    columns: [
      { key: 'symbol', label: 'Name', render: renderNameCell },
      { key: 4, label: 'Price', className: 'text-end', render: (row) => formatNumber(row?.d?.[4]) },
      { key: 12, label: 'Chg %', className: 'text-end', render: (row) => formatPercent(row?.d?.[12]) },
      { key: 27, label: '1W %', className: 'text-end', render: (row) => formatPercent(row?.d?.[27]) },
  { key: 'prev1w_1', label: '1W % (W-1)', className: 'text-end', render: (row) => formatPercent(getPreviousWeek1W(row, 1)) },
  { key: 'prev1w_2', label: '1W % (W-2)', className: 'text-end', render: (row) => formatPercent(getPreviousWeek1W(row, 2)) },
  { key: 'prev1w_3', label: '1W % (W-3)', className: 'text-end', render: (row) => formatPercent(getPreviousWeek1W(row, 3)) },
      { key: 28, label: '1M %', className: 'text-end', render: (row) => formatPercent(row?.d?.[28]) },
      { key: 29, label: '3M %', className: 'text-end', render: (row) => formatPercent(row?.d?.[29]) },
      { key: 30, label: '6M %', className: 'text-end', render: (row) => formatPercent(row?.d?.[30]) },
      { key: 31, label: 'YTD %', className: 'text-end', render: (row) => formatPercent(row?.d?.[31]) },
      { key: 32, label: '1Y %', className: 'text-end', render: (row) => formatPercent(row?.d?.[32]) },
      { key: 33, label: '5Y %', className: 'text-end', render: (row) => formatPercent(row?.d?.[33]) },
      { key: 34, label: '10Y %', className: 'text-end', render: (row) => formatPercent(row?.d?.[34]) },
      { key: 35, label: 'All Time %', className: 'text-end', render: (row) => formatPercent(row?.d?.[35]) },
      { key: 36, label: 'Volatility 1W', className: 'text-end', render: (row) => formatPercent(row?.d?.[36]) },
      { key: 37, label: 'Volatility 1M', className: 'text-end', render: (row) => formatPercent(row?.d?.[37]) }
    ]
  },
  {
    id: 'technical',
    label: 'Technical',
    columns: [
      { key: 'symbol', label: 'Name', render: renderNameCell },
      { key: 40, label: 'Tech Rating', render: (row) => escapeHtml(String(row?.d?.[40] ?? '—')) },
      { key: 42, label: 'MA Rating', render: (row) => escapeHtml(String(row?.d?.[42] ?? '—')) },
      { key: 44, label: 'Osc Rating', render: (row) => escapeHtml(String(row?.d?.[44] ?? '—')) },
      { key: 45, label: 'RSI', className: 'text-end', render: (row) => formatNumber(row?.d?.[45]) },
      { key: 46, label: 'Momentum', className: 'text-end', render: (row) => formatNumber(row?.d?.[46]) },
      { key: 48, label: 'CCI20', className: 'text-end', render: (row) => formatNumber(row?.d?.[48]) }
    ]
  },
  {
    id: 'extended',
    label: 'Extended Hours',
    columns: [
      { key: 'symbol', label: 'Name', render: renderNameCell },
      { key: 4, label: 'Close', className: 'text-end', render: (row) => formatNumber(row?.d?.[4]) },
      { key: 54, label: 'Pre', className: 'text-end', render: (row) => formatNumber(row?.d?.[54]) },
      { key: 55, label: 'Pre %', className: 'text-end', render: (row) => formatPercent(row?.d?.[55]) },
      { key: 61, label: 'After', className: 'text-end', render: (row) => formatNumber(row?.d?.[61]) },
      { key: 62, label: 'After %', className: 'text-end', render: (row) => formatPercent(row?.d?.[62]) }
    ]
  },
  {
    id: 'valuation',
    label: 'Valuation',
    columns: [
      { key: 'symbol', label: 'Name', render: renderNameCell },
      { key: 15, label: 'Market Cap', className: 'text-end', render: (row) => formatLargeNumber(row?.d?.[15]) },
      { key: 65, label: 'P/E', className: 'text-end', render: (row) => formatNumber(row?.d?.[65]) },
      { key: 66, label: 'PEG', className: 'text-end', render: (row) => formatNumber(row?.d?.[66]) },
      { key: 67, label: 'P/S', className: 'text-end', render: (row) => formatNumber(row?.d?.[67]) },
      { key: 68, label: 'P/B', className: 'text-end', render: (row) => formatNumber(row?.d?.[68]) }
    ]
  }
];

async function loadScreener() {
  const status = document.getElementById('screener-status');
  const controls = document.getElementById('screener-controls');
  const topSelect = document.getElementById('top-n-select');
  const undoButton = document.getElementById('screener-undo');
  const resetButton = document.getElementById('screener-reset');

  try {
    const { year, week, candidates } = buildCurrentDataPathCandidates();
    const { response, selectedPath } = await fetchFirstAvailableDataPath(candidates);

    if (!response || !response.ok || !selectedPath) {
      throw new Error(
        `Cannot find screener data for ${year}-${week}. Tried: ${candidates.join(', ')}`
      );
    }

    activeDataPath = selectedPath;
    updateDataSourceLabel(activeDataPath);

    const payload = await response.json();
    screenerRows = payload?.data || [];
    workingRows = [...screenerRows];
    await loadPreviousWeeksPerformance();
    updatePerformancePreviousWeekLabels();

    if (topSelect) {
      topSelect.addEventListener('change', () => {
        rowLimit = topSelect.value;
        applyTopFilter({ recordHistory: true });
      });
    }

    if (undoButton) {
      undoButton.addEventListener('click', () => {
        undoLastStep();
      });
    }

    if (resetButton) {
      resetButton.addEventListener('click', () => {
        resetPipeline();
      });
    }

    controls?.classList.remove('d-none');
    document.getElementById('screener-state')?.classList.remove('d-none');

    applyStateFromUrl();

    renderTabs();
    renderActiveTabTable();

    status.className = 'alert alert-success';
    status.textContent = `Loaded ${screenerRows.length} rows from ${activeDataPath}`;
  } catch (error) {
    updateDataSourceLabel('unavailable');
    status.className = 'alert alert-danger';
    status.textContent = `Cannot load screener data: ${error.message}`;
  }
}

function updateDataSourceLabel(path) {
  const sourceEl = document.getElementById('screener-data-source');

  if (!sourceEl) {
    return;
  }

  sourceEl.textContent = String(path || '(auto)');
}

function renderTabs() {
  const tabsRoot = document.getElementById('screener-tabs');

  tabsRoot.innerHTML = TAB_CONFIG.map((tab) => `
    <li class="nav-item" role="presentation">
      <button
        class="nav-link ${tab.id === activeTabId ? 'active' : ''}"
        type="button"
        data-tab-id="${tab.id}">
        ${tab.label}
      </button>
    </li>
  `).join('');

  tabsRoot.querySelectorAll('button[data-tab-id]').forEach((button) => {
    button.addEventListener('click', () => {
      activeTabId = button.dataset.tabId;

      renderTabs();
      renderActiveTabTable();
    });
  });
}

function renderActiveTabTable() {
  const tableRoot = document.getElementById('screener-table-root');
  const activeTab = TAB_CONFIG.find((tab) => tab.id === activeTabId);

  if (!activeTab) {
    return;
  }

  const columns = activeTab.columns;
  const visibleRows = getSortedRows(workingRows, activeTab);
  const status = document.getElementById('screener-status');

  tableRoot.classList.remove('d-none');
  tableRoot.innerHTML = `
    <table class="table table-sm table-hover align-middle">
      <thead>
        <tr>
          <th class="text-end">#</th>
          ${columns.map((col, index) => {
            const isActiveSort = sortState.tabId === activeTabId && sortState.columnIndex === index;
            const arrow = isActiveSort
              ? (sortState.direction === 'asc' ? ' ↑' : ' ↓')
              : '';

            return `<th class="${col.className || ''} screener-sortable" data-col-index="${index}">${col.label}${arrow}</th>`;
          }).join('')}
        </tr>
      </thead>
      <tbody>
        ${visibleRows.map((row, index) => `
          <tr>
            <td class="text-end text-body-secondary">${index + 1}</td>
            ${columns.map((col) => `<td class="${col.className || ''}">${col.render(row)}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  if (status && status.classList.contains('alert-success')) {
    status.textContent = `Loaded ${screenerRows.length} rows from ${activeDataPath} · working set: ${workingRows.length} · showing ${visibleRows.length}`;
  }

  renderStatePanel(visibleRows.length);
  syncStateToUrl();

  tableRoot.querySelectorAll('th[data-col-index]').forEach((th) => {
    th.addEventListener('click', () => {
      const clickedIndex = Number(th.dataset.colIndex);

      if (sortState.tabId === activeTabId && sortState.columnIndex === clickedIndex) {
        sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
      } else {
        sortState = {
          tabId: activeTabId,
          columnIndex: clickedIndex,
          direction: 'asc'
        };
      }

      const clickedColumn = columns[clickedIndex];
      if (clickedColumn?.label) {
        addHistoryEntry({
          type: 'sort',
          label: `Sort: ${clickedColumn.label} ${sortState.direction === 'asc' ? '↑' : '↓'}`,
          columnIndex: clickedIndex,
          direction: sortState.direction
        });
      }

      workingRows = getSortedRows(workingRows, activeTab);

      renderActiveTabTable();
    });
  });
}

function applyTopFilter({ recordHistory = true } = {}) {
  const activeTab = TAB_CONFIG.find((tab) => tab.id === activeTabId);

  if (!activeTab) {
    return;
  }

  if (rowLimit === 'all') {
    renderActiveTabTable();
    return;
  }

  const n = Number(rowLimit);

  if (!Number.isFinite(n) || n <= 0) {
    renderActiveTabTable();
    return;
  }

  const sortedCurrent = getSortedRows(workingRows, activeTab);
  workingRows = sortedCurrent.slice(0, n);

  const hasActiveSort = sortState.tabId === activeTabId && Number.isInteger(sortState.columnIndex);

  if (recordHistory && hasActiveSort) {
    addHistoryEntry({
      type: 'top',
      label: `Top ${n}`,
      n
    });
  }

  renderActiveTabTable();
}

function resetPipeline(silent = false) {
  workingRows = [...screenerRows];
  rowLimit = 'all';
  pipelineHistory = [];

  const topSelect = document.getElementById('top-n-select');
  if (topSelect) {
    topSelect.value = 'all';
  }

  if (!silent) {
    renderActiveTabTable();
  } else {
    renderStatePanel();
  }
}

function addHistoryEntry(entry) {
  if (!entry || !entry.label) {
    return;
  }

  const lastEntry = pipelineHistory[pipelineHistory.length - 1];
  if (
    entry.type === 'sort' &&
    lastEntry?.type === 'sort'
  ) {
    pipelineHistory[pipelineHistory.length - 1] = entry;
    return;
  }

  if (
    entry.type === 'top' &&
    lastEntry?.type === 'top'
  ) {
    pipelineHistory[pipelineHistory.length - 1] = entry;
    return;
  }

  pipelineHistory.push(entry);

  if (pipelineHistory.length > 10) {
    pipelineHistory = pipelineHistory.slice(-10);
  }
}

function undoLastStep() {
  if (!pipelineHistory.length) {
    return;
  }

  pipelineHistory.pop();

  sortState = {
    tabId: activeTabId,
    columnIndex: null,
    direction: 'asc'
  };

  replayPipelineHistory();
  renderActiveTabTable();
}

function replayPipelineHistory() {
  const activeTab = TAB_CONFIG.find((tab) => tab.id === activeTabId);
  workingRows = [...screenerRows];
  rowLimit = 'all';

  if (!activeTab) {
    return;
  }

  for (const step of pipelineHistory) {
    if (step.type === 'sort') {
      sortState = {
        tabId: activeTabId,
        columnIndex: step.columnIndex,
        direction: step.direction || 'asc'
      };

      workingRows = getSortedRows(workingRows, activeTab);
      continue;
    }

    if (step.type === 'top') {
      const n = Number(step.n);

      if (Number.isFinite(n) && n > 0) {
        const sortedCurrent = getSortedRows(workingRows, activeTab);
        workingRows = sortedCurrent.slice(0, n);
        rowLimit = String(n);
      }
    }
  }

  const topSelect = document.getElementById('top-n-select');
  if (topSelect) {
    topSelect.value = rowLimit;
  }
}

function applyStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const tabFromUrl = params.get(URL_PARAM_TAB);

  if (tabFromUrl && TAB_CONFIG.some((tab) => tab.id === tabFromUrl)) {
    activeTabId = tabFromUrl;
  }

  const activeTab = TAB_CONFIG.find((tab) => tab.id === activeTabId);

  sortState = {
    tabId: activeTabId,
    columnIndex: null,
    direction: 'asc'
  };
  pipelineHistory = [];
  rowLimit = 'all';
  workingRows = [...screenerRows];

  if (!activeTab) {
    return;
  }

  const rawSteps = params.get(URL_PARAM_STEPS);

  if (rawSteps) {
    const parsedSteps = parseStepsFromUrl(rawSteps, activeTab);
    if (parsedSteps.length > 0) {
      pipelineHistory = parsedSteps;
      replayPipelineHistory();
      return;
    }
  }

  const legacySteps = parseLegacyStepsFromUrl(params, activeTab);
  if (legacySteps.length > 0) {
    pipelineHistory = legacySteps;
    replayPipelineHistory();
  }
}

function parseStepsFromUrl(rawSteps, activeTab) {
  return rawSteps
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => parseStepToken(token, activeTab))
    .filter(Boolean);
}

function parseStepToken(token, activeTab) {
  const [type, a, b] = token.split('.');

  if (type === 's') {
    const columnIndex = Number(a);
    const direction = b === 'desc' ? 'desc' : 'asc';

    if (!Number.isInteger(columnIndex) || columnIndex < 0 || columnIndex >= activeTab.columns.length) {
      return null;
    }

    return {
      type: 'sort',
      label: `Sort: ${activeTab.columns[columnIndex].label} ${direction === 'asc' ? '↑' : '↓'}`,
      columnIndex,
      direction
    };
  }

  if (type === 't') {
    const n = Number(a);

    if (!Number.isFinite(n) || n <= 0) {
      return null;
    }

    return {
      type: 'top',
      label: `Top ${n}`,
      n
    };
  }

  return null;
}

function parseLegacyStepsFromUrl(params, activeTab) {
  const steps = [];
  const sortParam = params.get(URL_PARAM_SORT);
  const dirParam = params.get(URL_PARAM_DIR);
  const topParam = params.get(URL_PARAM_TOP);

  if (sortParam !== null && sortParam !== '') {
    const columnIndex = Number(sortParam);

    if (Number.isInteger(columnIndex) && columnIndex >= 0 && columnIndex < activeTab.columns.length) {
      const direction = dirParam === 'desc' ? 'desc' : 'asc';
      steps.push({
        type: 'sort',
        label: `Sort: ${activeTab.columns[columnIndex].label} ${direction === 'asc' ? '↑' : '↓'}`,
        columnIndex,
        direction
      });
    }
  }

  if (topParam !== null && topParam !== '' && topParam !== 'all') {
    const n = Number(topParam);

    if (Number.isFinite(n) && n > 0) {
      steps.push({
        type: 'top',
        label: `Top ${n}`,
        n
      });
    }
  }

  return steps;
}

function syncStateToUrl() {
  const params = new URLSearchParams(window.location.search);

  params.set(URL_PARAM_TAB, activeTabId);

  if (pipelineHistory.length > 0) {
    params.set(URL_PARAM_STEPS, serializeStepsForUrl(pipelineHistory));
  } else {
    params.delete(URL_PARAM_STEPS);
  }

  if (sortState.tabId === activeTabId && Number.isInteger(sortState.columnIndex)) {
    params.set(URL_PARAM_SORT, String(sortState.columnIndex));
    params.set(URL_PARAM_DIR, sortState.direction === 'desc' ? 'desc' : 'asc');
  } else {
    params.delete(URL_PARAM_SORT);
    params.delete(URL_PARAM_DIR);
  }

  if (rowLimit !== 'all') {
    params.set(URL_PARAM_TOP, String(rowLimit));
  } else {
    params.delete(URL_PARAM_TOP);
  }

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash || ''}`;
  window.history.replaceState(null, '', nextUrl);
}

function serializeStepsForUrl(steps) {
  return steps
    .map((step) => {
      if (step.type === 'sort' && Number.isInteger(step.columnIndex)) {
        const dir = step.direction === 'desc' ? 'desc' : 'asc';
        return `s.${step.columnIndex}.${dir}`;
      }

      if (step.type === 'top') {
        const n = Number(step.n);
        if (Number.isFinite(n) && n > 0) {
          return `t.${n}`;
        }
      }

      return null;
    })
    .filter(Boolean)
    .join(',');
}

async function loadPreviousWeeksPerformance() {
  previousWeek1WByOffset = {
    1: new Map(),
    2: new Map(),
    3: new Map()
  };

  previousWeekLabelByOffset = {
    1: 'W-1',
    2: 'W-2',
    3: 'W-3'
  };

  for (const offset of [1, 2, 3]) {
    const weekInfo = getIsoWeekInfoByOffset(offset);
    const candidates = buildDataPathCandidatesForIsoWeek(weekInfo.year, weekInfo.week);
    const { response, selectedPath } = await fetchFirstAvailableDataPath(candidates);

    previousWeekLabelByOffset[offset] = getWeekLabelFromPath(selectedPath) || `${weekInfo.year}-${String(weekInfo.week).padStart(2, '0')}`;

    if (!response || !response.ok) {
      continue;
    }

    try {
      const payload = await response.json();
      const rows = Array.isArray(payload?.data) ? payload.data : [];
      previousWeek1WByOffset[offset] = new Map(
        rows
          .map((row) => {
            const symbol = row?.s;
            const value = Number(row?.d?.[27]);

            if (!symbol || !Number.isFinite(value)) {
              return null;
            }

            return [symbol, value];
          })
          .filter(Boolean)
      );
    } catch {
      // keep empty map for this offset
    }
  }
}

function updatePerformancePreviousWeekLabels() {
  const performanceTab = TAB_CONFIG.find((tab) => tab.id === 'performance');

  if (!performanceTab) {
    return;
  }

  const labels = {
    prev1w_1: `1W % (${previousWeekLabelByOffset[1] || 'W-1'})`,
    prev1w_2: `1W % (${previousWeekLabelByOffset[2] || 'W-2'})`,
    prev1w_3: `1W % (${previousWeekLabelByOffset[3] || 'W-3'})`
  };

  performanceTab.columns.forEach((column) => {
    if (labels[column.key]) {
      column.label = labels[column.key];
    }
  });
}

function getPreviousWeek1W(row, offset) {
  const symbol = row?.s;

  if (!symbol) {
    return null;
  }

  return previousWeek1WByOffset[offset]?.get(symbol);
}

function getIsoWeekInfoByOffset(weeksOffset) {
  const shifted = new Date();
  shifted.setDate(shifted.getDate() - (weeksOffset * 7));
  return getIsoWeekInfo(shifted);
}

function getWeekLabelFromPath(path) {
  if (!path) {
    return '';
  }

  const match = String(path).match(/tradingview_CUSTOM_(\d{4}-\d{1,2})\.json/i);
  return match?.[1] || '';
}

function buildCurrentDataPathCandidates() {
  const { year, week } = getIsoWeekInfo(new Date());
  const candidates = buildDataPathCandidatesForIsoWeek(year, week);

  return {
    year,
    week,
    candidates
  };
}

function buildDataPathCandidatesForIsoWeek(year, week) {
  const weekPadded = String(week).padStart(2, '0');
  const weekRaw = String(week);

  const suffixes = [...new Set([`${year}-${weekRaw}`, `${year}-${weekPadded}`])];
  return suffixes.map((suffix) => `./storage/tradingview_CUSTOM_${suffix}.json`);
}

async function fetchFirstAvailableDataPath(candidates) {
  for (const path of candidates) {
    try {
      const response = await fetch(path, { cache: 'no-store' });

      if (response.ok) {
        return {
          response,
          selectedPath: path
        };
      }
    } catch {
      // try next candidate
    }
  }

  return {
    response: null,
    selectedPath: ''
  };
}

function getIsoWeekInfo(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;

  d.setUTCDate(d.getUTCDate() + 4 - day);

  const year = d.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

  return {
    year,
    week
  };
}

function renderStatePanel(visibleCount = null) {
  const summaryRoot = document.getElementById('screener-state-summary');
  const historyRoot = document.getElementById('screener-state-history');
  const activeTab = TAB_CONFIG.find((tab) => tab.id === activeTabId);

  if (!summaryRoot || !historyRoot || !activeTab) {
    return;
  }

  const sortLabel = getCurrentSortLabel(activeTab);
  const displayVisibleCount = Number.isFinite(visibleCount) ? visibleCount : workingRows.length;
  const topLabel = rowLimit === 'all' ? 'All rows' : `Top ${rowLimit}`;

  summaryRoot.innerHTML = [
    `<strong>Tab:</strong> ${escapeHtml(activeTab.label)}`,
    `<strong>Sort:</strong> ${escapeHtml(sortLabel)}`,
    `<strong>Scope:</strong> ${escapeHtml(topLabel)}`,
    `<strong>Rows:</strong> ${workingRows.length}/${screenerRows.length} (showing ${displayVisibleCount})`
  ].join(' &nbsp;•&nbsp; ');

  if (pipelineHistory.length === 0) {
    historyRoot.innerHTML = '<span class="text-body-secondary small">No filter/sort actions yet.</span>';
    const undoButton = document.getElementById('screener-undo');
    if (undoButton) {
      undoButton.disabled = true;
    }
    return;
  }

  historyRoot.innerHTML = pipelineHistory
    .map((entry, index) => `<span class="badge text-bg-secondary screener-state-pill">${index + 1}. ${escapeHtml(entry.label)}</span>`)
    .join('');

  const undoButton = document.getElementById('screener-undo');
  if (undoButton) {
    undoButton.disabled = false;
  }
}

function getCurrentSortLabel(activeTab) {
  if (sortState.tabId !== activeTab.id || sortState.columnIndex === null || sortState.columnIndex === undefined) {
    return 'None';
  }

  const col = activeTab.columns[sortState.columnIndex];
  if (!col) {
    return 'None';
  }

  return `${col.label} ${sortState.direction === 'asc' ? '↑' : '↓'}`;
}

function renderNameCell(row) {
  const symbol = row?.s || '';
  const d = row?.d || [];
  const meta = d[0] || {};
  const ticker = d[1] || meta?.name || symbol;
  const description = d[2] || meta?.description || '';
  const logoid = meta?.logoid || meta?.logo?.logoid;
  const symbolPath = symbol.replace(':', '-');

  const logo = logoid
    ? `<img src="https://s3-symbol-logo.tradingview.com/${String(logoid).toLowerCase()}.svg" width="18" height="18" class="rounded-circle me-2" loading="lazy" onerror="this.style.display='none'" alt="${ticker} logo">`
    : '';

  return `
    <div class="d-flex align-items-center">
      ${logo}
      <div>
        <a href="https://www.tradingview.com/symbols/${symbolPath}/" target="_blank" rel="noopener nofollow">${escapeHtml(ticker)}</a>
        <div class="small text-body-secondary">${escapeHtml(description)}</div>
      </div>
    </div>
  `;
}

function getSortedRows(rows, activeTab) {
  if (!Array.isArray(rows)) {
    return [];
  }

  const { tabId, columnIndex, direction } = sortState;

  if (tabId !== activeTab.id || columnIndex === null || columnIndex === undefined) {
    return [...rows];
  }

  const column = activeTab.columns[columnIndex];

  if (!column) {
    return [...rows];
  }

  const sorted = [...rows].sort((a, b) => {
    const aVal = getSortValue(a, column);
    const bVal = getSortValue(b, column);

    const aNum = Number(aVal);
    const bNum = Number(bVal);
    const aIsNum = Number.isFinite(aNum);
    const bIsNum = Number.isFinite(bNum);

    if (aIsNum && bIsNum) {
      return aNum - bNum;
    }

    if (aVal === null || aVal === undefined || aVal === '') return 1;
    if (bVal === null || bVal === undefined || bVal === '') return -1;

    return String(aVal).localeCompare(String(bVal), undefined, { numeric: true, sensitivity: 'base' });
  });

  return direction === 'desc' ? sorted.reverse() : sorted;
}

function getSortValue(row, column) {
  if (column.key === 'symbol' || column.key === 'ticker') {
    return row?.d?.[1] || row?.s || '';
  }

  if (column.key === 'prev1w_1') {
    return getPreviousWeek1W(row, 1);
  }

  if (column.key === 'prev1w_2') {
    return getPreviousWeek1W(row, 2);
  }

  if (column.key === 'prev1w_3') {
    return getPreviousWeek1W(row, 3);
  }

  if (typeof column.key === 'number') {
    return row?.d?.[column.key];
  }

  return '';
}

function formatNumber(value) {
  const num = Number(value);

  if (!Number.isFinite(num)) {
    return '—';
  }

  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatInteger(value) {
  const num = Number(value);

  if (!Number.isFinite(num)) {
    return '—';
  }

  return num.toLocaleString(undefined, {
    maximumFractionDigits: 0
  });
}

function formatPercent(value) {
  const num = Number(value);

  if (!Number.isFinite(num)) {
    return '—';
  }

  const signClass = num >= 0 ? 'text-success' : 'text-danger';
  const text = `${num.toFixed(2)}%`;

  return `<span class="${signClass}">${text}</span>`;
}

function formatLargeNumber(value) {
  const num = Number(value);

  if (!Number.isFinite(num)) {
    return '—';
  }

  const abs = Math.abs(num);

  if (abs >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(num / 1e6).toFixed(2)}M`;

  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

loadScreener();
