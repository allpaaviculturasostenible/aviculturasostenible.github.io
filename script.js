const volumeInput = document.querySelector("#volume");
const volumeOutput = document.querySelector("#volumeOutput");
const finderForm = document.querySelector("#finderForm");
const chatWindow = document.querySelector("#chatWindow");
const resultPanel = document.querySelector("#resultPanel");
const carousel = document.querySelector("[data-carousel]");
const finderSteps = Array.from(document.querySelectorAll("[data-finder-step]"));
const finderProgress = Array.from(document.querySelectorAll(".finder-progress span"));
const stageExperience = document.querySelector("[data-stage-tabs]");
const retakeSimulator = document.querySelector("[data-retake-simulator]");
let activeFinderStep = 0;

function addSwipeNavigation(element, onPrevious, onNext) {
  if (!element || typeof onPrevious !== "function" || typeof onNext !== "function") return;

  let startX = 0;
  let startY = 0;
  let isTracking = false;
  const swipeThreshold = 48;

  element.addEventListener("pointerdown", (event) => {
    if (event.target.closest("a, button, input, label, select, summary, textarea")) return;
    startX = event.clientX;
    startY = event.clientY;
    isTracking = true;
    if (element.setPointerCapture) {
      element.setPointerCapture(event.pointerId);
    }
  });

  element.addEventListener("pointerup", (event) => {
    if (!isTracking) return;
    isTracking = false;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (Math.abs(deltaX) < swipeThreshold || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
    if (deltaX < 0) onNext();
    else onPrevious();
  });

  element.addEventListener("pointercancel", () => {
    isTracking = false;
  });
}

const finderStepMessages = {
  volume: "Primero ubicamos tu volumen. Con eso sabemos si conviene iniciar básico, emprender con equipos actualizables o pensar en Planta Inicial.",
  product: "Si ya tienes un equipo en mente, puedes cotizarlo ahora. Si no, te guío para escoger el primer paso.",
  budget: "Perfecto. Ahora miremos el presupuesto con el que quieres iniciar.",
  pain: "Dime qué parte del proceso te pesa más hoy. Desde ese dolor elegimos el equipo que más sentido tiene.",
  buy: "Ahora definimos si prefieres empezar con una opción actualizable o comprar una solución más completa.",
  payment: "Listo. Con el equipo más claro, revisemos cómo quieres avanzar con la compra.",
};

const productLinks = {
  conos: "productos/conos.html",
  conosIndividual: "productos/conos.html",
  conosBaseTres: "productos/conos.html",
  conosBaseCinco: "productos/conos.html",
  peladoraTambor: "productos/peladora-taladro.html",
  peladoraBase: "productos/peladora-taladro.html",
  kitPeladora: "productos/peladora-taladro.html",
  peladoraIndustrial: "productos/pelador.html",
  aturdidorBasico: "productos/aturdidor.html",
  aturdidorUnPollo: "productos/aturdidor.html",
  kitAturdidor: "productos/aturdidor.html",
  aturdidorIndustrial: "productos/aturdidor.html",
  escaldadorUno: "productos/escaldador.html",
  escaldadorTres: "productos/escaldador.html",
  retoma: "productos/retoma.html",
};

const productCatalog = {
  conos: {
    name: "Conos",
    status: "Disponible",
    note: "Individual, base de 3 o base de 5.",
  },
  conosIndividual: {
    name: "Cono individual",
    status: "Disponible",
    note: "Opción simple para iniciar con conos de faenado.",
  },
  conosBaseTres: {
    name: "Base de 3 conos",
    status: "Disponible",
    note: "Para sujetar mejor el pollo y trabajar varios puntos de faenado.",
  },
  conosBaseCinco: {
    name: "Base de 5 conos",
    status: "Disponible",
    note: "Mayor capacidad inicial para ordenar el faenado.",
  },
  peladoraTambor: {
    name: "Peladora de tambor para taladro",
    status: "Disponible · actualizable",
    note: "Primer paso para reducir trabajo manual en el pelado.",
  },
  peladoraBase: {
    name: "Peladora de tambor con base",
    status: "Disponible · actualizable",
    note: "La base mantiene el taladro estable y ordena mejor el uso.",
  },
  kitPeladora: {
    name: "Kit de actualización de peladora",
    status: "Disponible",
    note: "Permite pasar del tambor a la versión con base.",
  },
  peladoraIndustrial: {
    name: "Peladora automática industrial",
    status: "Disponible · aplica retoma",
    note: "Versión de 2 pollos para mayor capacidad.",
  },
  aturdidorBasico: {
    name: "Aturdidor básico",
    status: "Disponible · actualizable",
    note: "Caja electrónica y electrodos para iniciar con menor inversión.",
  },
  aturdidorUnPollo: {
    name: "Aturdidor de un pollo",
    status: "Disponible · aplica retoma",
    note: "Con cono, soporte y electrónica premium.",
  },
  kitAturdidor: {
    name: "Kit de actualización de aturdidor",
    status: "Disponible",
    note: "Base y cono para mejorar el sistema básico.",
  },
  aturdidorIndustrial: {
    name: "Aturdidor industrial rotatorio",
    status: "Disponible · aplica retoma",
    note: "Tres conos rotatorios para acelerar el proceso.",
  },
  escaldadorUno: {
    name: "Escaldador de un pollo",
    status: "Disponible",
    note: "Opción compacta para ordenar el escaldado.",
  },
  escaldadorTres: {
    name: "Escaldador de 3 pollos",
    status: "Disponible · aplica retoma",
    note: "Mayor capacidad para Planta Inicial.",
  },
};

function addBubble(text, type = "bot") {
  if (!chatWindow) return;
  const bubble = document.createElement("div");
  bubble.className = `bubble ${type}`;
  bubble.textContent = text;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function formatMoney(value) {
  const amount = Number(value);
  if (amount >= 5000000) return "Más de $5 millones";
  if (amount >= 1000000) {
    const millions = amount / 1000000;
    const label = millions === 1 ? "millón" : "millones";
    return `$${millions.toFixed(millions % 1 ? 1 : 0)} ${label}`;
  }
  return `$${Math.round(amount / 1000)} mil`;
}

function getRouteState(volume) {
  if (volume > 700) {
    return {
      title: "Planta Inicial",
      summary: "Tu foco es sostener capacidad: más ritmo, menos cuellos de botella y equipos que trabajen en conjunto.",
    };
  }
  if (volume <= 100) {
    return {
      title: "Inicio Allpa",
      summary: "Estás en el mejor punto para entrar con equipos básicos, accesibles y actualizables para Colombia.",
    };
  }
  return {
    title: "Emprendedor",
    summary: "Ya puedes ordenar el proceso y empezar a sumar equipos según el dolor que más te frena.",
  };
}

function createStep(key, reason) {
  const product = productCatalog[key];
  return {
    key,
    title: product.name,
    status: product.status,
    note: reason || product.note,
    link: productLinks[key],
  };
}

function buildImplementationOrder({ volume, pain, budget, buyStyle }) {
  const order = [];
  const shouldStartWithCones = pain === "orden" || (volume <= 100 && pain !== "escaldado");

  if (shouldStartWithCones) {
    order.push(createStep("conos", "Conos de faenado para sujetar mejor el pollo y trabajar más cómodo."));
  }

  if (pain === "pelado") {
    if (budget < 1200000 || buyStyle === "actualizable") {
      order.push(createStep("peladoraTambor", "Cotizas una entrada accesible para reducir trabajo manual en el pelado."));
      order.push(createStep("peladoraBase", "Cuando quieras más estabilidad, pasas a la versión con base para el taladro."));
      order.push(createStep("kitPeladora", "Si empezaste con tambor, actualizas con kit sin comprar todo de nuevo."));
    }
    order.push(createStep("peladoraIndustrial", "Cuando tu volumen lo pida, avanzas a la versión automática de 2 pollos."));
  }

  if (pain === "aturdido") {
    if (budget < 1200000 || buyStyle === "actualizable") {
      order.push(createStep("aturdidorBasico", "Inicias la anestesia eléctrica con caja electrónica y electrodos."));
      order.push(createStep("kitAturdidor", "Después puedes sumar base y cono para mejorar el sistema."));
    }
    order.push(createStep("aturdidorUnPollo", "El sistema de un pollo da más estabilidad y componentes premium."));
    if (volume > 300 || buyStyle === "completo") {
      order.push(createStep("aturdidorIndustrial", "Si necesitas más velocidad, avanzas a tres conos rotatorios."));
    }
  }

  if (pain === "escaldado") {
    if (volume <= 300 || budget < 2500000 || buyStyle === "actualizable") {
      order.push(createStep("escaldadorUno", "Inicias con un escaldador compacto para controlar mejor temperatura antes del pelado."));
    }
    order.push(createStep("escaldadorTres", "Cuando sube el volumen, pasas al escaldador de 3 pollos con mayor capacidad."));
  }

  if (pain === "capacidad") {
    if (volume <= 300) {
      order.push(createStep("conos", "Antes de acelerar, aseguras el faenado con conos."));
    }
    order.push(createStep("aturdidorIndustrial", "Aceleras el manejo previo con tres conos rotatorios."));
    order.push(createStep("escaldadorTres", "Sostienes el ritmo con escaldado de mayor capacidad."));
    order.push(createStep("peladoraIndustrial", "Cierras el flujo con peladora automática de 2 pollos."));
  }

  if (!order.length) {
    order.push(createStep("conos", "Este es el punto más simple para iniciar con conos de faenado."));
  }

  const uniqueOrder = [];
  order.forEach((item) => {
    if (!uniqueOrder.some((existing) => existing.key === item.key)) {
      uniqueOrder.push(item);
    }
  });

  return uniqueOrder.slice(0, 5);
}

function getPaymentAdvice(payment, budget) {
  if (payment === "sistecredito") {
    return "Puedes preguntar por compra con Sistecrédito. La aprobación y condiciones dependen del aliado financiero.";
  }
  if (payment === "separe") {
    return "Puedes revisar plan separe hasta 3 meses con contrato de compra. Las condiciones, incluyendo devoluciones, deben confirmarse legalmente antes de comprometer la venta.";
  }
  if (payment === "orientacion" || budget < 700000) {
    return "Si el presupuesto inicial queda corto para el paquete que quieres, conviene revisar cuotas, Sistecrédito o plan separe antes de descartar la ruta.";
  }
  return "Si compras de contado, puedes priorizar el primer equipo y dejar la actualización preparada para el siguiente paso.";
}

function getPainLabel(pain) {
  const labels = {
    orden: "conos de faenado",
    pelado: "reducir trabajo al pelar",
    aturdido: "anestesia eléctrica",
    escaldado: "controlar mejor el escaldado",
    capacidad: "procesar más rápido",
  };
  return labels[pain] || pain;
}

function renderResult(answers) {
  const routeState = getRouteState(answers.volume);
  const order = buildImplementationOrder(answers);
  const steps = order
    .map(
      (item, index) => `<a class="route-step" href="${item.link}">
        <span>${index + 1}</span>
        <strong>${item.title}</strong>
        <em>${item.status}</em>
        <small>${item.note}</small>
      </a>`
    )
    .join("");
  const paymentAdvice = getPaymentAdvice(answers.payment, answers.budget);

  resultPanel.hidden = false;
  resultPanel.innerHTML = `
    <p class="eyebrow">Tu ruta sugerida</p>
    <h3>${routeState.title}</h3>
    <p>${routeState.summary}</p>
    <div class="result-summary">
      <span><strong>${answers.volume}</strong> pollos/mes</span>
      <span><strong>${formatMoney(answers.budget)}</strong> de presupuesto</span>
      <span>Dolor: <strong>${getPainLabel(answers.pain)}</strong></span>
    </div>
    <div class="route-plan">${steps}</div>
    <div class="finance-note">
      <strong>Forma de pago</strong>
      <p>${paymentAdvice}</p>
    </div>
    <a class="button primary full" href="https://wa.me/573152112644?text=${encodeURIComponent(
      `Hola Allpa Tech, proceso ${answers.volume} pollos al mes, tengo un presupuesto de ${formatMoney(answers.budget)} y quiero ${getPainLabel(answers.pain)}. Quiero revisar mi ruta ${routeState.title} y el orden de implementación.`
    )}" target="_blank" rel="noreferrer">Revisar mi siguiente paso por WhatsApp</a>
  `;
}

const budgetInput = document.querySelector("#budget");
const budgetOutput = document.querySelector("#budgetOutput");

function getFinderAnswers() {
  const formData = new FormData(finderForm);
  return {
    volume: Number(formData.get("volume")),
    specificProduct: formData.get("specificProduct"),
    budget: Number(formData.get("budget")),
    pain: formData.get("pain"),
    buyStyle: formData.get("buyStyle"),
    payment: formData.get("payment"),
  };
}

function setFinderStep(index, shouldSpeak = true) {
  if (!finderSteps.length) return;
  activeFinderStep = Math.max(0, Math.min(index, finderSteps.length - 1));
  const activeStep = finderSteps[activeFinderStep];

  finderSteps.forEach((step, stepIndex) => {
    const isActive = stepIndex === activeFinderStep;
    step.classList.toggle("is-active", isActive);
    step.hidden = !isActive;
  });

  finderProgress.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === activeFinderStep);
    dot.classList.toggle("is-complete", dotIndex < activeFinderStep);
  });

  if (shouldSpeak) {
    const message = finderStepMessages[activeStep.dataset.finderStep];
    if (message) addBubble(message);
  }
}

