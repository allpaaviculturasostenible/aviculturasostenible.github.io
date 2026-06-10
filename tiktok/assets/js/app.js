
const DATA_PATHS = {
  categorias: "data/categorias.json",
  ideas: "data/ideas-videos.json",
  metricas: "data/metricas-videos.json",
  aprendizajes: "data/aprendizajes.json"
};

let categorias = {};
let ideas = [];
let metricas = [];
let aprendizajes = [];
let currentView = "cards";

const byId = (arr, id) => (arr || []).find(x => x.id === id) || {};
const cat = (group, id) => byId(categorias[group], id).nombre || id || "";

async function loadData(){
  const [c,i,m,a] = await Promise.all([
    fetch(DATA_PATHS.categorias).then(r=>r.json()),
    fetch(DATA_PATHS.ideas).then(r=>r.json()),
    fetch(DATA_PATHS.metricas).then(r=>r.json()),
    fetch(DATA_PATHS.aprendizajes).then(r=>r.json())
  ]);
  categorias = c;
  ideas = JSON.parse(localStorage.getItem("allpa_ideas_override_v2") || JSON.stringify(i));
  metricas = JSON.parse(localStorage.getItem("allpa_metricas_override_v2") || JSON.stringify(m));
  aprendizajes = JSON.parse(localStorage.getItem("allpa_aprendizajes_override_v2") || JSON.stringify(a));
  initFilters();
  render();
}

function initFilters(){
  fillSelect("dream", categorias.dream_outcomes);
  fillSelect("story", categorias.historia_allpa);
  fillSelect("persuasion", categorias.persuasion);
  fillSelect("product", categorias.productos_allpa);
  categorias.estados.forEach(e => addOption(document.getElementById("status"), e, e));
  ["search","dream","story","persuasion","product","status"].forEach(id=>document.getElementById(id).addEventListener("input", render));
  document.getElementById("importFile").addEventListener("change", importData);
}

function fillSelect(id, arr){ arr.forEach(x => addOption(document.getElementById(id), x.id, x.nombre)); }
function addOption(el, value, label){ const o=document.createElement("option"); o.value=value; o.textContent=label; el.appendChild(o); }

function saveLocal(){ 
  localStorage.setItem("allpa_ideas_override_v2", JSON.stringify(ideas)); 
  localStorage.setItem("allpa_metricas_override_v2", JSON.stringify(metricas)); 
  localStorage.setItem("allpa_aprendizajes_override_v2", JSON.stringify(aprendizajes)); 
  updateKpis(); 
}

function filtered(){
 const q=document.getElementById("search").value.toLowerCase();
 const d=dream.value, s=story.value, p=persuasion.value, prod=product.value, st=status.value;
 return ideas.filter(i=>
  (!q || JSON.stringify(i).toLowerCase().includes(q)) &&
  (!d || i.dream_outcome_id===d) &&
  (!s || i.historia_id===s) &&
  (!p || i.persuasion_id===p) &&
  (!prod || i.producto_id===prod) &&
  (!st || i.estado===st)
 );
}

