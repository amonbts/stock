let selectedGroups = new Set();

let searchQuery = '';

async function loadFilters(config) {

    const response =
        await fetch('./partials/filters.html');

    const html =
        await response.text();

    const container =
        document.getElementById(
            'filters-container'
        );

    container.innerHTML =
        html;

    loadStateFromUrl();

    buildGroupFilters(config);

    setupSearch();

    syncUiWithState();
}

function buildGroupFilters(config) {

    const container =
        document.getElementById(
            'group-filters'
        );

    config.groups.forEach(group => {

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

            updateUrlState();

            renderWidgets();
        });
    });

    addControlButtons(config, container);
}

function addControlButtons(config, container) {

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

            config.groups.forEach(group => {

                selectedGroups.add(group);

                document.getElementById(
                    `group-${group}`
                ).checked = true;
            });

            updateUrlState();

            renderWidgets();
        });

    document
        .getElementById('clear-all-btn')
        .addEventListener('click', () => {

            selectedGroups.clear();

            config.groups.forEach(group => {

                document.getElementById(
                    `group-${group}`
                ).checked = false;
            });

            updateUrlState();

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
        document.getElementById(
            'search-input'
        );

    const debouncedSearch =
        debounce((value) => {

            searchQuery =
                value.trim().toLowerCase();

            updateUrlState();

            renderWidgets();

        }, 200);

    input.addEventListener('input', (e) => {

        debouncedSearch(e.target.value);
    });
}

function filterWidgets(widgets) {

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

    return widgets;
}

function updateUrlState() {

    const params =
        new URLSearchParams();

    if (selectedGroups.size > 0) {

        params.set(
            'groups',
            [...selectedGroups].join(',')
        );
    }

    if (searchQuery.length > 0) {

        params.set(
            'search',
            searchQuery
        );
    }

    const queryString =
        params.toString();

    const newUrl =
        queryString.length > 0
            ? `${window.location.pathname}?${queryString}`
            : window.location.pathname;

    window.history.replaceState(
        {},
        '',
        newUrl
    );
}

function loadStateFromUrl() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    //
    // GROUPS
    //

    const groups =
        params.get('groups');

    if (groups) {

        groups
            .split(',')
            .forEach(group => {

                selectedGroups.add(group);
            });
    }

    //
    // SEARCH
    //

    const search =
        params.get('search');

    if (search) {

        searchQuery =
            search.toLowerCase();
    }
}

function syncUiWithState() {

    //
    // CHECKBOXES
    //

    selectedGroups.forEach(group => {

        const checkbox =
            document.getElementById(
                `group-${group}`
            );

        if (checkbox) {

            checkbox.checked = true;
        }
    });

    //
    // SEARCH INPUT
    //

    const searchInput =
        document.getElementById(
            'search-input'
        );

    if (searchInput) {

        searchInput.value =
            searchQuery;
    }
}