function renderDirectProduct(productKey, volume) {
  const product = productCatalog[productKey];
  if (!product) return;

  const routeState = getRouteState(volume);
  const message = `Hola Allpa Tech, proceso ${volume} pollos al mes y quiero cotizar ${product.name}.`;

  resultPanel.hidden = false;
  resultPanel.innerHTML = `
    <p class="eyebrow">Cotización directa</p>
    <h3>${product.name}</h3>
    <p>Ya tienes claro el equipo. El siguiente paso es hablar con un asesor para confirmar versión, capacidad, entrega y forma de pago.</p>
    <div class="result-summary">
      <span><strong>${volume}</strong> pollos/mes</span>
      <span>Ruta probable: <strong>${routeState.title}</strong></span>
      <span><strong>${product.status}</strong></span>
    </div>
    <div class="route-plan">
      <a class="route-step" href="${productLinks[productKey]}">
        <span>1</span>
        <strong>${product.name}</strong>
        <em>${product.status}</em>
        <small>${product.note}</small>
      </a>
    </div>
    <a class="button primary full" href="https://wa.me/573152112644?text=${encodeURIComponent(message)}" target="_blank" rel="noreferrer">Cotizar este equipo por WhatsApp</a>
  `;
}

if (volumeInput && volumeOutput) {
  volumeInput.addEventListener("input", () => {
    volumeOutput.value = volumeInput.value;
    volumeOutput.textContent = volumeInput.value;
  });
}

if (budgetInput && budgetOutput) {
  budgetInput.addEventListener("input", () => {
    const formattedBudget = formatMoney(budgetInput.value);
    budgetOutput.value = formattedBudget;
    budgetOutput.textContent = formattedBudget;
  });
}

if (finderForm) {
  finderForm.addEventListener("click", (event) => {
    const nextButton = event.target.closest("[data-next-step]");
    const prevButton = event.target.closest("[data-prev-step]");

    if (prevButton) {
      resultPanel.hidden = true;
      setFinderStep(activeFinderStep - 1, false);
      return;
    }

    if (!nextButton) return;

    const answers = getFinderAnswers();
    const activeStep = finderSteps[activeFinderStep]?.dataset.finderStep;
    resultPanel.hidden = true;

    if (activeStep === "volume") {
      addBubble(`Proceso cerca de ${answers.volume} pollos al mes.`, "user");
      setFinderStep(activeFinderStep + 1);
      return;
    }

    if (activeStep === "product" && answers.specificProduct !== "unsure") {
      const product = productCatalog[answers.specificProduct];
      addBubble(`Quiero cotizar ${product.name}.`, "user");
      addBubble("Perfecto. Te dejo el botón para hablar con un asesor y confirmar la mejor versión para tu volumen.");
      renderDirectProduct(answers.specificProduct, answers.volume);
      return;
    }

    if (activeStep === "product") {
      addBubble("No estoy seguro, quiero que me guíen.", "user");
    }

    if (activeStep === "budget") {
      addBubble(`Quiero iniciar con ${formatMoney(answers.budget)}.`, "user");
    }

    if (activeStep === "pain") {
      addBubble(`Quiero mejorar: ${getPainLabel(answers.pain)}.`, "user");
    }

    if (activeStep === "buy") {
      const buyLabel =
        answers.buyStyle === "completo"
          ? "prefiero una solución más completa desde el inicio"
          : "quiero iniciar básico y actualizar después";
      addBubble(buyLabel, "user");
    }

    setFinderStep(activeFinderStep + 1);
  });

  finderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const answers = getFinderAnswers();
    const routeState = getRouteState(answers.volume);
    const paymentLabels = {
      contado: "quiero cotizar de contado",
      separe: "quiero revisar plan separe",
      sistecredito: "quiero saber si aplica a Sistecrédito",
      orientacion: "quiero orientación antes de decidir",
    };

    addBubble(paymentLabels[answers.payment] || "quiero revisar la forma de pago", "user");
    addBubble(`${routeState.title}: te propongo una ruta de compra empezando por el equipo que resuelve tu dolor principal.`);
    renderResult(answers);
  });

  setFinderStep(0, false);
}

const retakeProducts = {
  aturdidor: {
    label: "Aturdidor de un pollo",
    regularPrice: 1000000,
    promoPrice: 800000,
    logistics: 120000,
    tradeBonus: 600000,
    programDiscount: 200000,
    upgrades: [
      {
        id: "industrial",
        label: "Aturdidor industrial giratorio de 3 pollos",
        shortLabel: "Industrial giratorio de 3 pollos",
        price: 2000000,
        copy: "Subes a 3 conos rotatorios para aumentar velocidad y manejar mejor los picos de producción.",
      },
    ],
  },
};

