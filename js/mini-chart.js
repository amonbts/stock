let miniChartConfig = null;

async function loadMiniCharts() {

    const response = await fetch('./generated/dashboard.json')

    miniChartConfig =
        await response.json();

    await loadFilters(
        miniChartConfig
    );

    renderWidgets();
}

function renderWidgets() {

    const grid =
        document.getElementById(
            'mini-chart-grid'
        );

    grid.innerHTML = '';

    const widgets =
        filterWidgets(
            miniChartConfig.widgets
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

    const wrapper =
        document.createElement('div');

    wrapper.className =
        'tradingview-widget-container';

    wrapper.style.height =
        '220px';

    wrapper.style.width =
        '100%';

    const inner =
        document.createElement('div');

    inner.className =
        'tradingview-widget-container__widget';

    wrapper.appendChild(inner);

    const script =
        document.createElement('script');

    script.type =
        'text/javascript';

    script.src =
        'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';

    script.async = true;

    script.innerHTML =
        JSON.stringify({

            symbol: widget.symbol,

            width: "100%",

            // height: 220,
            height: 150,

            locale: "en",

            // dateRange: "12M",
            dateRange: "6M",

            colorTheme: "dark",

            isTransparent: false,

            autosize: true
            // ,

            // largeChartUrl: "./index.html"
        });

    wrapper.appendChild(script);

    container.appendChild(wrapper);
}

loadMiniCharts();