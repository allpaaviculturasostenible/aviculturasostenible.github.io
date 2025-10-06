// Marca el link activo en el menú
function highlightActiveLink(){
  const path = location.pathname.replace(/\/index\.html$/, "/");
  document.querySelectorAll("nav a[data-match]").forEach(a=>{
    const m = a.dataset.match;
    if (path === m) a.classList.add("active");
  });
}

// Drawer móvil (hamburguesa)
function initDrawer(){
  const btn     = document.querySelector('.hamburger');
  const drawer  = document.getElementById('drawer');
  const overlay = document.querySelector('.drawer-overlay');
  const closeBtn= document.querySelector('.drawer-close');
  if(!btn || !drawer || !overlay || !closeBtn) return;

  const open = ()=>{
    drawer.classList.add('open');
    overlay.classList.add('show');
    document.body.classList.add('drawer-lock');
    btn.setAttribute('aria-expanded','true');
    drawer.setAttribute('aria-hidden','false');
    const first = drawer.querySelector('a,button,[tabindex]:not([tabindex="-1"])');
    first && first.focus();
  };
  const close = ()=>{
    drawer.classList.remove('open');
    overlay.classList.remove('show');
    document.body.classList.remove('drawer-lock');
    btn.setAttribute('aria-expanded','false');
    drawer.setAttribute('aria-hidden','true');
    btn.focus();
  };

  btn.addEventListener('click', open);
  overlay.addEventListener('click', close);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', e => { if(e.key === 'Escape') close(); });
}

// Inicializa TODO cuando los partials estén listos
function initAllpaUI(){
  highlightActiveLink();
  initDrawer();
  // si usas FAB WhatsApp y necesitas espacio:
  document.body.classList.add('has-fab');
}

// Fallback por si la página no usa inyección (o ya estaba listo)
document.addEventListener('DOMContentLoaded', initAllpaUI);
// Inicialización correcta tras inyectar partials
document.addEventListener('allpa:partials-ready', initAllpaUI);