function initRetakeSimulator() {
  if (!retakeSimulator) return;

  const productSelect = retakeSimulator.querySelector("[data-retake-product]");
  const upgradeSelect = retakeSimulator.querySelector("[data-retake-upgrade]");
  const promoInput = retakeSimulator.querySelector("[data-retake-promo]");
  const conditionInput = retakeSimulator.querySelector("[data-retake-condition]");
  const upgradeCopy = retakeSimulator.querySelector("[data-upgrade-copy]");
  const initialTotal = retakeSimulator.querySelector("[data-initial-total]");
  const initialDetail = retakeSimulator.querySelector("[data-initial-detail]");
  const totalSaving = retakeSimulator.querySelector("[data-total-saving]");
  const upgradePay = retakeSimulator.querySelector("[data-upgrade-pay]");
  const upgradeDetail = retakeSimulator.querySelector("[data-upgrade-detail]");
  const nextName = retakeSimulator.querySelector("[data-next-name]");
  const nextPrice = retakeSimulator.querySelector("[data-next-price]");
  const programDiscount = retakeSimulator.querySelector("[data-program-discount]");
  const tradeBonus = retakeSimulator.querySelector("[data-trade-bonus]");
  const finalPay = retakeSimulator.querySelector("[data-final-pay]");
  const summaryTitle = retakeSimulator.querySelector("[data-summary-title]");
  const summaryCurrent = retakeSimulator.querySelector("[data-summary-current]");
  const summaryUpgrade = retakeSimulator.querySelector("[data-summary-upgrade]");
  const summarySaving = retakeSimulator.querySelector("[data-summary-saving]");
  const summaryPay = retakeSimulator.querySelector("[data-summary-pay]");
  const summaryNote = retakeSimulator.querySelector("[data-summary-note]");
  const panels = Array.from(retakeSimulator.querySelectorAll(".retake-panel"));
  const nextButtons = Array.from(retakeSimulator.querySelectorAll("[data-retake-next]"));

  function openPanel(index) {
    panels.forEach((panel, panelIndex) => {
      panel.open = panelIndex === index;
    });
  }

  function populateUpgrades() {
    const product = retakeProducts[productSelect.value] || retakeProducts.aturdidor;
    upgradeSelect.innerHTML = product.upgrades
      .map((upgrade) => `<option value="${upgrade.id}">${upgrade.label}</option>`)
      .join("");
  }

  function getSelectedUpgrade(product) {
    return product.upgrades.find((upgrade) => upgrade.id === upgradeSelect.value) || product.upgrades[0];
  }

  function render() {
    const product = retakeProducts[productSelect.value] || retakeProducts.aturdidor;
    const upgrade = getSelectedUpgrade(product);
    const boughtInPromo = promoInput.checked;
    const eligible = conditionInput.checked;
    const firstPrice = boughtInPromo ? product.promoPrice : product.regularPrice;
    const initialValue = firstPrice + product.logistics;
    const activeTradeBonus = eligible ? product.tradeBonus : 0;
    const activeProgramDiscount = eligible ? product.programDiscount : 0;
    const saving = activeTradeBonus + activeProgramDiscount;
    const payToUpgrade = upgrade.price - saving;

    initialTotal.textContent = formatMoney(initialValue);
    initialDetail.textContent = `${product.label} ${boughtInPromo ? "en promoción" : "a precio regular"} + envío e impuestos.`;
    totalSaving.textContent = eligible ? formatMoney(saving) : "Por evaluar";
    upgradePay.textContent = formatMoney(payToUpgrade);
    upgradeDetail.textContent = eligible
      ? `Valor del ${upgrade.shortLabel} menos bono y descuento.`
      : "Primero debemos revisar si el equipo aplica a retoma.";
    upgradeCopy.textContent = upgrade.copy;
    nextName.textContent = upgrade.label;
    nextPrice.textContent = formatMoney(upgrade.price);
    programDiscount.textContent = eligible ? `-${formatMoney(product.programDiscount)}` : "Por evaluar";
    tradeBonus.textContent = eligible ? `-${formatMoney(product.tradeBonus)}` : "Por evaluar";
    finalPay.textContent = formatMoney(payToUpgrade);
    summaryTitle.textContent = `${product.label} → ${upgrade.shortLabel}`;
    summaryCurrent.textContent = product.label;
    summaryUpgrade.textContent = upgrade.shortLabel;
    summarySaving.textContent = eligible ? formatMoney(saving) : "Por evaluar";
    summaryPay.textContent = formatMoney(payToUpgrade);
    summaryNote.textContent = eligible
      ? `Tu ahorro combina ${formatMoney(product.tradeBonus)} de bono por equipo y ${formatMoney(product.programDiscount)} de descuento Allpa Tech.`
      : "Si el equipo no funciona o la estructura está rota, el bono debe evaluarse antes de confirmar la retoma.";
  }

  productSelect.addEventListener("change", () => {
    populateUpgrades();
    render();
    openPanel(1);
  });

  [upgradeSelect, promoInput, conditionInput].forEach((control) => {
    control.addEventListener("change", render);
  });

  nextButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const currentPanel = button.closest(".retake-panel");
      const currentIndex = panels.indexOf(currentPanel);
      openPanel(Math.min(currentIndex + 1, panels.length - 1));
    });
  });

  panels.forEach((panel, panelIndex) => {
    panel.addEventListener("toggle", () => {
      if (!panel.open) return;
      panels.forEach((otherPanel, otherIndex) => {
        if (otherIndex !== panelIndex) otherPanel.open = false;
      });
    });
  });

  populateUpgrades();
  render();
}

function initStageTabs() {
  if (!stageExperience) return;

  const tabs = Array.from(stageExperience.querySelectorAll("[data-stage-tab]"));
  const panels = Array.from(stageExperience.querySelectorAll("[data-stage-panel]"));
  const liveRegion = stageExperience.querySelector("[data-stage-live]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeIndex = 0;
  let autoplayTimer = null;
  let userPaused = reduceMotion;

  function stopAutoplay() {
    window.clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  function startAutoplay() {
    if (userPaused || reduceMotion) return;
    stopAutoplay();
    autoplayTimer = window.setInterval(() => {
      setActive(activeIndex + 1);
    }, 7600);
  }

  function setActive(index, manual = false) {
    activeIndex = (index + tabs.length) % tabs.length;
    if (manual) {
      userPaused = true;
      stopAutoplay();
    }

    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === activeIndex;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
      tab.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    panels.forEach((panel, panelIndex) => {
      const isActive = panelIndex === activeIndex;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });

    if (liveRegion) {
      liveRegion.textContent = tabs[activeIndex].textContent.trim();
    }
  }

  tabs.forEach((tab, tabIndex) => {
    tab.addEventListener("click", () => setActive(tabIndex, true));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (tabIndex + direction + tabs.length) % tabs.length;
      tabs[nextIndex].focus();
      setActive(nextIndex, true);
    });
  });

  setActive(0);
  startAutoplay();
}

function initGrowthCarousel() {
  if (!carousel) return;

  const cards = Array.from(carousel.querySelectorAll("[data-carousel-card]"));
  const prevButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const dotsContainer = carousel.querySelector("[data-carousel-dots]");
  const liveRegion = carousel.querySelector("[data-carousel-live]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeIndex = 0;
  let autoplayTimer = null;
  let isPaused = reduceMotion;
  let resumeTimer = null;

  const dots = cards.map((card, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "carousel-dot";
    button.setAttribute("aria-label", `Ver paso ${index + 1}: ${card.querySelector("h3").textContent}`);
    button.addEventListener("click", () => {
      setActive(index);
      pauseTemporarily();
    });
    dotsContainer.appendChild(button);
    return button;
  });

  function getCircularOffset(cardIndex) {
    const rawOffset = cardIndex - activeIndex;
    const half = cards.length / 2;
    if (rawOffset >= half) return rawOffset - cards.length;
    if (rawOffset <= -half) return rawOffset + cards.length;
    return rawOffset;
  }

  function setActive(index) {
    activeIndex = (index + cards.length) % cards.length;
    cards.forEach((card, cardIndex) => {
      const isActive = cardIndex === activeIndex;
      const offset = getCircularOffset(cardIndex);
      card.classList.toggle("is-active", isActive);
      card.dataset.position = Math.abs(offset) > 2 ? "far" : String(offset);
      card.setAttribute("aria-hidden", isActive ? "false" : "true");
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
      dot.setAttribute("aria-current", dotIndex === activeIndex ? "step" : "false");
    });
    liveRegion.textContent = cards[activeIndex].querySelector("h3").textContent;
  }

  function stopAutoplay() {
    window.clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  function startAutoplay() {
    if (isPaused || reduceMotion) return;
    stopAutoplay();
    autoplayTimer = window.setInterval(() => setActive(activeIndex + 1), 8800);
  }

  function setPaused(paused) {
    isPaused = paused;
    if (isPaused) stopAutoplay();
    else startAutoplay();
  }

  function pauseTemporarily() {
    window.clearTimeout(resumeTimer);
    setPaused(true);
    if (!reduceMotion) {
      resumeTimer = window.setTimeout(() => setPaused(false), 12000);
    }
  }

  prevButton.addEventListener("click", () => {
    setActive(activeIndex - 1);
    pauseTemporarily();
  });

  nextButton.addEventListener("click", () => {
    setActive(activeIndex + 1);
    pauseTemporarily();
  });

  addSwipeNavigation(
    carousel,
    () => {
      setActive(activeIndex - 1);
      pauseTemporarily();
    },
    () => {
      setActive(activeIndex + 1);
      pauseTemporarily();
    },
  );

  carousel.addEventListener("mouseenter", () => setPaused(true));
  carousel.addEventListener("mouseleave", () => {
    if (!reduceMotion) setPaused(false);
  });
  carousel.addEventListener("focusin", () => setPaused(true));
  carousel.addEventListener("focusout", () => {
    if (!reduceMotion) setPaused(false);
  });
  setActive(0);
  setPaused(isPaused);
}

function initProductCards() {
  const cards = Array.from(document.querySelectorAll(".product-card"));
  cards.forEach((card) => {
    card.addEventListener("toggle", () => {
      if (!card.open) return;
      cards.forEach((otherCard) => {
        if (otherCard !== card) otherCard.open = false;
      });
    });
  });
}

function initProductGallery() {
  const galleries = Array.from(document.querySelectorAll(".sales-gallery"));

  galleries.forEach((gallery) => {
    const mainImage = gallery.querySelector(".main-product-image img");
    const mainSource = gallery.querySelector(".main-product-image source");
    const thumbs = Array.from(gallery.querySelectorAll("[data-gallery-thumb]"));
    if (!mainImage || !thumbs.length) return;
    const uniqueThumbs = thumbs.filter(
      (thumb, index, list) => list.findIndex((item) => item.src === thumb.src) === index,
    );
    let activeIndex = 0;

    function setActiveThumb(selectedThumb) {
      const nextSrc = selectedThumb.currentSrc || selectedThumb.src;
      const nextAlt = selectedThumb.dataset.galleryAlt || selectedThumb.alt || mainImage.alt;
      mainImage.src = nextSrc;
      mainImage.alt = nextAlt;
      if (mainSource) {
        mainSource.srcset = nextSrc;
      }

      thumbs.forEach((thumb) => {
        const isActive = thumb.src === selectedThumb.src;
        thumb.classList.toggle("is-active", isActive);
        thumb.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
      activeIndex = Math.max(0, uniqueThumbs.findIndex((thumb) => thumb.src === selectedThumb.src));
    }

    function moveGallery(delta) {
      const nextIndex = (activeIndex + delta + uniqueThumbs.length) % uniqueThumbs.length;
      setActiveThumb(uniqueThumbs[nextIndex]);
    }

    thumbs.forEach((thumb) => {
      thumb.setAttribute("role", "button");
      thumb.setAttribute("tabindex", "0");
      thumb.setAttribute("aria-pressed", "false");
      thumb.addEventListener("click", () => setActiveThumb(thumb));
      thumb.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        setActiveThumb(thumb);
      });
    });

    const prevButton = document.createElement("button");
    prevButton.type = "button";
    prevButton.className = "carousel-arrow is-prev";
    prevButton.setAttribute("aria-label", "Ver imagen anterior del producto");
    prevButton.textContent = "‹";
    prevButton.addEventListener("click", () => moveGallery(-1));

    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "carousel-arrow is-next";
    nextButton.setAttribute("aria-label", "Ver siguiente imagen del producto");
    nextButton.textContent = "›";
    nextButton.addEventListener("click", () => moveGallery(1));

    gallery.append(prevButton, nextButton);
    addSwipeNavigation(gallery, () => moveGallery(-1), () => moveGallery(1));

    const initialThumb = thumbs.find((thumb) => thumb.src === mainImage.src) || thumbs[0];
    setActiveThumb(initialThumb);
  });
}

function initSalesCarousels() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const carousels = Array.from(document.querySelectorAll("[data-sales-carousel]"));

  carousels.forEach((carousel) => {
    const track = carousel.querySelector("[data-carousel-track]");
    if (!track) return;

    const slides = Array.from(track.children).filter((slide) => slide.getAttribute("aria-hidden") !== "true");
    if (slides.length < 2) return;

    let activeIndex = 0;
    let autoplayTimer = 0;
    let resumeTimer = 0;
    const delay = Number(carousel.dataset.carouselDelay) || 8200;
    const resumeDelay = carousel.dataset.carouselContinuous === "true" ? delay : delay * 2;
    const dots = document.createElement("div");
    dots.className = "sales-carousel-dots";
    dots.setAttribute("aria-label", "Navegación del carrusel");
    const prevButton = document.createElement("button");
    prevButton.type = "button";
    prevButton.className = "carousel-arrow is-prev";
    prevButton.setAttribute("aria-label", "Ver elemento anterior");
    prevButton.textContent = "‹";
    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "carousel-arrow is-next";
    nextButton.setAttribute("aria-label", "Ver siguiente elemento");
    nextButton.textContent = "›";

    const dotButtons = slides.map((_, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sales-carousel-dot";
      button.setAttribute("aria-label", `Ver elemento ${index + 1} de ${slides.length}`);
      button.addEventListener("click", () => {
        setActive(index);
        pauseTemporarily();
      });
      dots.appendChild(button);
      return button;
    });

    prevButton.addEventListener("click", () => {
      setActive(activeIndex - 1);
      pauseTemporarily();
    });

    nextButton.addEventListener("click", () => {
      setActive(activeIndex + 1);
      pauseTemporarily();
    });

    carousel.append(prevButton, nextButton, dots);
    addSwipeNavigation(
      carousel,
      () => {
        setActive(activeIndex - 1);
        pauseTemporarily();
      },
      () => {
        setActive(activeIndex + 1);
        pauseTemporarily();
      },
    );

    function stopAutoplay() {
      window.clearInterval(autoplayTimer);
      autoplayTimer = 0;
    }

    function startAutoplay() {
      if (reduceMotion.matches || autoplayTimer) return;
      autoplayTimer = window.setInterval(() => setActive(activeIndex + 1), delay);
    }

    function setActive(index) {
      activeIndex = (index + slides.length) % slides.length;
      const firstOffset = slides[0].offsetLeft;
      const targetOffset = slides[activeIndex].offsetLeft - firstOffset;
      const maxOffset = Math.max(0, track.scrollWidth - carousel.clientWidth);
      track.style.transform = `translateX(-${Math.min(targetOffset, maxOffset)}px)`;

      dotButtons.forEach((button, buttonIndex) => {
        const isActive = buttonIndex === activeIndex;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-current", isActive ? "true" : "false");
      });
    }

    function pauseTemporarily() {
      stopAutoplay();
      window.clearTimeout(resumeTimer);
      if (!reduceMotion.matches) {
        resumeTimer = window.setTimeout(startAutoplay, resumeDelay);
      }
    }

    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);
    carousel.addEventListener("focusin", stopAutoplay);
    carousel.addEventListener("focusout", startAutoplay);
    window.addEventListener("resize", () => setActive(activeIndex));

    setActive(0);
    startAutoplay();
  });
}

