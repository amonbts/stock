let miniChartConfig = null;

async function loadMiniCharts() {

    const response = await fetch('./generated/dashboard.json');

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

// function renderMiniChart(
//     containerId,
//     widget
// ) {

//     const container =
//         document.getElementById(
//             containerId
//         );

//     container.innerHTML = '';

//     const miniChart =
//         document.createElement(
//             'tv-mini-chart'
//         );

//     miniChart.setAttribute(
//         'symbol',
//         widget.symbol
//     );

//     miniChart.setAttribute(
//         'time-frame',
//         '5D'
//     );
//     miniChart.setAttribute(
//         'line-chart-type',
//         'Line'
//     );
//     miniChart.setAttribute(
//         'chart-only',
//         'true'
//     );


//     // miniChart.setAttribute(
//     //     'color-theme',
//     //     'dark'
//     // );

//     // miniChart.setAttribute(
//     //     'locale',
//     //     'en'
//     // );

//     // miniChart.setAttribute(
//     //     'width',
//     //     '100%'
//     // );

//     // miniChart.setAttribute(
//     //     'height',
//     //     '220'
//     // );

//     miniChart.setAttribute(
//         'show-time-scale',
//         'true'
//     );
//     //   miniChart.setAttribute(
//     //     'large-chart-url',
//     //     './index.html'
//     //   );

//     container.appendChild(
//         miniChart
//     );
// }

function renderMiniChart(
  containerId,
  widget
) {

  const container =
    document.getElementById(
      containerId
    );

  container.innerHTML = '';

  container.style.height =
    '150px';

  const wrapper =
    document.createElement('div');

  wrapper.className =
    'tv-mini-chart-wrapper';

  const miniChart =
    document.createElement(
      'tv-mini-chart'
    );

  miniChart.setAttribute(
    'symbol',
    widget.symbol
  );

  miniChart.setAttribute(
    'time-frame',
    '5D'
  );

  miniChart.setAttribute(
    'theme',
    'dark'
  );

  miniChart.setAttribute(
    'show-time-scale',
    'true'
  );

  miniChart.setAttribute(
    'chart-only',
    'false'
  );

  wrapper.appendChild(
    miniChart
  );

  container.appendChild(
    wrapper
  );
}

loadMiniCharts();