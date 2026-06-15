const DATA_PATH = './storage/tradingview_CUSTOM_2026-25.json';

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
      { key: 12, label: 'Change %', className: 'text-end', render: (row) => formatPercent(row?.d?.[12]) },
      { key: 27, label: '1W %', className: 'text-end', render: (row) => formatPercent(row?.d?.[27]) },
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
  const resetButton = document.getElementById('screener-reset');

  try {
    const response = await fetch(DATA_PATH);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    screenerRows = payload?.data || [];
    workingRows = [...screenerRows];

    if (topSelect) {
      topSelect.addEventListener('change', () => {
        rowLimit = topSelect.value;
        applyTopFilter();
      });
    }

    if (resetButton) {
      resetButton.addEventListener('click', () => {
        resetPipeline();
      });
    }

    controls?.classList.remove('d-none');
  document.getElementById('screener-state')?.classList.remove('d-none');

    renderTabs();
    renderActiveTabTable();

    status.className = 'alert alert-success';
    status.textContent = `Loaded ${screenerRows.length} rows from ${DATA_PATH}`;
  } catch (error) {
    status.className = 'alert alert-danger';
    status.textContent = `Cannot load screener data: ${error.message}`;
  }
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

      if (sortState.tabId !== activeTabId) {
        sortState = {
          tabId: activeTabId,
          columnIndex: null,
          direction: 'asc'
        };

        resetPipeline(true);
      }

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
    status.textContent = `Loaded ${screenerRows.length} rows from ${DATA_PATH} · working set: ${workingRows.length} · showing ${visibleRows.length}`;
  }

  renderStatePanel(visibleRows.length);

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
        addHistoryEntry(`Sort: ${clickedColumn.label} ${sortState.direction === 'asc' ? '↑' : '↓'}`);
      }

      renderActiveTabTable();
    });
  });
}

function applyTopFilter() {
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
  addHistoryEntry(`Top ${n}`);

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

function addHistoryEntry(label) {
  if (!label) {
    return;
  }

  pipelineHistory.push(label);

  if (pipelineHistory.length > 10) {
    pipelineHistory = pipelineHistory.slice(-10);
  }
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
    return;
  }

  historyRoot.innerHTML = pipelineHistory
    .map((entry, index) => `<span class="badge text-bg-secondary screener-state-pill">${index + 1}. ${escapeHtml(entry)}</span>`)
    .join('');
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
