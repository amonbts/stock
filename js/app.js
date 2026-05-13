let dashboardConfig = null;

async function loadDashboard() {

  await waitForTradingView();

  const response =
    await fetch('./dashboard.json');

  dashboardConfig =
    await response.json();

  document.getElementById('dashboard-title').innerText =
    dashboardConfig.title;

  document.getElementById('dashboard-description').innerText =
    dashboardConfig.description;

  await loadFilters(dashboardConfig);

  renderWidgets();
}

function renderWidgets() {

  const grid =
    document.getElementById('widgets-grid');

  grid.innerHTML = '';

  const widgets =
    filterWidgets(
      dashboardConfig.widgets
    );

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
              href="https://www.tradingview.com/symbols/${widget.symbol.replace(':', '-')}/"
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

    setupLazyWidget(
      widgetId,
      widget
    );
  });
}

function setupLazyWidget(
  containerId,
  widget
) {

  const container =
    document.getElementById(
      containerId
    );

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

function renderTradingViewWidget(
  containerId,
  widget
) {

  if (!window.TradingView) {

    console.error(
      'TradingView library not loaded'
    );

    return;
  }

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
    // interval: "D",
    withdateranges: true,

    enable_publishing: false,
    allow_symbol_change: false,

    hide_top_toolbar: false,
    hide_side_toolbar: false,
    hide_side_toolbar: false,
    hide_legend: false,

    save_image: false,

    studies: [],

    details: false,

    hotlist: false,

    calendar: false,

    overrides: {

      "mainSeriesProperties.sessionId":
        "extended"
    }
  });
}

function waitForTradingView() {

  return new Promise(resolve => {

    if (window.TradingView) {

      resolve();

      return;
    }

    const interval =
      setInterval(() => {

        if (window.TradingView) {

          clearInterval(interval);

          resolve();
        }

      }, 50);
  });
}

loadDashboard();