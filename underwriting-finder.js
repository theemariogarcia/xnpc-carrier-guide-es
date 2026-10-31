(() => {
  "use strict";

  const wholeData = window.XNPC_UW_DATA;
  const termData = window.XNPC_IUL_TERM_DATA;
  const compData = window.XNPC_COMP_DATA;
  if (!wholeData || !termData) return;

  const $ = (id) => document.getElementById(id);
  const selectedConditions = new Set();
  const categoryOrder = { iul: 0, whole: 1, term: 2 };
  const outcomeOrder = ["favorable", "limited", "gi", "verify", "na", "crossref", "decline"];
  const ranks = Object.fromEntries(outcomeOrder.map((key, index) => [key, index + 1]));
  let hasEvaluated = false;

  const ui = {
    en: {
      finderEyebrow: "ONE-PASS 2026 PRE-SCREEN", finderTitle: "Unified Life Placement Finder",
      finderLead: "Enter the client once. Results are organized in the order to explore: IUL first, then Whole Life, then Term Life.",
      producerOnly: "Producer use only", statusLabel: "Immigration / ID status", ageLabel: "Age", feetLabel: "Height — feet", inchesLabel: "Height — inches", weightLabel: "Weight (lb)", tobaccoLabel: "Tobacco use", no: "No", yes: "Yes",
      conditionLabel: "Health condition", chooseCondition: "Choose a condition", addCondition: "Add condition", clear: "Clear", rankOptions: "Show qualification paths", liveQuote: "Run live Spark quote →",
      empty: "Enter age, height, and weight to compare IUL, Whole Life, and Term options.", sourceNote: "Preliminary field guidance from the uploaded 2026 IUL/Term and Final Expense/Whole Life grids. Exact source wording is shown in each result.",
      required: "Enter a valid age, height, and weight.", details: "View underwriting details", noConditions: "No health condition selected", remove: "Remove",
      commissionOption: "Optional: add commission estimate", compLevel: "FFL comp level", annualPremium: "Annual premium", chooseComp: "Select comp level",
      favorable: "Potential fit", limited: "Rated / modified route", gi: "Guaranteed-issue route", verify: "Verify before submission", na: "Not asked / unavailable", crossref: "See related rule", decline: "Not a fit from this guide",
      iul: "1 · IUL first", whole: "2 · Whole Life next", term: "3 · Term Life fallback", iulNote: "Start here when the profile supports an indexed universal life route.", wholeNote: "If IUL is not a clear fit, review permanent Whole Life / Final Expense options.", termNote: "Use Term when it is the better remaining fit for the client’s need and profile.",
      noViable: "No clear route in this category from the selected information.", preliminary: "Preliminary match", profile: "Client profile", build: "Build", health: "Health", status: "Status", age: "Age", commission: "Estimated first-year gross", compUnavailable: "No matching compensation schedule loaded", verifyStatus: "Verify immigration / ID eligibility", sourceRule: "Source rule", options: "options",
      statusOptions: { "":"Select status", citizen:"U.S. citizen / Permanent resident", ssn_only:"Work permit + SSN with valid ID", itin_license:"ITIN + U.S. driver's license", itin_passport:"ITIN + passport", no_ssn_no_itin:"No SSN or ITIN" }
    },
    es: {
      finderEyebrow: "PRE-EVALUACIÓN ÚNICA 2026", finderTitle: "Buscador unificado de colocación",
      finderLead: "Ingresa al cliente una sola vez. Los resultados se organizan en el orden a explorar: primero IUL, después Whole Life y al final Term Life.",
      producerOnly: "Solo para productores", statusLabel: "Estatus migratorio / identificación", ageLabel: "Edad", feetLabel: "Estatura — pies", inchesLabel: "Estatura — pulgadas", weightLabel: "Peso (lb)", tobaccoLabel: "Uso de tabaco", no: "No", yes: "Sí",
      conditionLabel: "Condición de salud", chooseCondition: "Selecciona una condición", addCondition: "Agregar condición", clear: "Limpiar", rankOptions: "Mostrar rutas de calificación", liveQuote: "Generar cotización en vivo con Spark →",
      empty: "Ingresa edad, estatura y peso para comparar opciones IUL, Whole Life y Term.", sourceNote: "Guía preliminar basada en las tablas 2026 cargadas de IUL/Term y Final Expense/Whole Life. Cada resultado muestra el texto exacto de la fuente.",
      required: "Ingresa una edad, estatura y peso válidos.", details: "Ver detalles de suscripción", noConditions: "Sin condición de salud seleccionada", remove: "Quitar",
      commissionOption: "Opcional: agregar estimado de comisión", compLevel: "Nivel de comp FFL", annualPremium: "Prima anual", chooseComp: "Selecciona nivel de comp",
      favorable: "Posible opción", limited: "Ruta con clasificación / modificada", gi: "Ruta de emisión garantizada", verify: "Verificar antes de enviar", na: "No preguntado / no disponible", crossref: "Ver regla relacionada", decline: "No encaja según esta guía",
      iul: "1 · Primero IUL", whole: "2 · Después Whole Life", term: "3 · Term Life como alternativa", iulNote: "Empieza aquí cuando el perfil admite una ruta de vida universal indexada.", wholeNote: "Si IUL no es una opción clara, revisa Whole Life permanente / gastos finales.", termNote: "Usa Term cuando sea la mejor opción restante para la necesidad y el perfil del cliente.",
      noViable: "No hay una ruta clara en esta categoría con la información seleccionada.", preliminary: "Coincidencia preliminar", profile: "Perfil del cliente", build: "Complexión", health: "Salud", status: "Estatus", age: "Edad", commission: "Bruto estimado del primer año", compUnavailable: "No hay tabla de compensación correspondiente cargada", verifyStatus: "Verificar elegibilidad migratoria / de identificación", sourceRule: "Regla fuente", options: "opciones",
      statusOptions: { "":"Selecciona estatus", citizen:"Ciudadano / Residente permanente", ssn_only:"Permiso de trabajo + Seguro Social con ID vigente", itin_license:"ITIN + licencia de EE. UU.", itin_passport:"ITIN + pasaporte", no_ssn_no_itin:"Sin SSN ni ITIN" }
    }
  };

  const conditionEs = {
    "AFib / Arrhythmia":"Fibrilación auricular / Arritmia", "AFib / Irregular Heartbeat":"Fibrilación auricular / Ritmo irregular", "AIDS / HIV / ARC":"SIDA / VIH / ARC", "Alcohol / Drug Abuse":"Abuso de alcohol / drogas", "ALS (Lou Gehrig’s)":"ELA (Lou Gehrig)", "Alzheimer’s / Dementia":"Alzheimer / Demencia", "Amputation":"Amputación", "Aneurysm":"Aneurisma", "Angina (Chest Pain)":"Angina (dolor de pecho)", "Angioplasty / Stent":"Angioplastia / Stent", "Angioplasty":"Angioplastia", "Anxiety":"Ansiedad", "Arthritis (RA)":"Artritis reumatoide", "Arthritis (incl. RA)":"Artritis (incl. AR)", "Asthma":"Asma", "Asthma (Chronic)":"Asma crónica", "Autism":"Autismo", "Bipolar Disorder":"Trastorno bipolar", "Blood Clots / DVT":"Coágulos / TVP", "Bronchitis / COPD":"Bronquitis / EPOC", "Cancer (not Basal Cell)":"Cáncer (no basocelular)", "Cardiomyopathy":"Cardiomiopatía", "Cardiomyopathy / Heart Disease":"Cardiomiopatía / Enfermedad cardíaca", "Cerebral Palsy":"Parálisis cerebral", "CHF":"Insuficiencia cardíaca", "CHF / Diastolic HF":"Insuficiencia cardíaca / IC diastólica", "Chronic Pain (Narcotics)":"Dolor crónico (narcóticos)", "Cirrhosis":"Cirrosis", "Coronary Artery Disease":"Enfermedad arterial coronaria", "Crohn’s Disease":"Enfermedad de Crohn", "Depression":"Depresión", "Diabetes (Type 1 / Type 2)":"Diabetes (tipo 1 / tipo 2)", "Diabetic Complications":"Complicaciones diabéticas", "Disability (Currently Receiving)":"Discapacidad (recibiendo beneficios)", "Down’s Syndrome":"Síndrome de Down", "DUI / Reckless Driving":"DUI / Conducción imprudente", "Emphysema":"Enfisema", "Epilepsy / Seizures":"Epilepsia / Convulsiones", "Felony / Criminal":"Delito grave / Historial criminal", "Heart Attack":"Ataque cardíaco", "Heart Attack (MI)":"Ataque cardíaco (infarto)", "Heart Surgery (CABG / Valve)":"Cirugía cardíaca (bypass / válvula)", "Hepatitis B / C":"Hepatitis B / C", "High Blood Pressure":"Presión alta", "Kidney Disease / Failure / Dialysis":"Enfermedad renal / Diálisis", "Liver Disease":"Enfermedad hepática", "Melanoma":"Melanoma", "Mental Incapacity":"Incapacidad mental", "Multiple Sclerosis":"Esclerosis múltiple", "Muscular Dystrophy":"Distrofia muscular", "Organ / Bone Marrow Transplant":"Trasplante de órgano / médula", "Oxygen Use":"Uso de oxígeno", "Pacemaker / Defibrillator":"Marcapasos / Desfibrilador", "PAD / PVD":"EAP / EVP", "Pancreatitis":"Pancreatitis", "Parkinson’s Disease":"Enfermedad de Parkinson", "PTSD":"TEPT", "Pulmonary Fibrosis":"Fibrosis pulmonar", "Sarcoidosis":"Sarcoidosis", "Schizophrenia / Psychosis":"Esquizofrenia / Psicosis", "Sickle Cell Anemia":"Anemia falciforme", "Sleep Apnea":"Apnea del sueño", "Sleep Apnea (CPAP)":"Apnea del sueño (CPAP)", "Stroke / TIA":"Derrame cerebral / AIT", "Wheelchair / Scooter":"Silla de ruedas / Scooter", "Wheelchair / Walker":"Silla de ruedas / Andador"
  };

  function language() { return ($("language") && $("language").value) || "es"; }
  function text() { return ui[language()] || ui.es; }
  function normalize(value) { return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }

  function canonical(name) {
    const n = normalize(name);
    const tests = [
      [/afib|arrhythmia|irregular heartbeat/,"afib"],[/aids|hiv|arc/,"hiv"],[/alcohol|drug abuse|illegal drug/,"substance_abuse"],[/lou gehrig|^als /,"als"],[/alzheimer|dementia/,"dementia"],[/amputation/,"amputation"],[/aneurysm/,"aneurysm"],[/angina/,"angina"],[/angioplasty|stent/,"angioplasty_stent"],[/anxiety/,"anxiety"],[/arthritis/,"arthritis"],[/asthma/,"asthma"],[/autism/,"autism"],[/bipolar/,"bipolar"],[/blood clots|dvt/,"dvt"],[/bronchitis|^copd$/, "copd"],[/cancer not basal/,"cancer"],[/cardiomyopathy/,"cardiomyopathy"],[/cerebral palsy/,"cerebral_palsy"],[/^chf|heart failure/,"chf"],[/chronic pain/,"chronic_pain"],[/cirrhosis/,"cirrhosis"],[/coronary artery/,"cad"],[/crohn/,"crohns"],[/depression/,"depression"],[/diabetic complications|neuropathy/,"diabetic_complications"],[/diabetes/,"diabetes"],[/disability currently|currently receiving/,"disability"],[/down/,"downs"],[/dui|reckless/,"dui"],[/emphysema/,"emphysema"],[/epilepsy|seizures/,"seizures"],[/felony|criminal|incarcerated|parole|probation/,"criminal"],[/heart attack|\bmi\b/,"heart_attack"],[/heart surgery|cabg|valve replacement/,"heart_surgery"],[/hepatitis b|hepatitis c/,"hepatitis_bc"],[/high blood pressure/,"hypertension"],[/kidney|dialysis/,"kidney"],[/liver disease/,"liver"],[/melanoma/,"melanoma"],[/mental incapacity/,"mental_incapacity"],[/multiple sclerosis/,"ms"],[/muscular dystrophy/,"muscular_dystrophy"],[/organ transplant|bone marrow/,"transplant"],[/oxygen/,"oxygen"],[/pacemaker|defibrillator/,"pacemaker"],[/pad|pvd/,"pvd"],[/pancreatitis/,"pancreatitis"],[/parkinson/,"parkinsons"],[/ptsd/,"ptsd"],[/pulmonary fibrosis/,"pulmonary_fibrosis"],[/sarcoidosis/,"sarcoidosis"],[/schizophrenia|psychosis/,"schizophrenia"],[/sickle cell/,"sickle_cell"],[/sleep apnea/,"sleep_apnea"],[/stroke|tia/,"stroke"],[/wheelchair|walker|scooter/,"mobility"],
    ];
    const found = tests.find(([pattern]) => pattern.test(n));
    return found ? found[1] : n;
  }

  const allConditions = new Map();
  [...wholeData.conditions, ...termData.conditions].forEach((condition) => {
    const key = canonical(condition.name);
    if (!allConditions.has(key) || termData.conditions.includes(condition)) allConditions.set(key, condition.name);
  });

  function displayCondition(key) {
    const name = allConditions.get(key) || key;
    return language() === "es" ? (conditionEs[name] || name) : name;
  }

  function setLanguage() {
    const t = text();
    document.querySelectorAll("[data-uw-i18n]").forEach((element) => {
      const value = t[element.dataset.uwI18n];
      if (value) element.textContent = value;
    });
    populateStatus();
    populateConditions();
    populateCompLevels();
    renderSelectedConditions();
    renderLegend();
    if (hasEvaluated) evaluate();
  }

  function populateStatus() {
    const select = $("uw-status");
    if (!select) return;
    const previous = select.value;
    select.innerHTML = "";
    Object.entries(text().statusOptions).forEach(([value, label]) => {
      const option = document.createElement("option"); option.value = value; option.textContent = label; select.appendChild(option);
    });
    select.value = previous;
  }

  function populateConditions() {
    const select = $("uw-condition");
    const previous = select.value;
    select.innerHTML = "";
    const prompt = document.createElement("option"); prompt.value = ""; prompt.textContent = text().chooseCondition; select.appendChild(prompt);
    [...allConditions.keys()].sort((a,b) => displayCondition(a).localeCompare(displayCondition(b), language())).forEach((key) => {
      const option = document.createElement("option"); option.value = key; option.textContent = displayCondition(key); select.appendChild(option);
    });
    select.value = previous;
  }

  function populateCompLevels() {
    const select = $("uw-comp-level");
    if (!select || !compData) return;
    const previous = select.value; select.innerHTML = "";
    const prompt = document.createElement("option"); prompt.value = ""; prompt.textContent = text().chooseComp; select.appendChild(prompt);
    [...compData.levels].reverse().forEach((level) => { const option = document.createElement("option"); option.value = String(level); option.textContent = `${level}%`; select.appendChild(option); });
    select.value = previous;
  }

  function renderSelectedConditions() {
    const container = $("uw-selected"); container.innerHTML = "";
    selectedConditions.forEach((key) => {
      const chip = document.createElement("span"); chip.className = "chip condition-chip";
      const label = document.createElement("span"); label.textContent = displayCondition(key);
      const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "×"; remove.setAttribute("aria-label", `${text().remove}: ${displayCondition(key)}`);
      remove.addEventListener("click", () => { selectedConditions.delete(key); renderSelectedConditions(); if (hasEvaluated) evaluate(); });
      chip.append(label, remove); container.appendChild(chip);
    });
  }

  function renderLegend() {
    const legend = $("uw-legend"); legend.innerHTML = "";
    outcomeOrder.forEach((key) => {
      const item = document.createElement("span"); item.className = "legend-item";
      const dot = document.createElement("span"); dot.className = "legend-dot"; dot.style.background = termData.outcomes[key].color;
      const label = document.createElement("span"); label.textContent = text()[key]; item.append(dot, label); legend.appendChild(item);
    });
  }

  function nearestRow(chart, height) {
    const eligible = (chart.rows || []).filter((row) => row[0] <= height);
    return eligible.length ? eligible[eligible.length - 1] : (chart.rows || [])[0];
  }

  function bmi(height, weight) { return (weight * 703) / (height * height); }

  function buildResult(chart, height, weight, age, hasConditions) {
    if (!chart) return { outcome:"verify", detail:"Build chart not loaded" };
    if (chart.type === "none") return { outcome:chart.outcome || "favorable", detail:chart.tier || "No build chart" };
    if (chart.type === "bmi") {
      const value = bmi(height, weight);
      const band = chart.bands.find((item) => value >= item.min && value <= item.max);
      return band ? { outcome:band.outcome, detail:`${band.tier} · BMI ${value.toFixed(1)}` } : { outcome:"decline", detail:`Outside published BMI range · BMI ${value.toFixed(1)}` };
    }
    const row = nearestRow(chart, height);
    if (!row) return { outcome:"verify", detail:"Verify build" };
    const values = { height:row[0] }; chart.columns.forEach((key,index) => { values[key] = row[index+1]; });
    const bands = chart.bands || [];
    for (const band of bands) {
      let min = band.minKey ? values[band.minKey] : (band.minValue !== undefined ? band.minValue : -Infinity);
      if (chart.ageMinKey) min = values[age >= 60 ? chart.ageMinKey.older : chart.ageMinKey.young];
      const max = values[band.maxKey];
      const above = band.exclusiveMin ? weight > min : weight >= min;
      if (above && weight <= max) {
        if (hasConditions && chart === termData.buildCharts.aa_iul && band.maxKey === "table4") return { outcome:"decline", detail:"Build over Table 2 with a medical condition" };
        return { outcome:band.outcome, detail:`${band.tier} · ${Math.floor(row[0]/12)}'${row[0]%12}\" row` };
      }
    }
    return { outcome:"decline", detail:"Outside published build range" };
  }

  function worst(parts) { return parts.reduce((a,b) => (ranks[b.outcome] > ranks[a.outcome] ? b : a), parts[0]); }

  function findCondition(data, key) { return data.conditions.find((condition) => canonical(condition.name) === key); }

  function statusResult(allowed, selected) {
    if (!selected) return { outcome:"verify", detail:text().verifyStatus };
    if (!allowed || !allowed.length) return { outcome:"verify", detail:text().verifyStatus };
    return allowed.includes(selected) ? { outcome:"favorable", detail:text().statusOptions[selected] } : { outcome:"decline", detail:`${text().statusOptions[selected]} — ${text().decline}` };
  }

  function termProducts() {
    return termData.products.map((product) => ({ ...product, source:"term", chart:termData.buildCharts[product.carrierId] }));
  }

  const wholeStatus = {
    americo:["citizen"], moo:["citizen"], transamerica:["citizen"], fidelity:[], corebridge:[], aetna:[], foresters:["citizen","itin_license"], prosperity:[], american_amicable:["citizen","ssn_only","itin_license","itin_passport"]
  };

  function wholeProducts() {
    return wholeData.carriers.map((carrier) => ({ id:`whole_${carrier.id}`, carrierId:carrier.id, abbr:carrier.abbr, name:carrier.name, product:carrier.product, category:"whole", ageMin:carrier.ageMin, ageMax:carrier.ageMax, tobaccoAgeMax:carrier.tobaccoAgeMax, status:wholeStatus[carrier.id] || [], source:"whole", chart:wholeData.buildCharts[carrier.id] }));
  }

  function healthResult(product) {
    const rules = [];
    selectedConditions.forEach((key) => {
      const condition = findCondition(product.source === "term" ? termData : wholeData, key);
      let rule;
      if (condition) rule = product.source === "term" ? condition.rules[String(product.sourceColumn)] : condition.rules[product.carrierId];
      if (rule) rules.push({ ...rule, condition:displayCondition(key) });
      else rules.push({ outcome:"verify", rule:"Condition is not specifically mapped in this product grid; verify with the carrier.", condition:displayCondition(key) });
    });
    if (!rules.length) return { outcome:"favorable", detail:text().noConditions, rules:[] };
    const worstRule = rules.reduce((a,b) => ranks[b.outcome] > ranks[a.outcome] ? b : a);
    return { outcome:worstRule.outcome, detail:`${worstRule.condition}: ${text()[worstRule.outcome]}`, rules };
  }

  function ageResult(product, age, tobacco) {
    if (product.ageMin != null && age < product.ageMin) return { outcome:"decline", detail:`${text().age}: ${age} — ${text().decline}` };
    if (product.ageMax != null && age > product.ageMax) return { outcome:"decline", detail:`${text().age}: ${age} — ${text().decline}` };
    if (tobacco && product.tobaccoAgeMax && age > product.tobaccoAgeMax) return { outcome:"decline", detail:`Tobacco age limit: ${product.tobaccoAgeMax}` };
    if (product.ageMax == null) return { outcome:"verify", detail:product.ageNote || "Verify live product age range" };
    return { outcome:"favorable", detail:`${text().age}: ${age} (${product.ageMin}–${product.ageMax})` };
  }

  function commissionFor(product, level, premium) {
    if (!level || !premium || !compData) return null;
    const carrierAliases = { aa_iul:"american_amicable", aa_term:"american_amicable", nlg:"national_life_group" };
    const id = carrierAliases[product.carrierId] || product.carrierId;
    const carrier = compData.carriers.find((item) => item.id === id || normalize(item.name).includes(normalize(product.name).split(" ")[0]));
    if (!carrier) return { unavailable:true };
    const categoryPatterns = product.category === "iul" ? [/iul|index universal/] : product.category === "term" ? [/term/] : [/whole|final expense|legacy|planright|senior choice|eagle select|living promise/];
    const choices = carrier.products.filter((item) => categoryPatterns.some((pattern) => pattern.test(normalize(`${item.name} ${item.variant}`))));
    const chosen = choices[0] || carrier.products[0];
    const rate = chosen && chosen.rates[String(level)];
    if (rate == null) return { unavailable:true };
    return { rate, amount:premium * rate / 100, product:`${chosen.name}${chosen.variant ? ` · ${chosen.variant}` : ""}` };
  }

  function evaluate() {
    const age = Number($("uw-age").value), feet = Number($("uw-feet").value), inches = Number($("uw-inches").value), weight = Number($("uw-weight").value);
    const tobacco = $("uw-tobacco").value === "yes", status = $("uw-status").value;
    const validation = $("uw-validation");
    if (!Number.isFinite(age) || age <= 0 || !Number.isFinite(feet) || feet < 4 || !Number.isFinite(inches) || inches < 0 || inches > 11 || !Number.isFinite(weight) || weight <= 0) { validation.textContent = text().required; return; }
    validation.textContent = ""; hasEvaluated = true;
    const height = feet * 12 + inches;
    const level = $("uw-comp-level").value;
    const premium = Number($("uw-comp-ap").value);
    const products = [...termProducts(), ...wholeProducts()];
    const results = products.map((product) => {
      const parts = { age:ageResult(product, age, tobacco), status:statusResult(product.status, status), build:buildResult(product.chart, height, weight, age, selectedConditions.size > 0), health:healthResult(product) };
      const overall = worst(Object.values(parts));
      return { product, parts, overall:overall.outcome, commission:commissionFor(product, level, premium) };
    }).sort((a,b) => categoryOrder[a.product.category] - categoryOrder[b.product.category] || ranks[a.overall] - ranks[b.overall] || a.product.name.localeCompare(b.product.name));
    renderResults(results, { age, feet, inches, weight, tobacco, status });
    $("live-quote-wrap").hidden = false;
  }

  function money(value) { return new Intl.NumberFormat(language() === "es" ? "es-US" : "en-US", { style:"currency", currency:"USD", maximumFractionDigits:2 }).format(value); }

  function renderResults(results, profile) {
    const container = $("uw-results"); container.className = "qualification-results"; container.innerHTML = "";
    const summary = document.createElement("div"); summary.className = "profile-summary";
    summary.textContent = `${text().profile}: ${profile.age} · ${profile.feet}'${profile.inches}\" · ${profile.weight} lb · ${profile.tobacco ? text().yes : text().no} tobacco · ${profile.status ? text().statusOptions[profile.status] : text().verifyStatus}`;
    container.appendChild(summary);
    ["iul","whole","term"].forEach((category) => {
      const categoryResults = results.filter((item) => item.product.category === category);
      const section = document.createElement("section"); section.className = "qualification-group";
      const header = document.createElement("div"); header.className = "qualification-group-head";
      const copy = document.createElement("div"); const heading = document.createElement("h3"); heading.textContent = text()[category];
      const note = document.createElement("p"); note.textContent = text()[`${category}Note`]; copy.append(heading,note);
      const count = document.createElement("span"); count.className = "qualification-count"; count.textContent = `${categoryResults.filter((item) => item.overall !== "decline").length} ${text().options}`;
      header.append(copy,count); section.appendChild(header);
      if (!categoryResults.some((item) => item.overall !== "decline")) { const empty = document.createElement("p"); empty.className = "category-empty"; empty.textContent = text().noViable; section.appendChild(empty); }
      categoryResults.forEach((item,index) => section.appendChild(resultCard(item,index)));
      container.appendChild(section);
    });
  }

  function resultCard(item, index) {
    const { product, parts, overall, commission } = item;
    const card = document.createElement("article"); card.className = `uw-result ${overall === "decline" ? "is-decline" : ""}`; card.style.setProperty("--outcome", termData.outcomes[overall].color);
    const main = document.createElement("div"); main.className = "uw-result-main";
    const rank = document.createElement("div"); rank.className = "rank"; rank.textContent = String(index + 1).padStart(2,"0");
    const identity = document.createElement("div"); identity.innerHTML = `<strong>${product.name}</strong><span>${product.product}</span>`;
    const status = document.createElement("div"); status.className = "result-status"; status.innerHTML = `<span class="outcome-pill">${text()[overall]}</span><small>${parts.health.detail}</small>`;
    const meta = document.createElement("div"); meta.className = "result-meta"; meta.innerHTML = `<span>${text().age}: ${parts.age.detail}</span><span>${text().build}: ${parts.build.detail}</span><span>${text().status}: ${parts.status.detail}</span>`;
    main.append(rank,identity,status,meta); card.appendChild(main);
    if (commission) {
      const comp = document.createElement("div"); comp.className = "unified-comp";
      comp.textContent = commission.unavailable ? text().compUnavailable : `${text().commission}: ${money(commission.amount)} · ${commission.rate}% · ${commission.product}`;
      card.appendChild(comp);
    }
    const details = document.createElement("details"); const summary = document.createElement("summary"); summary.textContent = text().details; details.appendChild(summary);
    const body = document.createElement("div"); body.className = "detail-grid";
    const base = [{label:text().age,value:parts.age.detail},{label:text().build,value:parts.build.detail},{label:text().status,value:parts.status.detail}];
    base.forEach((part) => { const box=document.createElement("div"); box.innerHTML=`<strong>${part.label}</strong><p>${part.value}</p>`; body.appendChild(box); });
    (parts.health.rules || []).forEach((rule) => { const box=document.createElement("div"); box.innerHTML=`<strong>${rule.condition} · ${text()[rule.outcome]}</strong><p>${rule.rule}</p>`; body.appendChild(box); });
    details.appendChild(body); card.appendChild(details); return card;
  }

  $("uw-add-condition").addEventListener("click", () => { const key=$("uw-condition").value; if (key) selectedConditions.add(key); $("uw-condition").value=""; renderSelectedConditions(); if (hasEvaluated) evaluate(); });
  $("uw-run").addEventListener("click", evaluate);
  ["uw-status","uw-tobacco","uw-comp-level"].forEach((id) => $(id).addEventListener("change", () => { if (hasEvaluated) evaluate(); }));
  $("uw-comp-ap").addEventListener("input", () => { if (hasEvaluated) evaluate(); });
  $("uw-clear").addEventListener("click", () => {
    ["uw-age","uw-feet","uw-inches","uw-weight","uw-comp-ap"].forEach((id) => { $(id).value=""; });
    $("uw-status").value=""; $("uw-tobacco").value="no"; $("uw-comp-level").value=""; selectedConditions.clear(); hasEvaluated=false; renderSelectedConditions(); $("uw-validation").textContent=""; $("uw-results").className="finder-empty"; $("uw-results").textContent=text().empty; $("live-quote-wrap").hidden=true;
  });
  $("language").addEventListener("change", setLanguage);
  setLanguage();
})();
