async function loadMiniCharts() {

    const response =
        await fetch('./dashboard.json');

    const config =
        await response.json();

    await loadFilters(config);

    renderWidgets(config);
}

function renderWidgets(config) {

    const grid =
        document.getElementById(
            'mini-chart-grid'
        );

    grid.innerHTML = '';

    const widgets =
        filterWidgets(
            config.widgets
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
    // RENDER MINI CHARTS
    //

    widgets.forEach((widget, index) => {

        const widgetId =
            `mini-chart-${index}`;

        const col =
            document.createElement('div');

        col.className = 'col';

        col.innerHTML = `
            <div
                id="${widgetId}"
                class="mini-chart-widget">
            </div>
            `;

        grid.appendChild(col);

        setupLazyMiniChart(
            widgetId,
            widget
        );
    });
}

function setupLazyMiniChart(
    containerId,
    widget
) {

    const container =
        document.getElementById(
            containerId
        );

    const observer =
        new IntersectionObserver(entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    renderMiniChart(
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

function renderMiniChart(
    containerId,
    widget
) {

    const container =
        document.getElementById(
            containerId
        );

    container.innerHTML = '';

    container.style.height = '220px';

    new TradingView.widget({

        container_id: containerId,

        width: "100%",

        height: 220,

        symbol: widget.symbol,

        interval: widget.interval || "5",

        timezone: "America/New_York",

        theme: "dark",

        style: "1",

        locale: "en",

        hide_top_toolbar: true,

        hide_legend: true,

        save_image: false,

        enable_publishing: false,

        allow_symbol_change: false,

        withdateranges: false,

        details: false,

        hotlist: false,

        calendar: false,

        studies: [],

        overrides: {

            "mainSeriesProperties.sessionId":
                "extended"
        }
    });
}

loadMiniCharts();