const conesPageConfig = {
  socialProof: {
    stats: [
      {
        value: "+150",
        label: "conos vendidos",
        detail: "Equipos que ya ayudan a avicultores a ordenar el faenado.",
      },
      {
        value: "+80",
        label: "bases vendidas",
        detail: "Bases instaladas para trabajar con más estabilidad y comodidad.",
      },
    ],
  },
  youtube: {
    enabled: false,
    url: "",
    title: "Video corto sobre conos de faenado Allpa Tech",
  },
  faqs: [
    {
      question: "¿Puedo pagar contraentrega?",
      answer:
        "Sí. En zonas con cobertura puedes pagar cuando recibes. Al hacer el pedido por WhatsApp confirmamos ciudad, transportadora y condiciones antes de despachar.",
    },
    {
      question: "¿Qué tamaño de cono necesito?",
      answer:
        "Depende del peso del pollo que trabajas. Estándar cubre 1.5 a 2.5 kg, Mediano 1.5 a 3 kg, Grande hasta 4 kg y Súper Jumbo hasta 6.5 kg.",
    },
    {
      question: "¿Puedo combinar tamaños en el kit?",
      answer:
        "Sí. El Kit Emprendedor incluye 5 conos con base y puedes elegir los tamaños que más se ajusten a tu producción.",
    },
    {
      question: "¿Cómo me ayuda a ganar dinero?",
      answer:
        "Te ayuda a trabajar con más orden, reducir improvisación y atender más pollos con una estación de faenado estable. Ese control se nota cuando quieres vender con constancia.",
    },
    {
      question: "¿Tiene garantía?",
      answer:
        "Sí. Te confirmamos la garantía aplicable y el cuidado recomendado antes de cerrar el pedido, según el producto y el uso esperado.",
    },
    {
      question: "¿Este producto entra en Allpa Crece?",
      answer:
        "Sí. Los conos son un primer paso para iniciar con orden. Desde ahí puedes avanzar hacia aturdidor, pelado y otros equipos cuando tu producción lo pida.",
    },
  ],
};

function initConesOrder() {
  const order = document.querySelector('[data-product-order="conos"]');
  if (!order) return;

  const prices = {
    estandar: { label: "Estándar", range: "1.5 - 2.5 kg", price: 25000 },
    mediano: { label: "Mediano", range: "1.5 - 3.0 kg", price: 30000 },
    grande: { label: "Grande", range: "4.0 kg", price: 35000 },
    superJumbo: { label: "Súper Jumbo", range: "6.5 kg", price: 38000 },
  };

  const kitPrice = 300000;
  const qtyInput = order.querySelector("[data-order-qty]");
  const minusButton = order.querySelector("[data-qty-minus]");
  const plusButton = order.querySelector("[data-qty-plus]");
  const sizeOptions = order.querySelector("[data-size-options]");
  const kitNote = order.querySelector("[data-kit-note]");
  const quantityLabel = order.querySelector("[data-quantity-label]");
  const title = order.querySelector("[data-order-title]");
  const includes = order.querySelector("[data-order-includes]");
  const quantity = order.querySelector("[data-order-quantity]");
  const total = order.querySelector("[data-order-total]");
  const note = order.querySelector("[data-order-note]");
  const whatsapp = order.querySelector("[data-order-whatsapp]");
  const floatingSelection = document.querySelector("[data-floating-selection]");
  const floatingTotal = document.querySelector("[data-floating-total]");
  const floatingWhatsapp = document.querySelector("[data-floating-whatsapp]");
  const floatingQty = document.querySelector("[data-floating-qty]");
  const floatingMinus = document.querySelector("[data-floating-qty-minus]");
  const floatingPlus = document.querySelector("[data-floating-qty-plus]");
  const orderPanels = Array.from(order.querySelectorAll(".order-panel"));
  const orderNextButtons = Array.from(order.querySelectorAll("[data-order-next]"));
  const faqList = document.querySelector("[data-faq-list]");
  const youtubeSlot = document.querySelector("[data-youtube-slot]");
  const socialStats = document.querySelector("[data-social-stats]");

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getYoutubeEmbedUrl(url) {
    if (!url) return "";
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
    const videoId = watchMatch?.[1] || shortMatch?.[1] || embedMatch?.[1] || "";
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  }

  function renderFaqs() {
    if (!faqList) return;
    faqList.innerHTML = conesPageConfig.faqs
      .map(
        (faq, index) => `
          <details${index === 0 ? " open" : ""}>
            <summary>${escapeHtml(faq.question)}</summary>
            <p>${escapeHtml(faq.answer)}</p>
          </details>
        `,
      )
      .join("");
  }

  function renderVideoSlot() {
    if (!youtubeSlot) return;
    const embedUrl = getYoutubeEmbedUrl(conesPageConfig.youtube.url);
    const shouldShow = conesPageConfig.youtube.enabled && embedUrl;
    youtubeSlot.hidden = !shouldShow;
    youtubeSlot.innerHTML = shouldShow
      ? `<iframe src="${embedUrl}" title="${escapeHtml(conesPageConfig.youtube.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
      : "";
  }

  function renderSocialStats() {
    if (!socialStats) return;
    socialStats.innerHTML = conesPageConfig.socialProof.stats
      .map(
        (stat) => `
          <article class="social-stat-widget">
            <strong>${escapeHtml(stat.value)}</strong>
            <span>${escapeHtml(stat.label)}</span>
            <p>${escapeHtml(stat.detail)}</p>
          </article>
        `,
      )
      .join("");
  }

  function openPanel(index) {
    orderPanels.forEach((panel, panelIndex) => {
      panel.open = panelIndex === index;
    });
  }

  function setQuantity(nextQty) {
    qtyInput.value = Math.max(1, Math.min(50, Number(nextQty) || 1));
    render();
  }

  function getSelection() {
    const purchaseType = order.querySelector('input[name="purchaseType"]:checked').value;
    const sizeKey = order.querySelector('input[name="coneSize"]:checked').value;
    const qty = Math.max(1, Math.min(50, Number(qtyInput.value) || 1));
    qtyInput.value = qty;
    return { purchaseType, sizeKey, qty };
  }

  function render() {
    const { purchaseType, sizeKey, qty } = getSelection();
    const size = prices[sizeKey];
    const isKit = purchaseType === "kit";
    const subtotal = isKit ? kitPrice * qty : size.price * qty;
    const selectionTitle = isKit ? "Kit Emprendedor" : `Cono ${size.label}`;
    const includesText = isKit ? "5 conos + base" : `${size.range} por unidad`;
    const quantityText = isKit ? `${qty} ${qty === 1 ? "kit" : "kits"}` : `${qty} ${qty === 1 ? "cono" : "conos"}`;
    const noteText = isKit
      ? "Puedes elegir los tamaños del kit cuando confirmes el pedido con el asesor."
      : "El asesor confirma ciudad, disponibilidad y cobertura de pago contraentrega.";
    const message = isKit
      ? `Hola Allpa Tech, quiero pedir ${quantityText} del Kit Emprendedor de conos. Entiendo que incluye 5 conos + base por ${formatMoney(kitPrice)} cada kit. Quiero confirmar tamaños, pago contraentrega y envío.`
      : `Hola Allpa Tech, quiero pedir ${quantityText} tamaño ${size.label} (${size.range}) de conos de faenado. Total estimado ${formatMoney(subtotal)}. Quiero confirmar pago contraentrega y envío.`;
    const href = `https://wa.me/573152112644?text=${encodeURIComponent(message)}`;

    sizeOptions.classList.toggle("is-kit", isKit);
    kitNote.hidden = !isKit;
    quantityLabel.textContent = isKit ? "1 kit equivale a 5 conos con base." : "La cantidad multiplica el precio por unidad.";
    title.textContent = selectionTitle;
    includes.textContent = includesText;
    quantity.textContent = quantityText;
    total.textContent = formatMoney(subtotal);
    note.textContent = noteText;
    whatsapp.href = href;

    if (floatingSelection && floatingTotal && floatingWhatsapp) {
      floatingSelection.textContent = selectionTitle;
      floatingTotal.textContent = formatMoney(subtotal);
      floatingWhatsapp.href = href;
    }

    if (floatingQty) {
      floatingQty.textContent = qty;
    }
  }

  orderPanels.forEach((panel) => {
    panel.addEventListener("toggle", () => {
      if (!panel.open) return;
      orderPanels.forEach((otherPanel) => {
        if (otherPanel !== panel) otherPanel.open = false;
      });
    });
  });

  orderNextButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextIndex = Number(button.dataset.orderNext);
      openPanel(nextIndex);
    });
  });

  order.addEventListener("change", render);
  minusButton.addEventListener("click", () => {
    setQuantity(Number(qtyInput.value) - 1);
  });
  plusButton.addEventListener("click", () => {
    setQuantity(Number(qtyInput.value) + 1);
  });
  floatingMinus?.addEventListener("click", () => setQuantity(Number(qtyInput.value) - 1));
  floatingPlus?.addEventListener("click", () => setQuantity(Number(qtyInput.value) + 1));
  qtyInput.addEventListener("input", render);
  renderSocialStats();
  renderFaqs();
  renderVideoSlot();
  render();
}

