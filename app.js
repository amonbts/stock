let dashboardConfig = null;

let selectedGroups = new Set();

let searchQuery = '';

async function loadDashboard() {

  const response =
    await fetch('./dashboard.json');

  dashboardConfig =
    await response.json();

  document.getElementById('dashboard-title').innerText =
    dashboardConfig.title;

  document.getElementById('dashboard-description').innerText =
    dashboardConfig.description;

  buildGroupFilters();

  setupSearch();

  renderWidgets();
}

function buildGroupFilters() {

  const container =
    document.getElementById('group-filters');

  dashboardConfig.groups.forEach(group => {

    const wrapper =
      document.createElement('div');

    wrapper.className =
      'form-check form-check-inline';

    wrapper.innerHTML = `
      <input
        class="btn-check"
        type="checkbox"
        id="group-${group}"
        value="${group}"
        autocomplete="off">

      <label
        class="btn btn-outline-primary"
        for="group-${group}">
        ${group}
      </label>
    `;

    container.appendChild(wrapper);

    const checkbox =
      wrapper.querySelector('input');

    checkbox.addEventListener('change', () => {

      if (checkbox.checked) {

        selectedGroups.add(group);

      } else {

        selectedGroups.delete(group);
      }

      renderWidgets();
    });
  });

  addControlButtons(container);
}

function addControlButtons(container) {

  const controls =
    document.createElement('div');

  controls.className =
    'ms-3 d-inline-flex gap-2';

  controls.innerHTML = `

    <button
      class="btn btn-sm btn-secondary"
      id="select-all-btn">

      Select all

    </button>

    <button
      class="btn btn-sm btn-outline-secondary"
      id="clear-all-btn">

      Clear

    </button>
  `;

  container.appendChild(controls);

  document
    .getElementById('select-all-btn')
    .addEventListener('click', () => {

      dashboardConfig.groups.forEach(group => {

        selectedGroups.add(group);

        document.getElementById(
          `group-${group}`
        ).checked = true;
      });

      renderWidgets();
    });

  document
    .getElementById('clear-all-btn')
    .addEventListener('click', () => {

      selectedGroups.clear();

      dashboardConfig.groups.forEach(group => {

        document.getElementById(
          `group-${group}`
        ).checked = false;
      });

      renderWidgets();
    });
}

function debounce(fn, delay) {

  let timeout;

  return (...args) => {

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

function setupSearch() {

  const input =
    document.getElementById('search-input');

  const debouncedSearch =
    debounce((value) => {

      searchQuery =
        value.trim().toLowerCase();

      renderWidgets();

    }, 200);

  input.addEventListener('input', (e) => {

    debouncedSearch(e.target.value);
  });
}

function renderWidgets() {

  const grid =
    document.getElementById('widgets-grid');

  grid.innerHTML = '';

  let widgets =
    dashboardConfig.widgets;

  //
  // GROUP FILTER
  //

  if (selectedGroups.size > 0) {

    widgets = widgets.filter(widget => {

      return widget.groups.some(group =>
        selectedGroups.has(group)
      );
    });
  }

  //
  // SEARCH FILTER
  //

  if (searchQuery.length > 0) {

    widgets = widgets.filter(widget => {

      const searchableText = [

        widget.title,

        widget.symbol,

        ...(widget.groups || [])

      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(
        searchQuery
      );
    });
  }

  //
  // EMPTY STATE
  //

  if (widgets.length === 0) {

    grid.innerHTML = `

      <div class="col-12">

        <div class="alert alert-secondary">

          No widgets found.

        </div>

      </div>
    `;

    return;
  }

  //
  // RENDER WIDGETS
  //

  widgets.forEach((widget, index) => {

    const widgetId =
      `tv-widget-${index}`;

    const col =
      document.createElement('div');

    col.className = 'col';

    col.innerHTML = `

      <div class="card shadow-sm h-100">

        <div class="card-body">

          <div
            class="d-flex justify-content-between align-items-start mb-3">

            <h5 class="card-title">
              ${widget.title}
            </h5>

            <div class="text-end">

              ${widget.groups.map(group => `
                <span class="badge text-bg-secondary">
                  ${group}
                </span>
              `).join('')}

            </div>

          </div>

          <div
            id="${widgetId}"
            class="tradingview-widget">
          </div>

          <div class="tradingview-widget-copyright">

            <a
              href="https://www.tradingview.com/symbols/${widget.tvSymbolUrl}/"
              rel="noopener nofollow"
              target="_blank">

              <span class="blue-text">
                ${widget.symbol} chart
              </span>

            </a>

            <span class="trademark">
              by TradingView
            </span>

          </div>

        </div>

      </div>
    `;

    grid.appendChild(col);

    setupLazyWidget(widgetId, widget);
  });
}

function setupLazyWidget(containerId, widget) {

  const container =
    document.getElementById(containerId);

  container.style.height =
    `${widget.height}px`;

  const observer =
    new IntersectionObserver(entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          renderTradingViewWidget(
            containerId,
            widget
          );

          observer.unobserve(container);
        }
      });

    }, {
      rootMargin: '300px'
    });

  observer.observe(container);
}

function renderTradingViewWidget(containerId, widget) {

  new TradingView.widget({

    container_id: containerId,

    width: "100%",

    height: widget.height,

    symbol: widget.symbol,

    interval: widget.interval,

    timezone: 'Europe/Warsaw',

    theme: 'dark',

    style: '1',

    locale: 'en',
    studies: ["STD;SMA", "STD;Momentum"],
    interval: "D",
    withdateranges: true,

    enable_publishing: false,

    hide_top_toolbar: false,
    hide_side_toolbar: false,
    hide_side_toolbar: false,
    hide_legend: false,

    save_image: false
  });
}

loadDashboard();