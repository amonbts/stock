async function loadMiniCharts() {

  const response =
    await fetch('./dashboard.json');

  const config =
    await response.json();

  const grid =
    document.getElementById(
      'mini-chart-grid'
    );

  config.widgets.forEach((widget, index) => {

    const widgetId =
      `mini-chart-${index}`;

    const col =
      document.createElement('div');

    col.className = 'col';

    col.innerHTML = `

      <div class="card shadow-sm h-100">

        <div class="card-body">

          <div
            class="d-flex justify-content-between mb-3">

            <h6 class="card-title mb-0">
              ${widget.title}
            </h6>

            <span class="badge text-bg-secondary">
              ${widget.interval}
            </span>

          </div>

          <div
            id="${widgetId}"
            class="mini-chart-widget">
          </div>

        </div>

      </div>
    `;

    grid.appendChild(col);

    renderMiniChart(
      widgetId,
      widget
    );
  });
}

function renderMiniChart(
  containerId,
  widget
) {

  document.getElementById(
    containerId
  ).style.height = '220px';

  new TradingView.widget({

    container_id: containerId,

    width: "100%",

    height: 220,

    symbol: widget.symbol,

    interval: widget.interval,

    timezone: 'Europe/Warsaw',

    theme: 'dark',

    style: '1',

    locale: 'en',

    hide_top_toolbar: true,

    hide_legend: true,

    save_image: false,

    enable_publishing: false
  });
}

loadMiniCharts();