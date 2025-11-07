/*!
 * ALLPA Magnetic Footer v1.0
 * Reusable CTA footer with overlay — no external deps (Tailwind optional).
 * Author: Allpa · MIT License
 */

(function(){
  // ---- CONFIG DEFAULTS ------------------------------------------------------
  const DEFAULTS = {
    lang: 'auto',               // 'auto' | 'es' | 'en'
    tiktokUser: 'stiven9708', // tu @ sin @ (solo el uniqueId)
    tiktokWeb:  'https://www.tiktok.com/@stiven9708',
    nequiNumber: '3152112644',
    nequiName:   'ALLPA Agricultura 4.0',
    primaryColor: '#2c6e2f',    // verde Allpa
    secondaryColor: '#e6f3e6',  // verde claro
    delayMs: 2000,              // espera antes de mostrar barra
    ttlHours: 24,               // no mostrar de nuevo tras cerrar
    autoShow: true,             // mostrar automáticamente
    zIndex: 60_000,             // sobre todo
    i18n: {
      es: {
        follow: 'Síguenos en TikTok',
        donate: 'Donaciones',
        tiktok_title: 'Aprende avicultura circular en 60s',
        tiktok_sub: 'Tips prácticos, manejo y alimentación semana a semana.',
        tiktok_btn: 'Seguir en TikTok',
        donate_title: 'Ayúdanos a crear más herramientas gratuitas',
        donate_sub: 'Tu aporte impulsa calculadoras y guías para pequeños productores.',
        donate_copy: 'Copiar número',
        donate_shared: 'Compartir esta herramienta',
        copied: 'Número copiado ✅',
        close: 'Cerrar',
        nequi_label: 'Nequi',
      },
      en: {
        follow: 'Follow us on TikTok',
        donate: 'Support us',
        tiktok_title: 'Learn circular poultry in 60s',
        tiktok_sub: 'Practical tips, management and feeding week by week.',
        tiktok_btn: 'Follow on TikTok',
        donate_title: 'Help us build more free tools',
        donate_sub: 'Your support powers calculators and guides for small farmers.',
        donate_copy: 'Copy number',
        donate_shared: 'Share this tool',
        copied: 'Number copied ✅',
        close: 'Close',
        nequi_label: 'Nequi',
      }
    }
  };

  // ---- PUBLIC API -----------------------------------------------------------
  const API = {
    mount(userCfg = {}){ init(userCfg); },
    show(){ toggleBar(true); },
    hide(){ toggleBar(false); },
    open(panel='tiktok'){ openOverlay(panel); },
    close(){ closeOverlay(); }
  };
  window.AllpaFooter = API;

  // ---- INTERNAL STATE -------------------------------------------------------
  let cfg, root, bar, overlay, tiktokBtn, donateBtn, closeBtn, copyBtn, shareBtn, toast;
  let lang, texts;
  const LS_KEY = 'allpa_footer_closed_at';

  // ---- INIT -----------------------------------------------------------------
  function init(userCfg){
    cfg = deepMerge(DEFAULTS, userCfg||{});
    lang = (cfg.lang==='auto' ? (navigator.language||'es').slice(0,2) : cfg.lang);
    texts = cfg.i18n[lang] || cfg.i18n.es;

    injectStyles();
    injectHTML();
    wireEvents();

    if(cfg.autoShow && !recentlyClosed()){
      setTimeout(()=> toggleBar(true), cfg.delayMs);
    }
  }

  function deepMerge(a,b){
    const out = {...a};
    for(const k in b){
      if(b[k] && typeof b[k]==='object' && !Array.isArray(b[k])){
        out[k] = deepMerge(a[k]||{}, b[k]);
      }else out[k]=b[k];
    }
    return out;
  }

  // ---- UI: STYLES -----------------------------------------------------------
  function injectStyles(){
    const css = `
      .af-hide{display:none!important}
      .af-root{position:fixed;inset:auto 0 calc(env(safe-area-inset-bottom,0) + 0px) 0;z-index:${cfg.zIndex};}
      .af-bar{margin:0 auto;max-width:1100px;display:flex;gap:.5rem;align-items:center;justify-content:center;
        padding:.5rem .75rem; backdrop-filter: saturate(140%) blur(10px);
        background: rgba(255,255,255,.8); border: 1px solid rgba(0,0,0,.06);
        border-radius: .75rem .75rem 0 0; box-shadow: 0 -6px 20px rgba(0,0,0,.08);
        transform: translateY(110%); transition: transform .22s ease, opacity .22s ease; opacity:0;
      }
      .af-bar.af-on{transform: translateY(0); opacity:1;}
      .af-btn{display:inline-flex;gap:.5rem;align-items:center;justify-content:center;
        padding:.65rem .9rem;border-radius:.65rem;font-weight:600;line-height:1;border:1px solid transparent;cursor:pointer;
        transition: transform .08s ease, background .18s ease, box-shadow .18s ease;
        white-space:nowrap; user-select:none;
      }
      .af-btn:active{transform: translateY(1px)}
      .af-btn-primary{background:${cfg.primaryColor};color:#fff;box-shadow:0 4px 14px rgba(44,110,47,.18)}
      .af-btn-primary:hover{filter:brightness(.98)}
      .af-btn-secondary{background:${cfg.secondaryColor};color:${cfg.primaryColor}; border-color:${cfg.primaryColor}22;}
      .af-icon{width:18px;height:18px}
      .af-overlay{position:fixed;inset:0;z-index:${cfg.zIndex+1};background:rgba(0,0,0,.35);backdrop-filter: blur(6px);
        display:grid;place-items:center;opacity:0;pointer-events:none;transition:opacity .2s ease}
      .af-overlay.af-open{opacity:1;pointer-events:auto}
      .af-card{width:min(920px,92vw);background:#fff;border-radius:14px;border:1px solid rgba(0,0,0,.06);
        box-shadow:0 20px 70px rgba(0,0,0,.18); padding:16px}
      .af-card-grid{display:grid;grid-template-columns:1fr;gap:14px}
      @media(min-width:820px){ .af-card-grid{grid-template-columns:1fr 1fr} }
      .af-card-sec{border:1px solid rgba(0,0,0,.06);border-radius:12px;padding:16px}
      .af-card h3{margin:0 0 4px 0;font-size:1.1rem;color:${cfg.primaryColor}}
      .af-sub{color:#555;margin:0 0 12px 0;font-size:.9rem}
      .af-actions{display:flex;gap:.5rem;flex-wrap:wrap}
      .af-chip{display:inline-flex;align-items:center;gap:.35rem;font-weight:600;background:#f5faf5;color:${cfg.primaryColor};
        border:1px solid ${cfg.primaryColor}22;border-radius:999px;padding:.2rem .55rem;font-size:.78rem}
      .af-close{position:absolute;top:10px;right:10px;background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:10px;
        width:38px;height:38px;display:grid;place-items:center;cursor:pointer}
      .af-toast{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#111;color:#fff;border-radius:8px;
        padding:8px 12px;font-size:.85rem;opacity:0;pointer-events:none;transition:opacity .2s ease}
      .af-toast.af-on{opacity:1}
      .af-num{font-family: ui-monospace,SFMono-Regular,Menlo,monospace; font-weight:600}
      .af-mini{font-size:.78rem;color:#666}
    `;
    const style = document.createElement('style');
    style.id = 'allpa-footer-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ---- UI: HTML -------------------------------------------------------------
  function svgTikTok(){ return `<svg class="af-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 3c1 2 2 3 4 4v3c-1 0-3-1-4-2v6a6 6 0 11-6-6c.3 0 .7 0 1 .1v3c-.3-.1-.6-.1-1-.1a3 3 0 103 3V3h3z"/></svg>`}
  function svgHeart(){ return `<svg class="af-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7-4.6-9.3-8.2C.7 9.3 2.2 5.5 6 5.1c2-.2 3.4.9 4 1.7.6-.8 2-1.9 4-1.7 3.8.4 5.3 4.2 3.3 7.7C19 16.4 12 21 12 21z"/></svg>`}
  function svgClose(){ return `<svg class="af-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z"/></svg>`}
  function svgShare(){ return `<svg class="af-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8a3 3 0 10-2.8-4H15a3 3 0 10.2 6A3 3 0 0018 8zM9 13a3 3 0 10-2.8 4H6a3 3 0 10.2-6A3 3 0 009 13zm9 3a3 3 0 100 6 3 3 0 000-6zM8.8 12.3l6.5-3.2.4.9-6.5 3.2-.4-.9zm.4 1l6.5 3.2-.4.9-6.5-3.2.4-.9z"/></svg>`}
  function svgCopy(){ return `<svg class="af-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H6a2 2 0 00-2 2v12h2V3h10V1zm3 4H10a2 2 0 00-2 2v14a2 2 0 002 2h9a2 2 0 002-2V7a2 2 0 00-2-2zm0 16H10V7h9v14z"/></svg>`}

  function injectHTML(){
    root = document.createElement('div');
    root.className = 'af-root';

    root.innerHTML = `
      <div class="af-bar" role="region" aria-label="Allpa CTA footer">
        <button class="af-btn af-btn-primary" id="af-follow">${svgTikTok()}<span>${texts.follow}</span></button>
        <button class="af-btn af-btn-secondary" id="af-donate">${svgHeart()}<span>${texts.donate}</span></button>
      </div>

      <div class="af-overlay" id="af-overlay" role="dialog" aria-modal="true" aria-label="Allpa CTA">
        <div class="af-card">
          <button class="af-close" id="af-close" aria-label="${texts.close}">${svgClose()}</button>
          <div class="af-card-grid">
            <section class="af-card-sec" id="af-sec-tiktok">
              <h3>${texts.tiktok_title}</h3>
              <p class="af-sub">${texts.tiktok_sub}</p>
              <div class="af-actions">
                <a class="af-btn af-btn-primary" id="af-open-tiktok">${svgTikTok()}<span>${texts.tiktok_btn}</span></a>
                <span class="af-chip">@${cfg.tiktokUser}</span>
              </div>
              <p class="af-mini" style="margin-top:.5rem">Tip: abre la app si la tienes instalada para seguirnos de inmediato.</p>
            </section>

            <section class="af-card-sec" id="af-sec-donate">
              <h3>${texts.donate_title}</h3>
              <p class="af-sub">${texts.donate_sub}</p>
              <div style="margin:.25rem 0 .5rem 0"><strong>${texts.nequi_label}:</strong> <span class="af-num" id="af-nequi">${cfg.nequiNumber}</span> — ${cfg.nequiName}</div>
              <div class="af-actions">
                <button class="af-btn af-btn-secondary" id="af-copy">${svgCopy()}<span>${texts.donate_copy}</span></button>
                <button class="af-btn af-btn-secondary" id="af-share">${svgShare()}<span>${texts.donate_shared}</span></button>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div class="af-toast" id="af-toast">${texts.copied}</div>
    `;
    document.body.appendChild(root);

    bar       = root.querySelector('.af-bar');
    overlay   = root.querySelector('#af-overlay');
    tiktokBtn = root.querySelector('#af-follow');
    donateBtn = root.querySelector('#af-donate');
    closeBtn  = root.querySelector('#af-close');
    copyBtn   = root.querySelector('#af-copy');
    shareBtn  = root.querySelector('#af-share');
    toast     = root.querySelector('#af-toast');
  }

  // ---- EVENTS ---------------------------------------------------------------
  function wireEvents(){
    tiktokBtn.addEventListener('click', ()=> openOverlay('tiktok'));
    donateBtn.addEventListener('click', ()=> openOverlay('donate'));
    closeBtn.addEventListener('click', closeOverlay);

    root.querySelector('#af-open-tiktok').addEventListener('click', (e)=>{
      e.preventDefault();
      fire('allpa:cta_open', {panel:'tiktok', lang});
      const deep = `tiktok://user?uniqueId=${encodeURIComponent(cfg.tiktokUser)}`;
      const web  = cfg.tiktokWeb || `https://www.tiktok.com/@${encodeURIComponent(cfg.tiktokUser)}`;
      // Try deep link, then fallback
      const a = document.createElement('a');
      a.href = deep;
      document.body.appendChild(a);
      a.click();
      setTimeout(()=>{ window.open(web, '_blank'); }, 300);
    });

    copyBtn.addEventListener('click', async ()=>{
      try{
        await navigator.clipboard.writeText(cfg.nequiNumber);
        fire('allpa:copy_nequi', {number: cfg.nequiNumber});
        toastOn();
      }catch{
        // fallback
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNode(root.querySelector('#af-nequi'));
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand('copy');
        sel.removeAllRanges();
        toastOn();
      }
    });

    shareBtn.addEventListener('click', async ()=>{
      fire('allpa:share_click', {});
      const shareData = {
        title: document.title || 'ALLPA — Avicultura Sostenible',
        text: 'Mira esta herramienta gratuita para avicultores 👇',
        url: location.href
      };
      if(navigator.share){
        try{ await navigator.share(shareData); fire('allpa:shared', {}); }catch{}
      }else{
        try{
          await navigator.clipboard.writeText(location.href);
          toastText('Enlace copiado ✅');
        }catch{
          alert('Copia este enlace:\n' + location.href);
        }
      }
    });

    overlay.addEventListener('click', (e)=>{ if(e.target===overlay) closeOverlay(); });
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeOverlay(); });

    // Ocultar barra si el teclado móvil aparece (visualViewport)
    if(window.visualViewport){
      const onResize = ()=>{
        if(window.visualViewport.height < window.innerHeight * 0.78) toggleBar(false);
      };
      window.visualViewport.addEventListener('resize', onResize);
    }
  }

  // ---- HELPERS --------------------------------------------------------------
  function toggleBar(on){
    bar.classList.toggle('af-on', !!on);
  }

  function openOverlay(panel){
    overlay.classList.add('af-open');
    document.body.style.overflow='hidden';
    fire('allpa:overlay_open', {panel});
  }
  function closeOverlay(){
    overlay.classList.remove('af-open');
    document.body.style.overflow='';
    fire('allpa:overlay_close', {});
    rememberClosed();
  }

  function toastOn(){ toast.classList.add('af-on'); setTimeout(()=> toast.classList.remove('af-on'), 1200); }
  function toastText(t){ toast.textContent=t; toastOn(); }

  function recentlyClosed(){
    try{
      const t = Number(localStorage.getItem(LS_KEY)||0);
      if(!t) return false;
      const diffH = (Date.now() - t) / 36e5;
      return diffH < cfg.ttlHours;
    }catch{ return false; }
  }
  function rememberClosed(){
    try{ localStorage.setItem(LS_KEY, String(Date.now())); }catch{}
  }

  function fire(name, detail){ document.dispatchEvent(new CustomEvent(name, {detail})); }
})();
