(function(){
  // ===== Utilidades =====
  const $ = (sel)=>document.querySelector(sel);
  const nowIso = ()=>new Date().toISOString();
  const todayKey = ()=>new Date().toISOString().slice(0,10);
  function lerp(a,b,t){return a+(b-a)*t}
  function piecewiseLinear(age, points){
    if(age<=points[0][0]) return points[0][1];
    if(age>=points[points.length-1][0]) return points[points.length-1][1];
    for(let i=0;i<points.length-1;i++){
      const [ax,ay]=points[i], [bx,by]=points[i+1];
      if(age>=ax && age<=bx){ const t=(age-ax)/(bx-ax); return lerp(ay,by,t); }
    }
    return points[points.length-1][1];
  }
  function hashCode(str){let h=0;for(let i=0;i<str.length;i++){h=((h<<5)-h)+str.charCodeAt(i);h|=0}return h}
  function formatG(v){return `${Math.round(v)} g`}
  function formatKg(v){return `${(v/1000).toFixed(2)} kg`}

  // ===== Datos base =====
  const LS_KEY = 'allpa_calc_raciones_html_v1';
  const WEIGHT = [[1,42],[7,180],[14,450],[21,900],[28,1500],[35,2200],[42,2900],[56,3600]];
  const INTAKE = [[1,12],[2,18],[5,30],[7,40],[14,75],[21,110],[28,150],[35,180],[42,200],[56,225]];
  const TIPS = [
    'Mantén el agua entre 18–22 °C y limpia: el agua sucia baja el consumo.',
    'Revisa la cama: humedad ideal 20–25%. Si huele a amoníaco, ventila.',
    'Altura del comedero: a nivel del dorso del pollo para evitar desperdicio.',
    'Evalúa temperatura del galpón por comportamiento, no solo por termómetro.',
    'Pesa 10 aves al azar para validar el promedio de peso.',
    'Registra mortalidad y causas para detectar patrones tempranos.',
  ];

  function feedStage(age){
    if(age<=7) return 'Preiniciador (días 1–7)';
    if(age<=21) return 'Iniciador (días 8–21)';
    if(age<=35) return 'Crecimiento (días 22–35)';
    return 'Finalizador (días 36–56)';
  }

  function scheduleForAge(age){
    if(age<=2) return {mode:'adlib', summary:'Días 1–2: alimentación a voluntad (24/7)', details:['Comederos siempre llenos y accesibles.']};
    if(age<=5) return {mode:'six', summary:'Días 3–5: 6 raciones pequeñas para estimular consumo', details:['6:00','9:00','12:00','15:00','17:00','19:00']};
    return {mode:'two', summary:'Desde día 6: 2 raciones (mañana y tarde)', details:['6:00 (Ración 1)','17:00 (Ración 2)']};
  }

  // ===== Estado (inputs) =====
  const breedEl = $('#breed');
  const countEl = $('#count');
  const ageEl = $('#age');
  const ageLabel = $('#ageLabel');
  const noteEl = $('#note');

  // ===== UI de salida =====
  const statWeight = $('#statWeight');
  const statIntake = $('#statIntake');
  const statTotal  = $('#statTotal');
  const scheduleSummary = $('#scheduleSummary');
  const scheduleTableWrap = $('#scheduleTableWrap');
  const feedStageEl = $('#feedStage');
  const tipEl = $('#tip');
  const progressBar = $('#progressBar');
  const progressText = $('#progressText');
  const lastSaveText = $('#lastSaveText');
  const streakEl = $('#streak');

  // Ayer
  const yWrap = $('#yesterdayWrap');
  const yDate = $('#yesterdayDate');
  const yAge = $('#yAge');
  const yWeight = $('#yWeight');
  const yIntake = $('#yIntake');
  const yTotal = $('#yTotal');

  // Guardados
  const savedWrap = $('#savedWrap');
  const savedSelect = $('#savedSelect');

  // Botones
  const btnSave = $('#btnSave');
  const btnShare = $('#btnShare');

  // ===== Store helpers =====
  function loadStore(){
    try{ return JSON.parse(localStorage.getItem(LS_KEY)) || {records:{},streak:0,lastSave:null,visits:[]} }catch{return {records:{},streak:0,lastSave:null,visits:[]}}
  }
  function saveStore(data){ localStorage.setItem(LS_KEY, JSON.stringify(data)); }

  // ===== Inicialización =====
  function initFromURL(){
    const p = new URLSearchParams(location.search);
    const b = p.get('breed'); const c = p.get('count'); const a = p.get('age'); const n = p.get('note');
    if(b) breedEl.value = b;
    if(c && !isNaN(parseInt(c))) countEl.value = parseInt(c);
    if(a && !isNaN(parseInt(a))) { ageEl.value = Math.max(1,Math.min(56,parseInt(a))); ageLabel.textContent = ageEl.value; }
    if(n) noteEl.value = n;
  }

  function refreshSavedList(store){
    const keys = Object.keys(store.records).sort().reverse();
    if(keys.length===0){ savedWrap.classList.add('hidden'); return; }
    savedWrap.classList.remove('hidden');
    savedSelect.innerHTML = '<option value="">Selecciona…</option>' + keys.map(k=>{
      const r = store.records[k];
      return `<option value="${k}">${r.date} · Edad ${r.age}d · ${r.count} aves</option>`;
    }).join('');
  }

  function loadYesterday(store){
    const d = new Date(); d.setDate(d.getDate()-1); const yKey = d.toISOString().slice(0,10);
    const r = store.records[yKey];
    if(!r){ yWrap.classList.add('hidden'); return; }
    yWrap.classList.remove('hidden');
    yDate.textContent = r.date; yAge.textContent = r.age; yWeight.textContent = r.expectedWeightG; yIntake.textContent = r.intakePerBirdG; yTotal.textContent = Number(r.totalIntakeKg).toFixed(2);
  }

  function tipOfDay(){ const list=TIPS; const idx=Math.abs(hashCode(todayKey()))%list.length; return list[idx]; }

  function recalc(){
    const age = parseInt(ageEl.value || '1');
    const count = parseInt(countEl.value || '0');
    const intake = Math.round(piecewiseLinear(age, INTAKE));
    const weight = Math.round(piecewiseLinear(age, WEIGHT));
    const totalKg = (intake*count)/1000;

    statWeight.textContent = weight.toLocaleString('es-CO')+ ' g';
    statIntake.textContent = intake.toLocaleString('es-CO')+ ' g';
    statTotal.textContent = totalKg.toFixed(2) + ' kg';

    const sch = scheduleForAge(age);
    scheduleSummary.textContent = sch.summary;
    if(sch.mode==='adlib'){
      scheduleTableWrap.innerHTML = '<div class="text-xs">Asegura comederos disponibles las 24 horas. Cambia el alimento frecuentemente para mantenerlo fresco.</div>';
    } else {
      let rows='';
      if(sch.mode==='six'){
        const per = intake/6;
        rows = sch.details.map(d=>`<tr><td>${d}</td><td>${formatG(per)}</td><td>${formatKg(per*count)}</td></tr>`).join('');
      } else {
        const r1 = Math.round(intake*0.6), r2 = intake - r1;
        rows = `<tr><td>${sch.details[0]}</td><td>${formatG(r1)}</td><td>${formatKg(r1*count)}</td></tr>`+
               `<tr><td>${sch.details[1]}</td><td>${formatG(r2)}</td><td>${formatKg(r2*count)}</td></tr>`;
      }
      scheduleTableWrap.innerHTML = `<table><thead><tr><th>Ración</th><th>g/ave</th><th>kg total</th></tr></thead><tbody>${rows}</tbody></table>`;
    }

    feedStageEl.textContent = feedStage(age);
    tipEl.textContent = '💡 ' + tipOfDay();
    const pct = (age/56)*100; $('#progressBar').style.width = pct+'%';
    progressText.textContent = `Día ${age} de 56`;
  }

  function updateStreakAndVisits(store, action){
    store.visits = Array.isArray(store.visits)?store.visits:[];
    store.visits.push({at:nowIso(), action});
    saveStore(store);
  }

  function saveToday(){
    const store = loadStore();
    const key = todayKey();
    const age = parseInt(ageEl.value||'1');
    const count = parseInt(countEl.value||'0');
    const intake = Math.round(piecewiseLinear(age, INTAKE));
    const weight = Math.round(piecewiseLinear(age, WEIGHT));
    const totalKg = (intake*count)/1000;
    const sch = scheduleForAge(age);

    // streak
    let newStreak = store.streak || 0;
    const prev = store.lastSave;
    if(prev === key) newStreak = store.streak || 1; else {
      if(prev){
        const prevDate = new Date(prev); const y = new Date(key); y.setDate(y.getDate()-1);
        if(prevDate.toISOString().slice(0,10) === y.toISOString().slice(0,10)) newStreak = (store.streak||0)+1; else newStreak = 1;
      } else newStreak = 1;
    }

    store.records[key] = {
      date:key,
      savedAt: nowIso(),
      breed:breedEl.value,
      count,
      age,
      intakePerBirdG:intake,
      expectedWeightG:weight,
      totalIntakeKg: totalKg,
      stage: feedStage(age),
      schedule: sch,
      note: noteEl.value,
      rations: [] // se calcula al vuelo, no necesario guardar desglose
    };
    store.streak = newStreak; store.lastSave = key;
    updateStreakAndVisits(store, 'save');

    streakEl.textContent = newStreak;
    lastSaveText.textContent = 'Último guardado: ' + key;
    refreshSavedList(store);
    loadYesterday(store);
    alert('✅ Registro guardado. ¡Sigue tu racha diaria!');
  }

  function loadSaved(key){
    const store = loadStore(); const rec = store.records[key]; if(!rec) return;
    savedSelect.value = key;
    breedEl.value = rec.breed; countEl.value = rec.count; ageEl.value = rec.age; ageLabel.textContent = rec.age; noteEl.value = rec.note||'';
    recalc();
  }

  function buildShareUrl(){
    const base = location.origin + location.pathname;
    const p = new URLSearchParams();
    p.set('breed', breedEl.value);
    p.set('count', String(parseInt(countEl.value||'0')));
    p.set('age', String(parseInt(ageEl.value||'1')));
    if(noteEl.value) p.set('note', noteEl.value);
    return `${base}?${p.toString()}`;
  }

  async function share(){
    const url = buildShareUrl();
    try{
      if(navigator.share){ await navigator.share({title:'Allpa · Calculadora de raciones', text:'Consulta de raciones precargada', url}); }
      else { await navigator.clipboard.writeText(url); alert('🔗 Enlace copiado al portapapeles'); }
    }catch(e){ /* cancel */ }
  }

  // ===== Eventos =====
  ['input','change'].forEach(evt=>{
    ageEl.addEventListener(evt,()=>{ ageLabel.textContent = ageEl.value; recalc(); });
    countEl.addEventListener(evt,recalc);
    breedEl.addEventListener(evt,recalc);
    noteEl.addEventListener(evt,()=>{/* solo edición */});
  });
  btnSave.addEventListener('click', saveToday);
  btnShare.addEventListener('click', share);
  savedSelect.addEventListener('change', (e)=>{ if(savedSelect.value) loadSaved(savedSelect.value); });

  // ===== Arranque =====
  (function start(){
    const store = loadStore();
    // visita
    updateStreakAndVisits(store, 'visit');
    // precargar URL
    initFromURL();
    // nota del día si existe
    if(store.records[todayKey()] && store.records[todayKey()].note){ noteEl.value = store.records[todayKey()].note; }
    // UI
    streakEl.textContent = store.streak||0; lastSaveText.textContent = 'Último guardado: '+(store.lastSave||'—');
    refreshSavedList(store);
    loadYesterday(store);
    // cálculo inicial
    recalc();
  })();
})();

