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
  sensorTemperatura: "productos/sensores.html",
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
  sensorTemperatura: {
    name: "Sensor de temperatura con sonido",
    status: "Disponible",
    note: "Indica cuando llegas a la temperatura objetivo para escaldar.",
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
    order.push(createStep("sensorTemperatura", "Cotizas el sensor para saber cuándo llegas a la temperatura objetivo."));
    if (volume <= 300 && buyStyle === "actualizable") {
      order.push(createStep("escaldadorUno", "Luego puedes pasar a un escaldador compacto de un pollo."));
    }
    order.push(createStep("escaldadorTres", "Cuando sube el volumen, pasas al escaldador grande de 3 pollos."));
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

initRetakeSimulator();
initStageTabs();
initGrowthCarousel();
initProductCards();
