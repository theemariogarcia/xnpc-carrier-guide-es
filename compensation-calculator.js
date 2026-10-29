(() => {
  "use strict";

  const data = window.XNPC_COMP_DATA;
  if (!data) return;

  const $ = (id) => document.getElementById(id);
  const ui = {
    en: {
      tab: "Compensation Calculator",
      eyebrow: "FIRST-YEAR ESTIMATE",
      title: "Carrier Compensation Calculator",
      lead: "Enter your FFL comp level and the carrier-confirmed annual premium. Rates and estimated first-year gross compensation update automatically.",
      compLevel: "FFL comp level",
      chooseLevel: "Select comp level",
      annualPremium: "Annual premium",
      carrier: "Carrier",
      allCarriers: "All carriers",
      empty: "Enter a comp level and annual premium to see estimated earnings by carrier and product.",
      invalidPremium: "Enter an annual premium greater than $0.",
      summary: "Estimated first-year compensation",
      ranking: "Highest commission to lowest",
      compared: "products compared",
      rate: "Comp rate",
      earnings: "Estimated earnings",
      source: "Rates loaded from FFL Comp Master Sheet — Admin Copy.",
      disclaimer: "Estimate only. Use the annual premium and product confirmed by the carrier. Actual compensation can differ because of advances, chargebacks, product rules, bonuses, taxes, or schedule changes."
    },
    es: {
      tab: "Calculadora de compensación",
      eyebrow: "ESTIMADO DE PRIMER AÑO",
      title: "Calculadora de compensación por carrier",
      lead: "Ingresa tu nivel de comp FFL y la prima anual confirmada por el carrier. Las tasas y la compensación bruta estimada del primer año se actualizan automáticamente.",
      compLevel: "Nivel de comp FFL",
      chooseLevel: "Selecciona el nivel de comp",
      annualPremium: "Prima anual",
      carrier: "Carrier",
      allCarriers: "Todos los carriers",
      empty: "Ingresa el nivel de comp y la prima anual para ver el ingreso estimado por carrier y producto.",
      invalidPremium: "Ingresa una prima anual mayor de $0.",
      summary: "Compensación estimada del primer año",
      ranking: "Mayor comisión a menor comisión",
      compared: "productos comparados",
      rate: "Tasa de comp",
      earnings: "Ingreso estimado",
      source: "Tasas cargadas de FFL Comp Master Sheet — Admin Copy.",
      disclaimer: "Solo es un estimado. Usa la prima anual y el producto confirmados por el carrier. La compensación real puede variar por anticipos, chargebacks, reglas del producto, bonos, impuestos o cambios en la tabla."
    }
  };

  function language() {
    return ($("language") && $("language").value) || "es";
  }

  function text() {
    return ui[language()] || ui.es;
  }

  function formatRate(rate) {
    return `${new Intl.NumberFormat(language() === "es" ? "es-US" : "en-US", { maximumFractionDigits: 2 }).format(rate)}%`;
  }

  function formatMoney(amount) {
    return new Intl.NumberFormat(language() === "es" ? "es-US" : "en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  function populateControls() {
    const level = $("comp-level");
    const selectedLevel = level.value;
    level.innerHTML = "";
    const prompt = document.createElement("option");
    prompt.value = "";
    prompt.textContent = text().chooseLevel;
    level.appendChild(prompt);
    [...data.levels].reverse().forEach((value) => {
      const option = document.createElement("option");
      option.value = String(value);
      option.textContent = `${value}%`;
      level.appendChild(option);
    });
    level.value = selectedLevel;

    const carrier = $("comp-carrier");
    const selectedCarrier = carrier.value;
    carrier.innerHTML = "";
    const all = document.createElement("option");
    all.value = "";
    all.textContent = text().allCarriers;
    carrier.appendChild(all);
    data.carriers.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.name;
      carrier.appendChild(option);
    });
    carrier.value = selectedCarrier;
  }

  function render() {
    const level = $("comp-level").value;
    const premiumRaw = $("comp-ap").value.trim();
    const premium = Number(premiumRaw);
    const selectedCarrier = $("comp-carrier").value;
    const results = $("comp-results");
    const validation = $("comp-validation");
    results.innerHTML = "";
    validation.textContent = "";

    if (!level || !premiumRaw) {
      results.className = "finder-empty";
      results.textContent = text().empty;
      return;
    }
    if (!Number.isFinite(premium) || premium <= 0) {
      results.className = "finder-empty";
      results.textContent = text().empty;
      validation.textContent = text().invalidPremium;
      return;
    }

    const carriers = data.carriers.filter((carrier) => !selectedCarrier || carrier.id === selectedCarrier);
    const productCount = carriers.reduce((sum, carrier) => sum + carrier.products.length, 0);
    results.className = "comp-results";

    const summary = document.createElement("div");
    summary.className = "results-summary comp-summary";
    const heading = document.createElement("h3");
    heading.textContent = text().summary;
    const profile = document.createElement("span");
    profile.textContent = `${level}% · ${formatMoney(premium)} AP · ${productCount} ${text().compared}`;
    summary.append(heading, profile);
    results.appendChild(summary);

    const choices = carriers.flatMap((carrier) => carrier.products.map((product) => ({
      carrier,
      product,
      rate: product.rates[level]
    }))).sort((a, b) => b.rate - a.rate
      || a.carrier.name.localeCompare(b.carrier.name)
      || a.product.name.localeCompare(b.product.name)
      || a.product.variant.localeCompare(b.product.variant));

    const section = document.createElement("section");
    section.className = "comp-carrier-group";
    const title = document.createElement("h3");
    title.textContent = selectedCarrier ? carriers[0].name : text().ranking;
    const grid = document.createElement("div");
    grid.className = "comp-result-grid";
    choices.forEach(({ carrier, product, rate }) => {
        const card = document.createElement("article");
        card.className = "comp-result";
        const identity = document.createElement("div");
        identity.className = "comp-product";
        const name = document.createElement("strong");
        name.textContent = carrier.name;
        identity.appendChild(name);
        const productLabel = document.createElement("span");
        productLabel.textContent = product.variant ? `${product.name} · ${product.variant}` : product.name;
        identity.appendChild(productLabel);
        const rateBlock = document.createElement("div");
        rateBlock.className = "comp-metric";
        const rateLabel = document.createElement("span");
        rateLabel.textContent = text().rate;
        const rateValue = document.createElement("strong");
        rateValue.className = "comp-rate";
        rateValue.textContent = formatRate(rate);
        rateBlock.append(rateLabel, rateValue);
        const earningsBlock = document.createElement("div");
        earningsBlock.className = "comp-metric comp-money";
        const earningsLabel = document.createElement("span");
        earningsLabel.textContent = text().earnings;
        const earningsValue = document.createElement("strong");
        earningsValue.className = "comp-earnings";
        earningsValue.textContent = formatMoney(premium * rate / 100);
        earningsBlock.append(earningsLabel, earningsValue);
        card.append(identity, rateBlock, earningsBlock);
        grid.appendChild(card);
    });
    section.append(title, grid);
    results.appendChild(section);
  }

  function applyLanguage() {
    const copy = text();
    document.querySelectorAll("[data-comp-i18n]").forEach((element) => {
      const value = copy[element.dataset.compI18n];
      if (value) element.textContent = value;
    });
    populateControls();
    render();
  }

  $("comp-level").addEventListener("change", render);
  $("comp-ap").addEventListener("input", render);
  $("comp-carrier").addEventListener("change", render);
  if ($("language")) $("language").addEventListener("change", applyLanguage);

  applyLanguage();
})();
