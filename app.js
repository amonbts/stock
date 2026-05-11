let dashboardConfig = null;

async function loadDashboard() {

  const response =
    await fetch('./dashboard.json');

  dashboardConfig =
    await response.json();

  document.getElementById('dashboard-title').innerText =
    dashboardConfig.title;

  document.getElementById('dashboard-description').innerText =
    dashboardConfig.description;

  buildGroupFilter();

  renderWidgets('ALL');
}

function buildGroupFilter() {

  const select =
    document.getElementById('group-filter');

  dashboardConfig.groups.forEach(group => {

    const option =
      document.createElement('option');

    option.value = group;

    option.innerText = group;

    select.appendChild(option);
  });

  select.addEventListener('change', (e) => {

    renderWidgets(e.target.value);
  });
}

function renderWidgets(selectedGroup) {

  const grid =
    document.getElementById('widgets-grid');

  grid.innerHTML = '';

  let widgets =
    dashboardConfig.widgets;

  if (selectedGroup !== 'ALL') {

    widgets = widgets.filter(widget =>
      widget.groups.includes(selectedGroup)
    );
  }

  widgets.forEach((widget, index) => {

    const widgetId = `tv-widget-${index}`;

    const col = document.createElement('div');

    col.className = 'col';

    col.innerHTML = `
      <div class="card shadow-sm h-100">
        <div class="card-body">

          <div class="d-flex justify-content-between mb-2">
            <h5 class="card-title">
              ${widget.title}
            </h5>

            <div>
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

    renderTradingViewWidget(widgetId, widget);
  });
}

function renderTradingViewWidget(containerId, widget) {

  const container =
    document.getElementById(containerId);

  container.style.height =
    `${widget.height}px`;

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