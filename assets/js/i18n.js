// Language switch: map equivalent routes
(function(){
  const map = {
    "/es/": "/en/",
    "/es/index.html": "/en/index.html",
    "/es/modelo-circular.html": "/en/circular-model.html",
    "/es/productos.html": "/en/products.html",
    "/es/energia.html": "/en/energy.html",
    "/es/contacto.html": "/en/contact.html"
  };
  function revMap(){
    return Object.fromEntries(Object.entries(map).map(([k,v])=>[v,k]));
  }
  function toEN(){
    const here = location.pathname;
    const t = map[here] || "/en/";
    location.href = t;
  }
  function toES(){
    const here = location.pathname;
    const r = revMap();
    const t = r[here] || "/es/";
    location.href = t;
  }
  document.addEventListener("click", (e)=>{
    const a = e.target.closest('a[data-lang]');
    if(!a) return;
    e.preventDefault();
    if(a.dataset.lang==='en') toEN(); else toES();
  });

  // Auto-detect on root only, first visit
  if(!localStorage.getItem("allpa:lang-set")){
    if(location.pathname === "/" || location.pathname === "/index.html"){
      const langs = (navigator.languages||[navigator.language]).map(x=>x.toLowerCase());
      const target = langs.some(l=>l.startsWith("en")) ? "/en/" : "/es/";
      localStorage.setItem("allpa:lang-set", "1");
      location.replace(target);
    }
  }
})();
