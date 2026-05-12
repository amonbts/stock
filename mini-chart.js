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
                <div class="card-body p-2">
                    <div
                        id="${widgetId}"
                        class="mini-chart-widget">
                    </div>
                </div>
            </div>`;

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

    wrapper.style.height = '220px';

    wrapper.style.width = '100%';

    const inner =
        document.createElement('div');

    inner.className =
        'tradingview-widget-container__widget';

    wrapper.appendChild(inner);

    const script =
        document.createElement('script');

    script.type = 'text/javascript';

    script.src =
        'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';

    script.async = true;

    script.innerHTML = JSON.stringify({

        symbol: widget.symbol,

        width: "100%",

        height: 220,

        locale: "en",

        dateRange: "12M",

        colorTheme: "dark",

        trendLineColor: "#37a6ef",

        underLineColor:
            "rgba(55, 166, 239, 0.15)",

        underLineBottomColor:
            "rgba(55, 166, 239, 0)",

        isTransparent: false,

        autosize: true,

        largeChartUrl: ""
    });

    wrapper.appendChild(script);

    container.appendChild(wrapper);
}

loadMiniCharts();