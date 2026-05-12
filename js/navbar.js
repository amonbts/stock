async function loadNavbar(activePage) {

  const response =
    await fetch('./partials/navbar.html');

  const html =
    await response.text();

  const navbarContainer =
    document.getElementById(
      'navbar-container'
    );

  navbarContainer.innerHTML =
    html;

  //
  // ACTIVE LINK
  //

  const activeLink =
    navbarContainer.querySelector(
      `[data-page="${activePage}"]`
    );

  if (activeLink) {

    activeLink.classList.add('active');
  }
}