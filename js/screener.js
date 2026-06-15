const DATA_PATH = './storage/tradingview_CUSTOM_2026-25.json';

let screenerRows = [];
let activeTabId = 'overview';
let rowLimit = 'all';
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

  try {
    const response = await fetch(DATA_PATH);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    screenerRows = payload?.data || [];

    if (topSelect) {
      topSelect.addEventListener('change', () => {
        rowLimit = topSelect.value;
        renderActiveTabTable();
      });
    }

    controls?.classList.remove('d-none');

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
  const sortedRows = getSortedRows(screenerRows, activeTab);
  const visibleRows = applyRowLimit(sortedRows);
  const status = document.getElementById('screener-status');

  tableRoot.classList.remove('d-none');
  tableRoot.innerHTML = `
    <table class="table table-sm table-hover align-middle">
      <thead>
        <tr>
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
        ${visibleRows.map((row) => `
          <tr>
            ${columns.map((col) => `<td class="${col.className || ''}">${col.render(row)}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  if (status && status.classList.contains('alert-success')) {
    const limitText = rowLimit === 'all' ? 'all' : `top ${rowLimit}`;
    status.textContent = `Loaded ${screenerRows.length} rows from ${DATA_PATH} · showing ${visibleRows.length} (${limitText})`;
  }

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

      renderActiveTabTable();
    });
  });
}

function applyRowLimit(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  if (rowLimit === 'all') {
    return rows;
  }

  const n = Number(rowLimit);

  if (!Number.isFinite(n) || n <= 0) {
    return rows;
  }

  return rows.slice(0, n);
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