const aturdidorPageConfig = {
  versions: [
    {
      id: "basico",
      name: "Aturdidor basico",
      stage: "Inicio Allpa",
      price: 400000,
      promoPrice: null,
      shipping: 0,
      includes: "Caja electronica y electrodos",
      note: "Envio gratis sujeto a cobertura y confirmacion por WhatsApp.",
      bestFor: "Para iniciar con anestesia electrica sin comprar todavia la base completa.",
      specs: {
        Alimentacion: "110V · 60Hz",
        Activacion: "Carga al pulsar el boton",
        Autonomia: "No aplica",
        Materiales: "Caja electronica, electrodos y componentes de trabajo",
        Garantia: "1 año por defectos en caja electronica, estructura y electrodos",
        Retoma: "Aplica despues de evaluacion tecnica",
      },
    },
    {
      id: "unPollo",
      name: "Aturdidor de un pollo",
      stage: "Etapa Emprendedor",
      price: 1000000,
      promoPrice: 800000,
      shipping: 120000,
      includes: "Caja electronica, base, cono y soporte",
      note: "Promocion activa. Envio e impuestos estimados: $120 mil.",
      bestFor: "Para trabajar un pollo por ciclo con una estacion mas estable y ordenada.",
      specs: {
        Alimentacion: "110V · 60Hz",
        Activacion: "Carga al pulsar el boton",
        Autonomia: "No aplica",
        Materiales: "Cono, base y estructura en acero inoxidable",
        Garantia: "1 año por defectos en caja electronica, estructura y electrodos",
        Retoma: "Aplica para actualizar a mayor capacidad",
      },
    },
    {
      id: "industrial",
      name: "Aturdidor industrial rotatorio",
      stage: "Planta Inicial",
      price: 2000000,
      promoPrice: null,
      shipping: 0,
      includes: "Sistema rotatorio industrial de 3 conos",
      note: "Ideal para aumentar ritmo. El asesor confirma envio segun ciudad.",
      bestFor: "Para procesos con mayor volumen que necesitan reducir esperas entre pollos.",
      specs: {
        Alimentacion: "110V · 60Hz",
        Activacion: "Carga al pulsar el boton",
        Autonomia: "No aplica",
        Materiales: "Conos, base y estructura en acero inoxidable",
        Garantia: "1 año por defectos en caja electronica, estructura y electrodos",
        Retoma: "Aplica despues de evaluacion tecnica",
      },
    },
  ],
  faqs: [
    {
      question: "¿Que version me conviene?",
      answer: "Si estas iniciando, la version basica te permite entrar con menor inversion. Si quieres una estacion completa, elige el aturdidor de un pollo. Si ya tienes mayor volumen, revisa el industrial rotatorio.",
    },
    {
      question: "¿La retoma aplica para todos?",
      answer: "Si. Todas las versiones pueden aplicar a retoma despues de evaluacion tecnica del funcionamiento y estado de la estructura.",
    },
    {
      question: "¿Tiene bateria o cargador?",
      answer: "No. El equipo trabaja con alimentacion 110V 60Hz, por eso no incluye bateria ni cargador.",
    },
    {
      question: "¿Que cubre la garantia?",
      answer: "La garantia es de 1 año y cubre caja electronica, estructura y electrodos por defectos de fabricacion.",
    },
    {
      question: "¿Puedo comprar mas de uno?",
      answer: "Si. Puedes seleccionar cantidad en la pagina. Si tu volumen es alto, tambien puedes pedir asesoria para comparar varios equipos frente a la version industrial.",
    },
  ],
};

function initAturdidorPage() {
  const order = document.querySelector('[data-product-order="aturdidor"]');
  if (!order) return;

  const options = order.querySelector("[data-aturdidor-options]");
  const tabs = document.querySelector("[data-aturdidor-tabs]");
  const specPanel = document.querySelector("[data-aturdidor-spec]");
  const faqList = document.querySelector("[data-aturdidor-faq-list]");
  const qtyInput = order.querySelector("[data-order-qty]");
  const minusButton = order.querySelector("[data-qty-minus]");
  const plusButton = order.querySelector("[data-qty-plus]");
  const title = order.querySelector("[data-order-title]");
  const includes = order.querySelector("[data-order-includes]");
  const quantity = order.querySelector("[data-order-quantity]");
  const total = order.querySelector("[data-order-total]");
  const note = order.querySelector("[data-order-note]");
  const whatsapp = order.querySelector("[data-order-whatsapp]");
  const floatingSelection = document.querySelector("[data-floating-selection]");
  const floatingTotal = document.querySelector("[data-floating-total]");
  const floatingWhatsapp = document.querySelector("[data-floating-whatsapp]");
  const floatingQty = document.querySelector("[data-floating-qty]");
  const floatingMinus = document.querySelector("[data-floating-qty-minus]");
  const floatingPlus = document.querySelector("[data-floating-qty-plus]");
  const orderPanels = Array.from(order.querySelectorAll(".order-panel"));
  const orderNextButtons = Array.from(order.querySelectorAll("[data-order-next]"));
  let activeVersionId = "unPollo";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getVersion() {
    return aturdidorPageConfig.versions.find((version) => version.id === activeVersionId) || aturdidorPageConfig.versions[0];
  }

  function getDisplayPrice(version) {
    return version.promoPrice || version.price;
  }

  function getQuantity() {
    const qty = Math.max(1, Math.min(20, Number(qtyInput.value) || 1));
    qtyInput.value = qty;
    return qty;
  }

  function setQuantity(nextQty) {
    qtyInput.value = Math.max(1, Math.min(20, Number(nextQty) || 1));
    render();
  }

  function openPanel(index) {
    orderPanels.forEach((panel, panelIndex) => {
      panel.open = panelIndex === index;
    });
  }

  function renderOptions() {
    if (!options) return;
    options.innerHTML = aturdidorPageConfig.versions
      .map((version) => {
        const price = getDisplayPrice(version);
        const promo = version.promoPrice ? `<span>Promocion: ${formatMoney(version.promoPrice)} · Antes ${formatMoney(version.price)}</span>` : `<span>${formatMoney(version.price)}</span>`;
        return `
          <label>
            <input type="radio" name="aturdidorVersion" value="${escapeHtml(version.id)}"${version.id === activeVersionId ? " checked" : ""} />
            <strong>${escapeHtml(version.name)}</strong>
            ${promo}
            <span>${escapeHtml(version.stage)} · ${version.shipping === 0 ? "envio gratis o por confirmar" : `envio estimado ${formatMoney(version.shipping)}`}</span>
          </label>
        `;
      })
      .join("");
  }

  function renderTabs() {
    if (!tabs) return;
    tabs.innerHTML = aturdidorPageConfig.versions
      .map(
        (version) => `
          <button type="button" class="${version.id === activeVersionId ? "is-active" : ""}" data-aturdidor-tab="${escapeHtml(version.id)}">
            <span>${escapeHtml(version.stage)}</span>
            <strong>${escapeHtml(version.name)}</strong>
          </button>
        `,
      )
      .join("");

    tabs.querySelectorAll("[data-aturdidor-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        activeVersionId = button.dataset.aturdidorTab;
        render();
      });
    });
  }

  function renderSpec() {
    if (!specPanel) return;
    const version = getVersion();
    const specs = Object.entries(version.specs)
      .map(([label, value]) => `<li><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></li>`)
      .join("");
    specPanel.innerHTML = `
      <div>
        <p class="eyebrow">${escapeHtml(version.stage)}</p>
        <h3>${escapeHtml(version.name)}</h3>
        <p>${escapeHtml(version.bestFor)}</p>
      </div>
      <ul class="spec-list">${specs}</ul>
    `;
  }

  function renderFaqs() {
    if (!faqList) return;
    faqList.innerHTML = aturdidorPageConfig.faqs
      .map(
        (faq, index) => `
          <details${index === 0 ? " open" : ""}>
            <summary>${escapeHtml(faq.question)}</summary>
            <p>${escapeHtml(faq.answer)}</p>
          </details>
        `,
      )
      .join("");
  }

  function render() {
    const version = getVersion();
    const qty = getQuantity();
    const unitPrice = getDisplayPrice(version);
    const subtotal = (unitPrice + version.shipping) * qty;
    const quantityText = `${qty} ${qty === 1 ? "equipo" : "equipos"}`;
    const message = `Hola Allpa Tech, quiero pedir ${quantityText} de ${version.name}. Total estimado ${formatMoney(subtotal)}. Quiero confirmar disponibilidad, garantia, retoma y envio.`;
    const href = `https://wa.me/573152112644?text=${encodeURIComponent(message)}`;

    renderOptions();
    renderTabs();
    renderSpec();

    title.textContent = version.name;
    includes.textContent = version.includes;
    quantity.textContent = quantityText;
    total.textContent = formatMoney(subtotal);
    note.textContent = version.note;
    whatsapp.href = href;

    if (floatingSelection && floatingTotal && floatingWhatsapp) {
      floatingSelection.textContent = version.name;
      floatingTotal.textContent = formatMoney(subtotal);
      floatingWhatsapp.href = href;
    }

    if (floatingQty) floatingQty.textContent = qty;
  }

  orderPanels.forEach((panel) => {
    panel.addEventListener("toggle", () => {
      if (!panel.open) return;
      orderPanels.forEach((otherPanel) => {
        if (otherPanel !== panel) otherPanel.open = false;
      });
    });
  });

  orderNextButtons.forEach((button) => {
    button.addEventListener("click", () => openPanel(Number(button.dataset.orderNext)));
  });

  order.addEventListener("change", (event) => {
    if (event.target.name === "aturdidorVersion") {
      activeVersionId = event.target.value;
    }
    render();
  });
  minusButton.addEventListener("click", () => setQuantity(Number(qtyInput.value) - 1));
  plusButton.addEventListener("click", () => setQuantity(Number(qtyInput.value) + 1));
  floatingMinus?.addEventListener("click", () => setQuantity(Number(qtyInput.value) - 1));
  floatingPlus?.addEventListener("click", () => setQuantity(Number(qtyInput.value) + 1));
  qtyInput.addEventListener("input", render);
  renderFaqs();
  render();
}

