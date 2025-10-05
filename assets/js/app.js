// Mark active link in current language navbar
(function(){
  const path = location.pathname.replace(/\/index\.html$/, "/");
  document.querySelectorAll("nav a[data-match]").forEach(a=>{
    const m=a.dataset.match;
    if (path === m) a.classList.add("active");
  });
})();
