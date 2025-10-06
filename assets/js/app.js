

// --- Drawer móvil accesible ---
(function () {
  const btn = document.querySelector(".hamburger");
  const drawer = document.getElementById("drawer");
  const overlay = document.querySelector(".drawer-overlay");
  const closeBtn = document.querySelector(".drawer-close");
  if (!btn || !drawer || !overlay || !closeBtn) return;

  function openDrawer() {
    drawer.classList.add("open");
    overlay.classList.add("show");
    document.body.classList.add("drawer-lock");
    btn.setAttribute("aria-expanded", "true");
    drawer.setAttribute("aria-hidden", "false");
    // focus primer link
    const firstLink = drawer.querySelector(
      'a,button,[tabindex]:not([tabindex="-1"])'
    );
    firstLink && firstLink.focus();
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    overlay.classList.remove("show");
    document.body.classList.remove("drawer-lock");
    btn.setAttribute("aria-expanded", "false");
    drawer.setAttribute("aria-hidden", "true");
    btn.focus();
  }

  btn.addEventListener("click", openDrawer);
  overlay.addEventListener("click", closeDrawer);
  closeBtn.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });
})();