const peladoraPageConfig = {
  versions: [
    {
      id: "tamborTaladro",
      name: "Tambor para taladro",
      stage: "Inicio Allpa",
      price: 200000,
      promoPrice: null,
      discountLabel: "",
      shippingIncluded: true,
      includes: "Tambor en acero inoxidable con dedos de caucho",
      note: "Pago contraentrega sujeto a cobertura. El tipo de taladro recomendado se confirma por WhatsApp.",
      bestFor: "Para reducir pelado manual con baja inversion y empezar a medir tu flujo.",
      specs: {
        "Tipo de taladro": "Pendiente por confirmar",
        Tambor: "Acero inoxidable",
        Dedos: "Caucho, los mismos de la peladora",
        Funcion: "Reduce pelado manual",
        Garantia: "1 año",
        Retoma: "Aplica para actualizar",
      },
    },
    {
      id: "baseSoporte",
      name: "Base soporte para taladro",
      stage: "Etapa Emprendedor",
      price: 700000,
      promoPrice: null,
      discountLabel: "",
      shippingIncluded: true,
      includes: "Estructura que se ajusta a una mesa y sostiene tambor y taladro",
      note: "Mejora ergonomia y estabilidad. Pago contraentrega sujeto a cobertura.",
      bestFor: "Para trabajar con mejor postura, menos improvisacion y un montaje mas estable.",
      specs: {
        Estructura: "Se ajusta a una mesa",
        Soporte: "Sostiene mejor el tambor y el taladro",
        Ergonomia: "Mejor posicion de trabajo",
        Materiales: "Estructura metalica y componentes de soporte",
        Garantia: "1 año",
        Retoma: "Aplica para actualizar",
      },
    },
    {
      id: "kitActualizacion",
      name: "Kit de actualizacion",
      stage: "Actualizacion",
      price: 500000,
      promoPrice: null,
      discountLabel: "",
      shippingIncluded: true,
      includes: "Kit para pasar del tambor a la base soporte",
      note: "Pensado para quien ya compro el tambor y quiere mejorar estabilidad.",
      bestFor: "Para crecer sin comprar una solucion nueva desde cero.",
      specs: {
        Funcion: "Actualiza tambor a base soporte",
        Compatibilidad: "Pensado para tambor Allpa Tech",
        Ergonomia: "Mayor estabilidad y mejor posicion de trabajo",
        Garantia: "1 año",
        Retoma: "Aplica para actualizar",
      },
    },
    {
      id: "industrial2",
      name: "Peladora industrial 2 pollos/min",
      stage: "Planta Inicial",
      price: 2800000,
      promoPrice: null,
      discountLabel: "",
      shippingIncluded: false,
      includes: "Peladora industrial personalizada de 2 pollos/min",
      note: "Los precios no incluyen envio. La personalizacion depende del cliente.",
      bestFor: "Para subir capacidad cuando ya tienes pedidos constantes y quieres reducir horas de pelado.",
      specs: {
        Alimentacion: "110V · 60Hz",
        Motor: "1 HP",
        Materiales: "Acero inoxidable",
        Dedos: "Caucho, consumibles",
        Agua: "Requiere agua durante el proceso",
        Capacidad: "Depende del tamaño superior personalizado",
        Garantia: "1 año en motor, estructura y tambor",
      },
    },
    {
      id: "industrial3",
      name: "Peladora industrial 3 pollos/min",
      stage: "Planta Inicial",
      price: 3000000,
      promoPrice: null,
      discountLabel: "Mas vendida",
      shippingIncluded: false,
      includes: "Peladora industrial personalizada de 3 pollos/min",
      note: "Mas vendida. Los precios no incluyen envio.",
      bestFor: "Para equilibrar inversion y capacidad cuando tu produccion ya tiene buen ritmo.",
      specs: {
        Alimentacion: "110V · 60Hz",
        Motor: "1 HP",
        Materiales: "Acero inoxidable",
        Dedos: "Caucho, consumibles",
        Agua: "Requiere agua durante el proceso",
        Capacidad: "Depende del tamaño superior personalizado",
        Garantia: "1 año en motor, estructura y tambor",
      },
    },
    {
      id: "industrial4",
      name: "Peladora industrial 4 pollos/min",
      stage: "Planta Inicial",
      price: 3800000,
      promoPrice: null,
      discountLabel: "",
      shippingIncluded: false,
      includes: "Peladora industrial personalizada de 4 pollos/min",
      note: "Los precios no incluyen envio. Se fabrica segun necesidad del cliente.",
      bestFor: "Para mayor volumen y menos espera entre tandas de pelado.",
      specs: {
        Alimentacion: "110V · 60Hz",
        Motor: "1 HP",
        Materiales: "Acero inoxidable",
        Dedos: "Caucho, consumibles",
        Agua: "Requiere agua durante el proceso",
        Capacidad: "Depende del tamaño superior personalizado",
        Garantia: "1 año en motor, estructura y tambor",
      },
    },
    {
      id: "industrial5",
      name: "Peladora industrial 5 pollos/min",
      stage: "Planta Inicial",
      price: 4700000,
      promoPrice: null,
      discountLabel: "",
      shippingIncluded: false,
      includes: "Peladora industrial personalizada de 5 pollos/min",
      note: "Los precios no incluyen envio. Fabricamos pocas unidades por mes para cuidar calidad.",
      bestFor: "Para clientes que ya necesitan alta capacidad y quieren disminuir horas de trabajo.",
      specs: {
        Alimentacion: "110V · 60Hz",
        Motor: "1 HP",
        Materiales: "Acero inoxidable",
        Dedos: "Caucho, consumibles",
        Agua: "Requiere agua durante el proceso",
        Capacidad: "Depende del tamaño superior personalizado",
        Garantia: "1 año en motor, estructura y tambor",
      },
    },
  ],
  faqs: [
    {
      question: "¿Cual peladora me conviene?",
      answer: "Si quieres iniciar con menor inversion, empieza con tambor para taladro. Si necesitas mejor ergonomia, revisa la base soporte. Si ya tienes volumen constante, compara las industriales por pollos por minuto.",
    },
    {
      question: "¿Los precios incluyen envio?",
      answer: "Las versiones industriales no incluyen envio. Las opciones de taladro se confirman por WhatsApp y pueden aplicar a pago contraentrega segun cobertura.",
    },
    {
      question: "¿La industrial requiere agua?",
      answer: "Si. La peladora industrial requiere agua durante el proceso para ayudar al flujo de pelado.",
    },
    {
      question: "¿Que cubre la garantia?",
      answer: "La garantia es de 1 año. Cubre motor, estructura y tambor por defectos. Los dedos de caucho son consumibles.",
    },
    {
      question: "¿Aplica retoma?",
      answer: "Si. La retoma aplica para actualizar, despues de evaluar estado y funcionamiento del equipo.",
    },
  ],
};

