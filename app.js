async function loadDashboard() {

  const response = await fetch('./dashboard.json');

  const config = await response.json();

  document.getElementById('dashboard-title').innerText =
    config.title;

  document.getElementById('dashboard-description').innerText =
    config.description;

  const grid = document.getElementById('widgets-grid');

  config.widgets.forEach((widget, index) => {

    const widgetId = `tv-widget-${index}`;

    const col = document.createElement('div');

    col.className = 'col';

    col.innerHTML = `
      <div class="card shadow-sm h-100">
        <div class="card-body">

          <h5 class="card-title mb-3">
            ${widget.title}
          </h5>

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

  new TradingView.widget({
    container_id: containerId,
    // autosize: true,
    width: "100%",
    symbol: widget.symbol,
    interval: widget.interval,
    timezone: 'Europe/Warsaw',
    theme: 'dark',
    style: '1',
    locale: 'en',
    studies:["STD;SMA","STD;Momentum"],
    interval:"D",
    withdateranges: true,
    enable_publishing: false,
    hide_top_toolbar: false,    
    hide_side_toolbar: false,
    hide_side_toolbar: false,
    hide_legend: false,
    save_image: false,
    height: widget.height
  });
}

loadDashboard();
