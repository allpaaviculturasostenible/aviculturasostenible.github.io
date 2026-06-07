const volumeInput = document.querySelector("#volume");
const volumeOutput = document.querySelector("#volumeOutput");
const finderForm = document.querySelector("#finderForm");
const chatWindow = document.querySelector("#chatWindow");
const resultPanel = document.querySelector("#resultPanel");
const carousel = document.querySelector("[data-carousel]");

const productLinks = {
  conos: "productos/conos.html",
  aturdidor: "productos/aturdidor.html",
  escaldador: "productos/escaldador.html",
  pelador: "productos/pelador.html",
  peladoraTaladro: "productos/peladora-taladro.html",
  sensores: "productos/sensores.html",
  crianza: "productos/crianza.html",
  retoma: "productos/retoma.html",
  reacondicionados: "productos/reacondicionados.html",
};

const productStatus = {
  conos: "Disponible",
  aturdidor: "Disponible · aplica retoma",
  escaldador: "Disponible · aplica retoma",
  pelador: "Disponible · aplica retoma",
  peladoraTaladro: "En producción · aplica retoma",
  sensores: "Próximamente",
  crianza: "Próximamente",
  retoma: "Disponible",
  reacondicionados: "Próximamente",
};

const recommendations = {
  emprendedor: {
    title: "Etapa Emprendedor",
    summary:
      "Tu mejor inicio es ordenar el beneficio con conos. Cuando tu flujo lo pida, puedes sumar aturdidor y esperar la peladora con conexión a taladro.",
    products: ["conos", "aturdidor", "peladoraTaladro"],
  },
  planta: {
    title: "Etapa Planta Inicial",
    summary:
      "Tu operación ya necesita más capacidad. Organiza el flujo con conos, varios aturdidores, escaldadora de 3 pollos y peladora automática de 2 pollos.",
    products: ["conos", "aturdidor", "escaldador", "pelador"],
  },
  control: {
    title: "Producción Controlada",
    summary:
      "Esta línea todavía no está disponible, pero será útil cuando quieras medir temperatura, pH del agua y calidad de aire para decidir con datos.",
    products: ["sensores"],
  },
  crianza: {
    title: "Crianza con Tecnología",
    summary:
      "Esta línea futura está pensada para fortalecer el inicio del ciclo con incubación, cunas y automatización.",
    products: ["crianza"],
  },
  retoma: {
    title: "Retoma Allpa Tech",
    summary:
      "Si ya tienes equipos Allpa Tech y tu producción creció, puedes solicitar evaluación para avanzar a una solución de mayor capacidad.",
    products: ["retoma"],
  },
  reacondicionados: {
    title: "Línea Reacondicionada",
    summary:
      "Esta línea todavía no está habilitada. En el futuro podrá abrir una entrada de menor inversión cuando haya inventario reacondicionado.",
    products: ["reacondicionados"],
  },
};

const productNames = {
  conos: "Conos",
  aturdidor: "Aturdidor",
  escaldador: "Escaldador",
  pelador: "Peladora automática",
  peladoraTaladro: "Peladora de taladro",
  sensores: "Sensores",
  crianza: "Crianza tecnológica",
  retoma: "Retoma Allpa Tech",
  reacondicionados: "Reacondicionados",
};

function addBubble(text, type = "bot") {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${type}`;
  bubble.textContent = text;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function getStage(volume, priority) {
  if (priority === "control") return "control";
  if (priority === "crianza") return "crianza";
  if (priority === "actualizacion") return "retoma";
  if (priority === "reacondicionados") return "reacondicionados";
  return volume <= 300 ? "emprendedor" : "planta";
}

function renderResult(stage, volume, priority) {
  const data = recommendations[stage];
  const links = data.products
    .map(
      (product) => `<a href="${productLinks[product]}" class="${productStatus[product].includes("Disponible") ? "" : "locked-link"}">
        <strong>${productNames[product]}</strong>
        <span>${productStatus[product]}</span>
      </a>`
    )
    .join("");

  resultPanel.hidden = false;
  resultPanel.innerHTML = `
    <p class="eyebrow">Tu ruta sugerida</p>
    <h3>${data.title}</h3>
    <p>${data.summary}</p>
    <div class="result-links">${links}</div>
    <a class="button primary full" href="https://wa.me/573152112644?text=${encodeURIComponent(
      `Hola Allpa Tech, proceso ${volume} pollos al mes y quiero mejorar ${priority}. Quiero revisar mi siguiente paso en Allpa Crece.`
    )}" target="_blank" rel="noreferrer">Revisar mi siguiente paso por WhatsApp</a>
  `;
}

volumeInput.addEventListener("input", () => {
  volumeOutput.value = volumeInput.value;
});

finderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(finderForm);
  const volume = Number(formData.get("volume"));
  const priority = formData.get("priority");
  const stage = getStage(volume, priority);
  const data = recommendations[stage];

  addBubble(`Proceso ${volume} pollos al mes y quiero mejorar ${priority}.`, "user");
  addBubble(`${data.title}: ${data.summary}`);
  renderResult(stage, volume, priority);
});

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

initGrowthCarousel();