function initPeladoraPage() {
  const order = document.querySelector('[data-product-order="peladora"]');
  if (!order) return;

  const options = order.querySelector("[data-peladora-options]");
  const specPanel = document.querySelector("[data-peladora-spec]");
  const legacyTabs = document.querySelector("[data-peladora-tabs]");
  const faqList = document.querySelector("[data-peladora-faq-list]");
  const qtyInput = order.querySelector("[data-order-qty]");
  const minusButton = order.querySelector("[data-qty-minus]");
  const plusButton = order.querySelector("[data-qty-plus]");
  const title = order.querySelector("[data-order-title]");
  const includes = order.querySelector("[data-order-includes]");
  const quantity = order.querySelector("[data-order-quantity]");
  const total = order.querySelector("[data-order-total]");
  const note = order.querySelector("[data-order-note]");
  const whatsapp = order.querySelector("[data-order-whatsapp]");
  const floatingSelection = document.querySelector("[data-floating-selection]");
  const floatingTotal = document.querySelector("[data-floating-total]");
  const floatingWhatsapp = document.querySelector("[data-floating-whatsapp]");
  const floatingQty = document.querySelector("[data-floating-qty]");
  const floatingMinus = document.querySelector("[data-floating-qty-minus]");
  const floatingPlus = document.querySelector("[data-floating-qty-plus]");
  const orderPanels = Array.from(order.querySelectorAll(".order-panel"));
  const orderNextButtons = Array.from(order.querySelectorAll("[data-order-next]"));
  let activeVersionId = "industrial3";
  let compareVersionId = "industrial4";

  if (legacyTabs) {
    legacyTabs.remove();
  }
  const groupedChoices = [
    {
      id: "taladro",
      title: "Tambor o kit de actualizacion",
      text: "Empieza con tambor o actualiza el montaje cuando quieras mejorar estabilidad.",
      versionIds: ["tamborTaladro", "kitActualizacion"],
    },
    {
      id: "base",
      title: "Base soporte para taladro",
      text: "Una opcion directa para trabajar con mejor ergonomia sobre una mesa.",
      versionIds: ["baseSoporte"],
    },
    {
      id: "industrial",
      title: "Peladora industrial",
      text: "Cambia la capacidad segun el volumen que quieres sostener.",
      versionIds: ["industrial2", "industrial3", "industrial4", "industrial5"],
    },
  ];
  const groupDisplayState = {
    taladro: "tamborTaladro",
    base: "baseSoporte",
    industrial: "industrial3",
  };
  const comparisonMap = {
    tamborTaladro: "kitActualizacion",
    kitActualizacion: "baseSoporte",
    baseSoporte: "industrial2",
    industrial2: "industrial3",
    industrial3: "industrial4",
    industrial4: "industrial5",
    industrial5: "industrial4",
  };
  const versionOrder = ["tamborTaladro", "kitActualizacion", "baseSoporte", "industrial2", "industrial3", "industrial4", "industrial5"];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getVersion() {
    return peladoraPageConfig.versions.find((version) => version.id === activeVersionId) || peladoraPageConfig.versions[0];
  }

  function findVersion(versionId) {
    return peladoraPageConfig.versions.find((version) => version.id === versionId) || peladoraPageConfig.versions[0];
  }

  function getDisplayPrice(version) {
    return version.promoPrice || version.price;
  }

  function getQuantity() {
    const qty = Math.max(1, Math.min(20, Number(qtyInput.value) || 1));
    qtyInput.value = qty;
    return qty;
  }

  function setQuantity(nextQty) {
    qtyInput.value = Math.max(1, Math.min(20, Number(nextQty) || 1));
    render();
  }

  function openPanel(index) {
    orderPanels.forEach((panel, panelIndex) => {
      panel.open = panelIndex === index;
    });
  }

  function getGroup(versionId) {
    return groupedChoices.find((group) => group.versionIds.includes(versionId)) || groupedChoices[0];
  }

  function syncGroupDisplay() {
    const activeGroup = getGroup(activeVersionId);
    groupDisplayState[activeGroup.id] = activeVersionId;
  }

  function shiftGroupVersion(groupId, direction) {
    const group = groupedChoices.find((choice) => choice.id === groupId);
    if (!group || group.versionIds.length < 2) return;
    const currentId = groupDisplayState[group.id] || group.versionIds[0];
    const currentIndex = Math.max(0, group.versionIds.indexOf(currentId));
    const nextIndex = (currentIndex + direction + group.versionIds.length) % group.versionIds.length;
    const nextVersionId = group.versionIds[nextIndex];
    groupDisplayState[group.id] = nextVersionId;
    activeVersionId = nextVersionId;
    render();
  }

  function getCompareVersion() {
    if (compareVersionId === activeVersionId) {
      compareVersionId = comparisonMap[activeVersionId] || versionOrder.find((id) => id !== activeVersionId);
    }
    return findVersion(compareVersionId);
  }

  function shiftCompareVersion(direction) {
    const availableIds = versionOrder.filter((versionId) => versionId !== activeVersionId);
    const currentIndex = Math.max(0, availableIds.indexOf(compareVersionId));
    const nextIndex = (currentIndex + direction + availableIds.length) % availableIds.length;
    compareVersionId = availableIds[nextIndex];
    renderSpec();
  }

  function getCapacityLabel(version) {
    const capacityMatch = version.name.match(/(\d+\s*pollos\/min)/i);
    if (capacityMatch) return capacityMatch[1];
    if (version.id === "tamborTaladro") return "Entrada con taladro";
    if (version.id === "kitActualizacion") return "Actualizacion a base";
    if (version.id === "baseSoporte") return "Mejor ergonomia";
    return version.stage;
  }

  function renderChoiceCards(container) {
    if (!container) return;
    syncGroupDisplay();
    container.innerHTML = groupedChoices
      .map((group) => {
        const version = findVersion(groupDisplayState[group.id] || group.versionIds[0]);
        const isActive = version.id === activeVersionId;
        const badge = version.discountLabel ? `<em>${escapeHtml(version.discountLabel)}</em>` : "";
        const arrows =
          group.versionIds.length > 1
            ? `
              <div class="variant-stepper" aria-label="Cambiar opcion de ${escapeHtml(group.title)}">
                <button type="button" data-peladora-shift="${escapeHtml(group.id)}" data-direction="-1" aria-label="Ver opcion anterior">‹</button>
                <span>${escapeHtml(getCapacityLabel(version))}</span>
                <button type="button" data-peladora-shift="${escapeHtml(group.id)}" data-direction="1" aria-label="Ver opcion siguiente">›</button>
              </div>
            `
            : `<div class="variant-stepper is-static"><span>${escapeHtml(getCapacityLabel(version))}</span></div>`;
        return `
          <article class="version-choice-card ${isActive ? "is-active" : ""}">
            <button type="button" class="version-choice-main" data-peladora-select="${escapeHtml(version.id)}">
              <span>${escapeHtml(group.title)}</span>
              <strong>${escapeHtml(version.name)}</strong>
              <small>${escapeHtml(group.text)}</small>
              <b>${formatMoney(getDisplayPrice(version))}${version.shippingIncluded ? " · contraentrega segun cobertura" : " · envio no incluido"}</b>
              ${badge}
            </button>
            ${arrows}
          </article>
        `;
      })
      .join("");

    container.querySelectorAll("[data-peladora-select]").forEach((button) => {
      button.addEventListener("click", () => {
        activeVersionId = button.dataset.peladoraSelect;
        syncGroupDisplay();
        render();
      });
    });

    container.querySelectorAll("[data-peladora-shift]").forEach((button) => {
      button.addEventListener("click", () => {
        shiftGroupVersion(button.dataset.peladoraShift, Number(button.dataset.direction));
      });
    });
  }

  function renderSpec() {
    if (!specPanel) return;
    const version = getVersion();
    const comparison = getCompareVersion();
    const specs = Object.entries(version.specs)
      .map(([label, value]) => `<li><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></li>`)
      .join("");
    const comparisonRows = [
      ["Inversion", formatMoney(getDisplayPrice(version)), formatMoney(getDisplayPrice(comparison))],
      ["Capacidad", getCapacityLabel(version), getCapacityLabel(comparison)],
      ["Enfoque", version.includes, comparison.includes],
      ["Envio", version.shippingIncluded ? "Contraentrega segun cobertura" : "No incluido", comparison.shippingIncluded ? "Contraentrega segun cobertura" : "No incluido"],
    ]
      .map(
        ([label, current, target]) => `
          <li>
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(current)}</strong>
            <strong>${escapeHtml(target)}</strong>
          </li>
        `,
      )
      .join("");
    specPanel.innerHTML = `
      <div>
        <p class="eyebrow">${escapeHtml(version.stage)}</p>
        <h3>${escapeHtml(version.name)}</h3>
        <p>${escapeHtml(version.bestFor)}</p>
      </div>
      <ul class="spec-list">${specs}</ul>
      <div class="comparison-vs">
        <div>
          <span>Tu seleccion</span>
          <strong>${escapeHtml(version.name)}</strong>
        </div>
        <div class="comparison-target">
          <span>Comparala con</span>
          <div>
            <button type="button" data-compare-shift="-1" aria-label="Comparar con opcion anterior">‹</button>
            <strong>${escapeHtml(comparison.name)} <small>${escapeHtml(getCapacityLabel(comparison))}</small></strong>
            <button type="button" data-compare-shift="1" aria-label="Comparar con opcion siguiente">›</button>
          </div>
          <p>Navega todas las otras versiones sin cambiar tu seleccion.</p>
        </div>
        <ul>${comparisonRows}</ul>
      </div>
    `;

    specPanel.querySelectorAll("[data-compare-shift]").forEach((button) => {
      button.addEventListener("click", () => shiftCompareVersion(Number(button.dataset.compareShift)));
    });
  }

  function renderFaqs() {
    if (!faqList) return;
    faqList.innerHTML = peladoraPageConfig.faqs
      .map(
        (faq, index) => `
          <details${index === 0 ? " open" : ""}>
            <summary>${escapeHtml(faq.question)}</summary>
            <p>${escapeHtml(faq.answer)}</p>
          </details>
        `,
      )
      .join("");
  }

  function render() {
    const version = getVersion();
    const qty = getQuantity();
    const subtotal = getDisplayPrice(version) * qty;
    const quantityText = `${qty} ${qty === 1 ? "equipo" : "equipos"}`;
    const shippingText = version.shippingIncluded ? "pago contraentrega si hay cobertura" : "envio no incluido";
    const message = `Hola Allpa Tech, quiero pedir ${quantityText} de ${version.name}. Total estimado ${formatMoney(subtotal)} (${shippingText}). Quiero confirmar disponibilidad, garantia, retoma y envio.`;
    const href = `https://wa.me/573152112644?text=${encodeURIComponent(message)}`;

    if (compareVersionId === activeVersionId) {
      compareVersionId = comparisonMap[activeVersionId] || "industrial3";
    }
    renderChoiceCards(options);
    renderSpec();

    title.textContent = version.name;
    includes.textContent = version.includes;
    quantity.textContent = quantityText;
    total.textContent = formatMoney(subtotal);
    note.textContent = version.note;
    whatsapp.href = href;

    if (floatingSelection && floatingTotal && floatingWhatsapp) {
      floatingSelection.textContent = version.name;
      floatingTotal.textContent = formatMoney(subtotal);
      floatingWhatsapp.href = href;
    }

    if (floatingQty) floatingQty.textContent = qty;
  }

  orderPanels.forEach((panel) => {
    panel.addEventListener("toggle", () => {
      if (!panel.open) return;
      orderPanels.forEach((otherPanel) => {
        if (otherPanel !== panel) otherPanel.open = false;
      });
    });
  });

  orderNextButtons.forEach((button) => {
    button.addEventListener("click", () => openPanel(Number(button.dataset.orderNext)));
  });

  order.addEventListener("change", (event) => {
    render();
  });
  minusButton.addEventListener("click", () => setQuantity(Number(qtyInput.value) - 1));
  plusButton.addEventListener("click", () => setQuantity(Number(qtyInput.value) + 1));
  floatingMinus?.addEventListener("click", () => setQuantity(Number(qtyInput.value) - 1));
  floatingPlus?.addEventListener("click", () => setQuantity(Number(qtyInput.value) + 1));
  qtyInput.addEventListener("input", render);
  renderFaqs();
  render();
}