function setView(v,btn){ currentView=v; document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active")); btn.classList.add("active"); render(); }

function render(){
 const data=filtered(), c=document.getElementById("content");
 if(currentView==="cards") c.innerHTML=`<div class="grid">${data.map(card).join("")}</div>`;
 if(currentView==="calendar") c.innerHTML=calendar(data);
 if(currentView==="recording") c.innerHTML=recordingList(data);
 if(currentView==="strategy") c.innerHTML=strategy();
 if(currentView==="learning") c.innerHTML=learning();
 updateKpis();
}

function card(i){
 return `<div class="idea" onclick="detail(${i.id})">
 <div class="small">Semana ${i.semana} · ${i.dia} · Video ${i.id}</div>
 <h3>${i.titulo}</h3>
 <div class="badges"><span class="badge green">${cat("dream_outcomes", i.dream_outcome_id)}</span><span class="badge gold">${cat("persuasion", i.persuasion_id)}</span><span class="badge blue">${i.estado}</span></div>
 <p class="small">${cat("historia_allpa", i.historia_id)} · ${cat("productos_allpa", i.producto_id)}</p>
 <p class="small"><b>Hook:</b> ${i.guion.hook}</p>
 </div>`;
}

function calendar(data){
 let rows=data.map(i=>`<tr onclick="detail(${i.id})"><td>${i.semana}</td><td>${i.dia}</td><td>${i.titulo}</td><td>${cat("dream_outcomes", i.dream_outcome_id)}</td><td>${cat("productos_allpa", i.producto_id)}</td><td>${i.estado}</td></tr>`).join("");
 return `<table><thead><tr><th>Semana</th><th>Día</th><th>Idea</th><th>Dream Outcome</th><th>Producto</th><th>Estado</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function recordingList(data){
 let rows=data.map(i=>`<tr onclick="detail(${i.id})"><td class="nowrap">#${i.id}</td><td><b>${i.guion.hook}</b><br><span class="small">${i.guion.duracion_objetivo}</span></td><td>${i.guion.cta}</td><td>${i.estado}</td></tr>`).join("");
 return `<h2>Modo grabación</h2><p>Usa esta vista para escoger videos listos y grabarlos en bloque. Entra a cada fila para editar el texto hablado, las tomas y el CTA.</p><table><thead><tr><th>ID</th><th>Hook</th><th>CTA</th><th>Estado</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function strategy(){
 const group = (groupKey, field) => categorias[groupKey].map(x=>`<li><b>${x.nombre}</b>: ${ideas.filter(i=>i[field]===x.id).length} ideas</li>`).join("");
 return `<h2>Mapa estratégico</h2><p>Los guiones conectan el deseo del productor, la historia de Stiven, el producto Allpa y un principio de persuasión.</p>
 <div class="detail"><div><h3>Dream Outcomes</h3><ul>${group("dream_outcomes","dream_outcome_id")}</ul></div>
 <div><h3>Productos Allpa</h3><ul>${group("productos_allpa","producto_id")}</ul></div></div>
 <h3>Principios persuasivos</h3><ul>${group("persuasion","persuasion_id")}</ul>`;
}

function learning(){
 return `<h2>Aprendizajes estratégicos</h2>
 <table><thead><tr><th>Fecha</th><th>Hallazgo</th><th>Dream</th><th>Producto</th><th>Acción</th><th>Estado</th></tr></thead>
 <tbody>${aprendizajes.map(a=>`<tr><td>${a.fecha}</td><td>${a.hallazgo}</td><td>${cat("dream_outcomes",a.dream_outcome_id)}</td><td>${cat("productos_allpa",a.producto_id)}</td><td>${a.accion_recomendada}</td><td>${a.estado}</td></tr>`).join("")}</tbody></table>`;
}

function detail(id){
 const i=ideas.find(x=>x.id===id);
 const m=metricas.find(x=>x.video_id===id) || {};
 const related=i.relacionados.map(r=>ideas.find(x=>x.id===r)).filter(Boolean).map(x=>`<button class="secondary" onclick="detail(${x.id})">#${x.id} ${x.titulo}</button>`).join(" ");
 content.innerHTML=`<button class="secondary" onclick="render()">← Volver</button>
 <div class="detail"><section>
 <div class="box">
 <h2>Video ${i.id}: ${i.titulo}</h2>
 <div class="badges"><span class="badge green">${cat("dream_outcomes", i.dream_outcome_id)}</span><span class="badge gold">${cat("persuasion", i.persuasion_id)}</span><span class="badge blue">${cat("productos_allpa", i.producto_id)}</span></div>
 <label>Estado</label><select onchange="updateIdea(${i.id},'estado',this.value)">${categorias.estados.map(s=>`<option ${i.estado===s?"selected":""}>${s}</option>`).join("")}</select>
 <label>Fecha planeada</label><input value="${i.fecha_planeada||""}" onchange="updateIdea(${i.id},'fecha_planeada',this.value)">
 <label>Notas de producción</label><textarea class="textarea-small" onchange="updateIdea(${i.id},'notas',this.value)">${i.notas||""}</textarea>
 </div>

 <div class="box">
 <h3>Guion editable</h3>
 ${scriptField(i.id,"hook","Hook inicial",i.guion.hook,"textarea-small")}
 ${scriptField(i.id,"guion_corto","Guion corto para grabar rápido",i.guion.guion_corto,"script")}
 ${scriptField(i.id,"texto_hablado","Texto hablado completo",i.guion.texto_hablado,"script")}
 ${scriptField(i.id,"tomas_sugeridas","Tomas sugeridas",i.guion.tomas_sugeridas,"textarea-small")}
 ${scriptField(i.id,"texto_en_pantalla","Texto en pantalla",i.guion.texto_en_pantalla,"textarea-small")}
 ${scriptField(i.id,"cta","Llamado a la acción",i.guion.cta,"textarea-small")}
 <label>Duración objetivo</label><select onchange="updateScript(${i.id},'duracion_objetivo',this.value)">${categorias.duraciones.map(s=>`<option ${i.guion.duracion_objetivo===s?"selected":""}>${s}</option>`).join("")}</select>
 </div>

 <h3>Ideas relacionadas</h3><div class="footer-actions">${related}</div>
 </section><section>
 <div class="scriptbox"><b>Estructura persuasiva:</b><br>1. Hook fuerte.<br>2. Dolor del productor.<br>3. Autoridad o historia de Stiven.<br>4. Mecanismo Allpa.<br>5. Resultado soñado.<br>6. CTA a comentario o WhatsApp.</div>
 <div class="box"><h3>Métricas reales</h3>
 ${metricInput(id,"fecha_publicacion","Fecha publicación",m.fecha_publicacion)}
 ${metricInput(id,"url_tiktok","URL TikTok",m.url_tiktok)}
 ${metricInput(id,"vistas","Vistas",m.vistas)}
 ${metricInput(id,"retencion_porcentaje","Retención %",m.retencion_porcentaje)}
 ${metricInput(id,"likes","Likes",m.likes)}
 ${metricInput(id,"comentarios","Comentarios",m.comentarios)}
 ${metricInput(id,"guardados","Guardados",m.guardados)}
 ${metricInput(id,"compartidos","Compartidos",m.compartidos)}
 ${metricInput(id,"leads_whatsapp","Leads WhatsApp",m.leads_whatsapp)}
 <label>Señal de venta</label><select onchange="updateMetric(${id},'senal_venta',this.value)">${["","Baja","Media","Alta"].map(s=>`<option ${m.senal_venta===s?"selected":""}>${s}</option>`).join("")}</select>
 ${metricInput(id,"observaciones","Observaciones",m.observaciones)}
 </div></section></div>`;
}

function scriptField(id,key,label,value,klass){
 return `<label>${label}</label><textarea class="${klass}" onchange="updateScript(${id},'${key}',this.value)">${value||""}</textarea>`;
}
function metricInput(id,key,label,value){ return `<label>${label}</label><input value="${value||""}" onchange="updateMetric(${id},'${key}',this.value)">`; }
function updateIdea(id,key,val){ ideas.find(i=>i.id===id)[key]=val; saveLocal(); }
function updateScript(id,key,val){ ideas.find(i=>i.id===id).guion[key]=val; if(key==="hook"){ideas.find(i=>i.id===id).titulo=val;} saveLocal(); }
function updateMetric(id,key,val){ let m=metricas.find(x=>x.video_id===id); if(!m){m={video_id:id}; metricas.push(m)}; m[key]=val; saveLocal(); }
function updateKpis(){
 kpiTotal.textContent=ideas.length;
 kpiReady.textContent=ideas.filter(i=>i.estado==="Guion listo").length;
 kpiPublished.textContent=ideas.filter(i=>["Publicado","Analizado"].includes(i.estado)).length;
 kpiLeads.textContent=metricas.reduce((a,i)=>a+(parseInt(i.leads_whatsapp)||0),0);
 kpiAnalyzed.textContent=ideas.filter(i=>i.estado==="Analizado").length;
}
function exportData(){
 const payload={ideas, metricas, aprendizajes, exported_at:new Date().toISOString()};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
 const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="allpa-video-tracking-export-v2.json"; a.click();
}
function importData(e){
 const file=e.target.files[0]; if(!file)return;
 const reader=new FileReader(); reader.onload=()=>{const data=JSON.parse(reader.result); ideas=data.ideas||ideas; metricas=data.metricas||metricas; aprendizajes=data.aprendizajes||aprendizajes; saveLocal(); render();}; reader.readAsText(file);
}
function resetLocal(){ localStorage.removeItem("allpa_ideas_override_v2"); localStorage.removeItem("allpa_metricas_override_v2"); localStorage.removeItem("allpa_aprendizajes_override_v2"); location.reload(); }

loadData();
