(() => {
  "use strict";

  const data = window.XNPC_UW_DATA;
  if (!data) return;

  const $ = (id) => document.getElementById(id);
  const outcomeOrder = ["favorable", "limited", "gi", "verify", "na", "crossref", "decline"];
  const selectedConditions = new Set();

  const ui = {
    en: {
      finderTab: "Underwriting Finder", placementTab: "Immigration & Product Guide", finderEyebrow: "2026 PRE-SCREEN",
      finderTitle: "Final Expense Underwriting Finder", finderLead: "Enter the client profile and add one or more health conditions. Options are ranked from best to worst using the guide’s original color system.",
      producerOnly: "Producer use only", ageLabel: "Age", feetLabel: "Height — feet", inchesLabel: "Height — inches", weightLabel: "Weight (lb)", tobaccoLabel: "Tobacco use", no: "No", yes: "Yes",
      conditionLabel: "Health condition", chooseCondition: "Choose a condition", addCondition: "Add condition", clear: "Clear", rankOptions: "Rank options",
      empty: "Enter age, height, and weight to compare carriers.", sourceNote: "Carrier rule details currently preserve the exact English source wording from the uploaded 2026 guide.",
      required: "Enter a valid age, height, and weight.", results: "Ranked carrier options", profile: "Profile", details: "View source rules and decision details", noConditions: "No health condition selected",
      ageReason: "Age eligible", ageIneligible: "Outside product age range", tobaccoAge: "Outside Americo tobacco age range", chartHeight: "Uses the nearest lower published chart row",
      build: "Build", health: "Health", remove: "Remove", exactSource: "Exact source rule", overall: "Overall pre-screen", options: "options compared",
      favorable: "Level / Day-1 / Select / OK / Standard", limited: "Modified / Graded / ROP / Basic", gi: "GI Route / Guaranteed Issue", verify: "Check Meds / See Condition", na: "N/A / Not asked", crossref: "See Other Section", decline: "Decline / Ineligible"
    },
    es: {
      finderTab: "Buscador de suscripción", placementTab: "Guía migratoria y de productos", finderEyebrow: "PRE-EVALUACIÓN 2026",
      finderTitle: "Buscador de suscripción de gastos finales", finderLead: "Ingresa el perfil del cliente y agrega una o más condiciones de salud. Las opciones se ordenan de mejor a peor con el sistema de colores original de la guía.",
      producerOnly: "Solo para productores", ageLabel: "Edad", feetLabel: "Estatura — pies", inchesLabel: "Estatura — pulgadas", weightLabel: "Peso (lb)", tobaccoLabel: "Uso de tabaco", no: "No", yes: "Sí",
      conditionLabel: "Condición de salud", chooseCondition: "Selecciona una condición", addCondition: "Agregar condición", clear: "Limpiar", rankOptions: "Ordenar opciones",
      empty: "Ingresa edad, estatura y peso para comparar carriers.", sourceNote: "Los detalles de las reglas conservan por ahora el texto exacto en inglés de la guía 2026 cargada.",
      required: "Ingresa una edad, estatura y peso válidos.", results: "Opciones de carriers ordenadas", profile: "Perfil", details: "Ver reglas fuente y detalles de decisión", noConditions: "Sin condición de salud seleccionada",
      ageReason: "Edad elegible", ageIneligible: "Fuera del rango de edad del producto", tobaccoAge: "Fuera del rango de edad de Americo para tabaco", chartHeight: "Usa la fila publicada inmediatamente inferior",
      build: "Complexión", health: "Salud", remove: "Quitar", exactSource: "Regla exacta de la fuente", overall: "Pre-evaluación general", options: "opciones comparadas",
      favorable: "Nivelada / Día 1 / Select / OK / Standard", limited: "Modificada / Gradual / ROP / Basic", gi: "Ruta GI / Emisión garantizada", verify: "Revisar medicamentos / Ver condición", na: "N/A / No preguntado", crossref: "Ver otra sección", decline: "Declinación / No elegible"
    }
  };

  const conditionEs = {
    "AFib / Irregular Heartbeat":"Fibrilación auricular / Ritmo irregular", "AIDS / HIV / ARC":"SIDA / VIH / ARC", "Alcohol / Drug Abuse":"Abuso de alcohol / drogas", "ALS (Lou Gehrig’s)":"ELA (Lou Gehrig)",
    "Alzheimer’s / Dementia":"Alzheimer / Demencia", "Amputation":"Amputación", "Aneurysm":"Aneurisma", "Angina (Chest Pain)":"Angina (dolor de pecho)", "Angioplasty":"Angioplastia", "Arthritis (incl. RA)":"Artritis (incl. artritis reumatoide)",
    "Asthma (Chronic)":"Asma (crónica)", "Autism":"Autismo", "Bipolar Disorder":"Trastorno bipolar", "Black Lung":"Neumoconiosis / Pulmón negro", "Blood Clots / DVT":"Coágulos / TVP", "Bone Marrow Transplant":"Trasplante de médula ósea",
    "Bronchitis (Chronic)":"Bronquitis crónica", "Cancer (not Basal Cell)":"Cáncer (no basocelular)", "Cardiomyopathy / Heart Disease":"Cardiomiopatía / Enfermedad cardíaca", "Cerebral Palsy":"Parálisis cerebral", "CHF / Diastolic HF":"Insuficiencia cardíaca / IC diastólica",
    "Chronic Pain (Narcotics)":"Dolor crónico (narcóticos)", "Cirrhosis":"Cirrosis", "COPD":"EPOC", "Coronary Artery Disease":"Enfermedad arterial coronaria", "Crohn’s Disease":"Enfermedad de Crohn", "Cystic Fibrosis":"Fibrosis quística", "Depression":"Depresión",
    "Diabetes (Type 1 / Type 2)":"Diabetes (tipo 1 / tipo 2)", "Diabetic Complications":"Complicaciones diabéticas", "Dialysis (Kidney)":"Diálisis renal", "Down’s Syndrome":"Síndrome de Down", "DUI / Reckless Driving":"DUI / Conducción imprudente", "Emphysema":"Enfisema",
    "Epilepsy / Seizures":"Epilepsia / Convulsiones", "Felony":"Delito grave", "Heart Attack (MI)":"Ataque cardíaco (infarto)", "Heart Surgery / CABG":"Cirugía cardíaca / Bypass", "Heart Valve Replacement":"Reemplazo de válvula cardíaca", "Hepatitis A":"Hepatitis A", "Hepatitis B":"Hepatitis B", "Hepatitis C":"Hepatitis C",
    "Huntington’s Disease":"Enfermedad de Huntington", "Illegal Drug Use":"Uso de drogas ilegales", "Jail / Incarcerated":"Cárcel / Encarcelamiento", "Kidney Disease / Failure":"Enfermedad / Insuficiencia renal", "Liver Disease":"Enfermedad hepática", "Lupus (SLE)":"Lupus (LES)", "Melanoma":"Melanoma", "Mental Incapacity":"Incapacidad mental",
    "Multiple Sclerosis":"Esclerosis múltiple", "Neuropathy":"Neuropatía", "Obesity (BMI)":"Obesidad (IMC)", "Organ Transplant":"Trasplante de órgano", "Oxygen Use":"Uso de oxígeno", "Pacemaker / Defibrillator":"Marcapasos / Desfibrilador", "PAD / PVD":"EAP / EVP", "Pancreatitis":"Pancreatitis", "Parkinson’s Disease":"Enfermedad de Parkinson",
    "Parole / Probation":"Libertad condicional / Probatoria", "PTSD":"TEPT", "Pulmonary Fibrosis":"Fibrosis pulmonar", "Sarcoidosis":"Sarcoidosis", "Schizophrenia":"Esquizofrenia", "Sickle Cell Anemia":"Anemia falciforme", "Sleep Apnea (CPAP)":"Apnea del sueño (CPAP)", "Stent (Coronary)":"Stent coronario", "Stroke / TIA":"Derrame cerebral / AIT",
    "Terminal Illness":"Enfermedad terminal", "Tuberculosis":"Tuberculosis", "Ulcerative Colitis":"Colitis ulcerativa", "Wheelchair / Walker":"Silla de ruedas / Andador"
  };

  function language() {
    return ($("language") && $("language").value) || "es";
  }

  function text() {
    return ui[language()] || ui.es;
  }

  function displayCondition(condition) {
    return language() === "es" ? (conditionEs[condition.name] || condition.name) : condition.name;
  }

  function setFinderLanguage() {
    const t = text();
    document.querySelectorAll("[data-uw-i18n]").forEach((element) => {
      const value = t[element.dataset.uwI18n];
      if (value) element.textContent = value;
    });
    populateConditionSelect();
    renderSelectedConditions();
    renderLegend();
  }

  function populateConditionSelect() {
    const select = $("uw-condition");
    const previous = select.value;
    select.innerHTML = "";
    const prompt = document.createElement("option");
    prompt.value = "";
    prompt.textContent = text().chooseCondition;
    select.appendChild(prompt);
    [...data.conditions].sort((a, b) => displayCondition(a).localeCompare(displayCondition(b), language())).forEach((condition) => {
      const option = document.createElement("option");
      option.value = condition.id;
      option.textContent = displayCondition(condition);
      select.appendChild(option);
    });
    select.value = previous;
  }

  function renderSelectedConditions() {
    const container = $("uw-selected");
    container.innerHTML = "";
    selectedConditions.forEach((id) => {
      const condition = data.conditions.find((item) => item.id === id);
      if (!condition) return;
      const chip = document.createElement("span");
      chip.className = "chip condition-chip";
      const label = document.createElement("span");
      label.textContent = displayCondition(condition);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.setAttribute("aria-label", `${text().remove}: ${displayCondition(condition)}`);
      remove.textContent = "×";
      remove.addEventListener("click", () => {
        selectedConditions.delete(id);
        renderSelectedConditions();
      });
      chip.append(label, remove);
      container.appendChild(chip);
    });
  }

  function renderLegend() {
    const legend = $("uw-legend");
    legend.innerHTML = "";
    outcomeOrder.forEach((key) => {
      const item = document.createElement("span");
      item.className = "legend-item";
      const dot = document.createElement("span");
      dot.className = "legend-dot";
      dot.style.background = data.outcomes[key].color;
      dot.style.color = data.outcomes[key].color;
      const label = document.createElement("span");
      label.textContent = text()[key];
      item.append(dot, label);
      legend.appendChild(item);
    });
  }

  function nearestPublishedRow(chart, height) {
    const rows = chart.rows || [];
    const eligible = rows.filter((row) => row[0] <= height);
    if (eligible.length) return eligible[eligible.length - 1];
    return rows[0] || null;
  }

  function buildResult(carrier, height, weight, age) {
    const chart = data.buildCharts[carrier.id];
    if (!chart || chart.type === "none") {
      return { outcome: chart ? chart.outcome : "verify", tier: chart ? chart.tier : "Verify build", rowHeight: null };
    }
    const row = nearestPublishedRow(chart, height);
    if (!row) return { outcome: "verify", tier: "Verify build", rowHeight: null };
    const values = { height: row[0] };
    chart.columns.forEach((key, index) => { values[key] = row[index + 1]; });
    for (const band of chart.bands) {
      const min = band.minKey ? values[band.minKey] : band.minValue;
      const max = values[band.maxKey];
      const aboveMin = band.exclusiveMin ? weight > min : weight >= min;
      if (aboveMin && weight <= max) {
        if (band.outcome === "limited" && carrier.limitedAgeMax && age > carrier.limitedAgeMax) {
          return { outcome: "decline", tier: text().ageIneligible, rowHeight: row[0] };
        }
        return { outcome: band.outcome, tier: band.tier, rowHeight: row[0] };
      }
    }
    return { outcome: chart.outsideOutcome || "decline", tier: chart.outsideTier || text().decline, rowHeight: row[0] };
  }

  function worstOutcome(keys) {
    return keys.reduce((worst, key) => data.outcomes[key].rank > data.outcomes[worst].rank ? key : worst, "favorable");
  }

  function translateTier(tier) {
    if (language() !== "es") return tier;
    return tier
      .replaceAll("day-one", "día 1").replaceAll("Level", "Nivelada").replaceAll("Graded", "Gradual")
      .replaceAll("Immediate", "Inmediata").replaceAll("modified", "modificada").replaceAll("route", "ruta")
      .replaceAll("No height/weight chart — any build accepted", "Sin tabla de estatura/peso — acepta cualquier complexión");
  }

  function evaluate() {
    const age = Number($("uw-age").value);
    const feet = Number($("uw-feet").value);
    const inches = Number($("uw-inches").value);
    const weight = Number($("uw-weight").value);
    const tobacco = $("uw-tobacco").value === "yes";
    const validation = $("uw-validation");
    if (!Number.isFinite(age) || age < 18 || age > 99 || !Number.isFinite(feet) || feet < 4 || feet > 6 || !Number.isFinite(inches) || inches < 0 || inches > 11 || !Number.isFinite(weight) || weight < 50 || weight > 700) {
      validation.textContent = text().required;
      return;
    }
    validation.textContent = "";
    const height = feet * 12 + inches;
    const chosen = [...selectedConditions].map((id) => data.conditions.find((item) => item.id === id)).filter(Boolean);

    const results = data.carriers.map((carrier) => {
      let ageOutcome = "favorable";
      let ageReason = text().ageReason;
      const maxAge = tobacco && carrier.tobaccoAgeMax ? carrier.tobaccoAgeMax : carrier.ageMax;
      if (age < carrier.ageMin || age > maxAge) {
        ageOutcome = "decline";
        ageReason = tobacco && carrier.tobaccoAgeMax && age > carrier.tobaccoAgeMax ? text().tobaccoAge : text().ageIneligible;
      }
      const build = buildResult(carrier, height, weight, age);
      const rules = chosen.map((condition) => ({ condition, rule: condition.rules[carrier.id] })).filter((item) => item.rule);
      const healthOutcome = rules.length ? worstOutcome(rules.map((item) => item.rule.outcome)) : "favorable";
      const outcome = worstOutcome([ageOutcome, build.outcome, healthOutcome]);
      return { carrier, outcome, ageOutcome, ageReason, build, healthOutcome, rules };
    }).sort((a, b) => data.outcomes[a.outcome].rank - data.outcomes[b.outcome].rank || data.outcomes[a.healthOutcome].rank - data.outcomes[b.healthOutcome].rank || a.carrier.name.localeCompare(b.carrier.name));

    renderResults(results, { age, feet, inches, height, weight, tobacco, chosen });
  }

  function renderResults(results, profile) {
    const container = $("uw-results");
    container.className = "";
    container.innerHTML = "";
    const summary = document.createElement("div");
    summary.className = "results-summary";
    const heading = document.createElement("h3");
    heading.textContent = text().results;
    const profileText = document.createElement("span");
    profileText.textContent = `${text().profile}: ${profile.age} · ${profile.feet}'${profile.inches}\" · ${profile.weight} lb · ${text().tobaccoLabel}: ${profile.tobacco ? text().yes : text().no} · ${results.length} ${text().options}`;
    summary.append(heading, profileText);
    container.appendChild(summary);

    const list = document.createElement("div");
    list.className = "underwriting-results";
    results.forEach((result, index) => {
      const outcome = data.outcomes[result.outcome];
      const card = document.createElement("article");
      card.className = "uw-result";
      card.style.setProperty("--outcome", outcome.color);
      const main = document.createElement("div");
      main.className = "uw-result-main";
      const rank = document.createElement("div");
      rank.className = "result-rank";
      rank.textContent = String(index + 1).padStart(2, "0");
      const carrier = document.createElement("div");
      carrier.className = "result-carrier";
      carrier.innerHTML = `<strong>${result.carrier.name}</strong><span>${result.carrier.product}</span>`;
      const reason = document.createElement("div");
      reason.className = "result-reason";
      const heightNote = result.build.rowHeight && result.build.rowHeight !== profile.height ? ` · ${text().chartHeight}: ${Math.floor(result.build.rowHeight / 12)}'${result.build.rowHeight % 12}\"` : "";
      reason.textContent = `${result.ageReason} · ${text().build}: ${translateTier(result.build.tier)}${heightNote}`;
      const tier = document.createElement("span");
      tier.className = "result-tier";
      tier.textContent = text()[result.outcome];
      main.append(rank, carrier, reason, tier);
      card.appendChild(main);

      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = text().details;
      const rules = document.createElement("div");
      rules.className = "rule-list";
      const buildRule = document.createElement("div");
      buildRule.className = "rule-item";
      buildRule.style.setProperty("--rule-color", data.outcomes[result.build.outcome].color);
      buildRule.innerHTML = `<strong>${text().build}:</strong> ${translateTier(result.build.tier)}. <strong>${text().ageLabel}:</strong> ${result.ageReason}.`;
      rules.appendChild(buildRule);
      if (!result.rules.length) {
        const item = document.createElement("div");
        item.className = "rule-item";
        item.style.setProperty("--rule-color", data.outcomes.favorable.color);
        item.textContent = text().noConditions;
        rules.appendChild(item);
      } else {
        result.rules.forEach(({ condition, rule }) => {
          const item = document.createElement("div");
          item.className = "rule-item";
          item.style.setProperty("--rule-color", data.outcomes[rule.outcome].color);
          const strong = document.createElement("strong");
          strong.textContent = `${displayCondition(condition)} — ${text()[rule.outcome]}: `;
          item.append(strong, document.createTextNode(rule.rule));
          rules.appendChild(item);
        });
      }
      details.append(summary, rules);
      card.appendChild(details);
      list.appendChild(card);
    });
    container.appendChild(list);
  }

  document.querySelectorAll(".tool-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tool-tab").forEach((item) => item.classList.toggle("active", item === tab));
      document.querySelectorAll(".tool-panel").forEach((panel) => { panel.hidden = panel.id !== tab.dataset.panel; });
    });
  });

  $("uw-add-condition").addEventListener("click", () => {
    const id = $("uw-condition").value;
    if (id) selectedConditions.add(id);
    $("uw-condition").value = "";
    renderSelectedConditions();
  });
  $("uw-run").addEventListener("click", evaluate);
  $("uw-clear").addEventListener("click", () => {
    ["uw-age", "uw-feet", "uw-inches", "uw-weight"].forEach((id) => { $(id).value = ""; });
    $("uw-tobacco").value = "no";
    selectedConditions.clear();
    renderSelectedConditions();
    $("uw-validation").textContent = "";
    $("uw-results").className = "finder-empty";
    $("uw-results").textContent = text().empty;
  });
  if ($("language")) $("language").addEventListener("change", setFinderLanguage);

  setFinderLanguage();
})();