const escaldadorPageConfig = {
  versions: [
    {
      id: "uno",
      name: "Escaldador de 1 pollo",
      stage: "Etapa Emprendedor",
      price: null,
      promoPrice: null,
      includes: "Tanque a gas con control adaptativo, electrovalvula y piloto",
      note: "El asesor confirma precio, envio y disponibilidad segun ciudad.",
      bestFor: "Para ordenar un proceso pequeño y estabilizar temperatura antes del pelado.",
      specs: {
        Combustible: "Gas",
        Control: "Adaptativo de encendido y apagado",
        Valvula: "Electrovalvula para abrir y cerrar gas",
        Encendido: "Piloto automatico segun orden del controlador",
        "Memoria termica": "Aprovecha el calor acumulado del agua",
        Aislamiento: "Chaqueta de fibra de vidrio sellada",
        Ahorro: "Hasta 70% menos consumo de gas al sostener temperatura",
        Funcion: "Mantener temperatura estable para escaldado",
      },
    },
    {
      id: "tres",
      name: "Escaldador de 3 pollos",
      stage: "Planta Inicial",
      price: null,
      promoPrice: null,
      includes: "Mayor capacidad con control adaptativo de gas",
      note: "Ideal para mayor flujo. El asesor confirma precio, envio y disponibilidad.",
      bestFor: "Para operaciones que ya necesitan escaldar mas volumen antes de pasar a peladora.",
      specs: {
        Combustible: "Gas",
        Control: "Adaptativo de encendido y apagado",
        Valvula: "Electrovalvula para abrir y cerrar gas",
        Encendido: "Piloto automatico segun orden del controlador",
        "Memoria termica": "Aprovecha el calor acumulado del agua",
        Aislamiento: "Chaqueta de fibra de vidrio sellada",
        Ahorro: "Hasta 70% menos consumo de gas al sostener temperatura",
        Funcion: "Mantener temperatura estable para escaldado",
      },
    },
  ],
  faqs: [
    {
      question: "¿Por que importa mantener temperatura estable?",
      answer: "Porque el escaldado prepara la pluma para desprenderse mejor. Si la temperatura cambia demasiado, el pelado puede volverse mas lento o irregular.",
    },
    {
      question: "¿Que es el choque termico?",
      answer: "Es el cambio controlado de temperatura que ayuda a preparar la piel y la pluma antes de pasar a la peladora. La estabilidad hace que ese paso sea mas repetible.",
    },
    {
      question: "¿Como ahorra gas?",
      answer: "El controlador ajusta tiempos de encendido y apagado usando la memoria termica del agua. Una vez el agua llega a temperatura, puede reducir hasta 70% el consumo de gas mientras sostiene la misma temperatura.",
    },
    {
      question: "¿Para que sirve la chaqueta de fibra de vidrio?",
      answer: "La chaqueta sellada ayuda a conservar el calor de la olla y reduce la perdida de temperatura. Asi el sistema no tiene que recuperar calor todo el tiempo.",
    },
    {
      question: "¿Como enciende y apaga el gas?",
      answer: "Usa una electrovalvula para abrir y cerrar el paso de gas, y un piloto que permite encendido automatico segun lo que ordena el controlador.",
    },
    {
      question: "¿Por que compararlo con empresas grandes?",
      answer: "Porque en plantas industrializadas el escaldado se controla por temperatura y tiempo. La idea es llevar ese criterio a una escala accesible para tu proyecto.",
    },
  ],
};

function initEscaldadorPage() {
  const order = document.querySelector('[data-product-order="escaldador"]');
  if (!order) return;

  const options = order.querySelector("[data-escaldador-options]");
  const tabs = document.querySelector("[data-escaldador-tabs]");
  const specPanel = document.querySelector("[data-escaldador-spec]");
  const faqList = document.querySelector("[data-escaldador-faq-list]");
  const qtyInput = order.querySelector("[data-order-qty]");
  const minusButton = order.querySelector("[data-qty-minus]");
  const plusButton = order.querySelector("[data-qty-plus]");
  const title = order.querySelector("[data-order-title]");
  const includes = order.querySelector("[data-order-includes]");
  const quantity = order.querySelector("[data-order-quantity]");
  const total = order.querySelector("[data-order-total]");
  const note = order.querySelector("[data-order-note]");
  const whatsapp = order.querySelector("[data-order-whatsapp]");
  const floatingSelection = document.querySelector("[data-floating-selection]");
  const floatingTotal = document.querySelector("[data-floating-total]");
  const floatingWhatsapp = document.querySelector("[data-floating-whatsapp]");
  const floatingQty = document.querySelector("[data-floating-qty]");
  const floatingMinus = document.querySelector("[data-floating-qty-minus]");
  const floatingPlus = document.querySelector("[data-floating-qty-plus]");
  const orderPanels = Array.from(order.querySelectorAll(".order-panel"));
  const orderNextButtons = Array.from(order.querySelectorAll("[data-order-next]"));
  let activeVersionId = "tres";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getVersion() {
    return escaldadorPageConfig.versions.find((version) => version.id === activeVersionId) || escaldadorPageConfig.versions[0];
  }

  function getDisplayPrice(version) {
    return version.promoPrice || version.price;
  }

  function formatNullablePrice(value) {
    return value ? formatMoney(value) : "Por confirmar";
  }

  function getQuantity() {
    const qty = Math.max(1, Math.min(20, Number(qtyInput.value) || 1));
    qtyInput.value = qty;
    return qty;
  }

  function setQuantity(nextQty) {
    qtyInput.value = Math.max(1, Math.min(20, Number(nextQty) || 1));
    render();
  }

  function openPanel(index) {
    orderPanels.forEach((panel, panelIndex) => {
      panel.open = panelIndex === index;
    });
  }

  function renderOptions() {
    if (!options) return;
    options.innerHTML = escaldadorPageConfig.versions
      .map((version) => `
        <label>
          <input type="radio" name="escaldadorVersion" value="${escapeHtml(version.id)}"${version.id === activeVersionId ? " checked" : ""} />
          <strong>${escapeHtml(version.name)}</strong>
          <span>${escapeHtml(version.stage)} · ${formatNullablePrice(getDisplayPrice(version))}</span>
          <span>Gas con control adaptativo</span>
        </label>
      `)
      .join("");
  }

  function renderTabs() {
    if (!tabs) return;
    tabs.innerHTML = escaldadorPageConfig.versions
      .map((version) => `
        <button type="button" class="${version.id === activeVersionId ? "is-active" : ""}" data-escaldador-tab="${escapeHtml(version.id)}">
          <span>${escapeHtml(version.stage)}</span>
          <strong>${escapeHtml(version.name)}</strong>
        </button>
      `)
      .join("");

    tabs.querySelectorAll("[data-escaldador-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        activeVersionId = button.dataset.escaldadorTab;
        render();
      });
    });
  }

  function renderSpec() {
    if (!specPanel) return;
    const version = getVersion();
    const specs = Object.entries(version.specs)
      .map(([label, value]) => `<li><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></li>`)
      .join("");
    specPanel.innerHTML = `
      <div>
        <p class="eyebrow">${escapeHtml(version.stage)}</p>
        <h3>${escapeHtml(version.name)}</h3>
        <p>${escapeHtml(version.bestFor)}</p>
      </div>
      <ul class="spec-list">${specs}</ul>
      <div class="comparison-vs">
        <div>
          <span>Como trabaja</span>
          <strong>Controla temperatura y gas automaticamente</strong>
        </div>
        <div>
          <span>Antes de pelar</span>
          <strong>Busca un choque termico mas estable</strong>
        </div>
        <ul>
          <li><span>Industrializado</span><strong>Temperatura + tiempo</strong><strong>Proceso repetible</strong></li>
          <li><span>Allpa Tech</span><strong>Control adaptativo</strong><strong>Escala emprendedor/planta inicial</strong></li>
        </ul>
      </div>
    `;
  }

  function renderFaqs() {
    if (!faqList) return;
    faqList.innerHTML = escaldadorPageConfig.faqs
      .map((faq, index) => `
        <details${index === 0 ? " open" : ""}>
          <summary>${escapeHtml(faq.question)}</summary>
          <p>${escapeHtml(faq.answer)}</p>
        </details>
      `)
      .join("");
  }

  function render() {
    const version = getVersion();
    const qty = getQuantity();
    const unitPrice = getDisplayPrice(version);
    const subtotal = unitPrice ? unitPrice * qty : null;
    const quantityText = `${qty} ${qty === 1 ? "equipo" : "equipos"}`;
    const totalText = formatNullablePrice(subtotal);
    const message = `Hola Allpa Tech, quiero cotizar ${quantityText} de ${version.name}. Quiero confirmar precio, envio, disponibilidad y capacidad recomendada para mi proceso.`;
    const href = `https://wa.me/573152112644?text=${encodeURIComponent(message)}`;

    renderOptions();
    renderTabs();
    renderSpec();

    title.textContent = version.name;
    includes.textContent = version.includes;
    quantity.textContent = quantityText;
    total.textContent = totalText;
    note.textContent = version.note;
    whatsapp.href = href;

    if (floatingSelection && floatingTotal && floatingWhatsapp) {
      floatingSelection.textContent = version.name;
      floatingTotal.textContent = totalText;
      floatingWhatsapp.href = href;
    }

    if (floatingQty) floatingQty.textContent = qty;
  }

  orderPanels.forEach((panel) => {
    panel.addEventListener("toggle", () => {
      if (!panel.open) return;
      orderPanels.forEach((otherPanel) => {
        if (otherPanel !== panel) otherPanel.open = false;
      });
    });
  });

  orderNextButtons.forEach((button) => {
    button.addEventListener("click", () => openPanel(Number(button.dataset.orderNext)));
  });

  order.addEventListener("change", (event) => {
    if (event.target.name === "escaldadorVersion") {
      activeVersionId = event.target.value;
    }
    render();
  });
  minusButton.addEventListener("click", () => setQuantity(Number(qtyInput.value) - 1));
  plusButton.addEventListener("click", () => setQuantity(Number(qtyInput.value) + 1));
  floatingMinus?.addEventListener("click", () => setQuantity(Number(qtyInput.value) - 1));
  floatingPlus?.addEventListener("click", () => setQuantity(Number(qtyInput.value) + 1));
  qtyInput.addEventListener("input", render);
  renderFaqs();
  render();
}

initRetakeSimulator();
initStageTabs();
initGrowthCarousel();
initProductCards();
initProductGallery();
initSalesCarousels();
initConesOrder();
initAturdidorPage();
initPeladoraPage();
initEscaldadorPage();
