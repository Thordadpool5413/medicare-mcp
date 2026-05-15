const modes = {
  search_providers: {
    label: 'Provider Services',
    title: 'Find Medicare providers and procedure utilization',
    description: 'Search CMS Physician and Other Practitioners data by procedure, specialty, location, and year.',
    sample: { method: 'search_providers', dataset_type: 'provider_and_service', year: '2023', hcpcs_code: '99213', geo_level: 'State', geo_code: 'FL', provider_type: 'Family Practice', size: 25, sort: { field: 'Tot_Srvcs', direction: 'desc' } },
    fields: [
      { name: 'dataset_type', label: 'Dataset', type: 'select', options: [['geography_and_service', 'Geography and service'], ['provider_and_service', 'Provider and service'], ['provider', 'Provider summary']], required: true },
      { name: 'year', label: 'Year', type: 'select', options: ['2023','2022','2021','2020','2019','2018','2017','2016','2015','2014','2013'] },
      { name: 'hcpcs_code', label: 'HCPCS Code', placeholder: '99213' },
      { name: 'provider_type', label: 'Provider Type', placeholder: 'Family Practice' },
      { name: 'geo_level', label: 'Geography Level', type: 'select', options: [['', 'Any'], ['State', 'State'], ['County', 'County'], ['ZIP', 'ZIP'], ['National', 'National']] },
      { name: 'geo_code', label: 'Geography Code', placeholder: 'FL' },
      { name: 'place_of_service', label: 'Place of Service', type: 'select', options: [['', 'Any'], ['O', 'Office'], ['F', 'Facility'], ['H', 'Hospital']] },
      { name: 'size', label: 'Result Limit', type: 'number', placeholder: '25', defaultValue: 25 },
      { name: 'sort.field', label: 'Sort Field', placeholder: 'Tot_Srvcs' },
      { name: 'sort.direction', label: 'Sort Direction', type: 'select', options: [['desc', 'Descending'], ['asc', 'Ascending']] }
    ]
  },
  search_prescribers: {
    label: 'Part D Prescribers',
    title: 'Search Medicare Part D prescriber patterns',
    description: 'Find prescribers by drug, specialty, NPI, state, and demographic profile.',
    sample: { method: 'search_prescribers', drug_name: 'metformin', state: 'FL', prescriber_type: 'Family Practice', size: 25 },
    fields: [
      { name: 'drug_name', label: 'Drug Name', placeholder: 'metformin' },
      { name: 'prescriber_npi', label: 'Prescriber NPI', placeholder: '1234567890' },
      { name: 'prescriber_type', label: 'Prescriber Specialty', placeholder: 'Family Practice' },
      { name: 'state', label: 'State', placeholder: 'FL' },
      { name: 'include_demographics', label: 'Include Demographics', type: 'select', options: [['false', 'No'], ['true', 'Yes']] },
      { name: 'size', label: 'Result Limit', type: 'number', defaultValue: 25 }
    ]
  },
  search_hospitals: {
    label: 'Hospitals',
    title: 'Search Medicare hospital utilization',
    description: 'Look up inpatient utilization and payment data by hospital, state, city, and DRG.',
    sample: { method: 'search_hospitals', state: 'FL', hospital_name: 'health', size: 25 },
    fields: [
      { name: 'hospital_name', label: 'Hospital Name', placeholder: 'health' },
      { name: 'hospital_id', label: 'Hospital CCN', placeholder: '100001' },
      { name: 'state', label: 'State', placeholder: 'FL' },
      { name: 'city', label: 'City', placeholder: 'Orlando' },
      { name: 'drg_code', label: 'DRG Code', placeholder: '291' },
      { name: 'size', label: 'Result Limit', type: 'number', defaultValue: 25 }
    ]
  },
  search_hospitals_by_quality: {
    label: 'Hospital Quality',
    title: 'Find hospitals by CMS quality indicators',
    description: 'Filter hospitals by state and star rating to surface quality patterns quickly.',
    sample: { method: 'search_hospitals_by_quality', quality_state: 'FL', min_star_rating: 4, size: 25 },
    fields: [
      { name: 'quality_state', label: 'State', placeholder: 'FL' },
      { name: 'min_star_rating', label: 'Minimum Star Rating', type: 'number', placeholder: '4' },
      { name: 'size', label: 'Result Limit', type: 'number', defaultValue: 25 }
    ]
  },
  search_spending: {
    label: 'Drug Spending',
    title: 'Analyze Medicare drug spending',
    description: 'Search Part D or Part B spending by drug, year, size, and sort preference.',
    sample: { method: 'search_spending', spending_drug_name: 'Eliquis', spending_type: 'part_d', year: '2023', size: 25 },
    fields: [
      { name: 'spending_drug_name', label: 'Drug Name', placeholder: 'Eliquis' },
      { name: 'spending_type', label: 'Spending Type', type: 'select', options: [['part_d', 'Part D'], ['part_b', 'Part B']] },
      { name: 'year', label: 'Year', placeholder: '2023' },
      { name: 'size', label: 'Result Limit', type: 'number', defaultValue: 25 }
    ]
  },
  search_formulary: {
    label: 'Formulary Coverage',
    title: 'Search Medicare Part D formulary access',
    description: 'Find drug coverage, tiers, prior authorization, quantity limits, and step therapy.',
    sample: { method: 'search_formulary', formulary_drug_name: 'insulin', plan_state: 'FL', size: 25 },
    fields: [
      { name: 'formulary_drug_name', label: 'Drug Name', placeholder: 'insulin' },
      { name: 'ndc_code', label: 'NDC Code', placeholder: '00002143380' },
      { name: 'tier', label: 'Tier', type: 'number', placeholder: '3' },
      { name: 'requires_prior_auth', label: 'Prior Authorization', type: 'select', options: [['', 'Any'], ['true', 'Required'], ['false', 'Not required']] },
      { name: 'has_quantity_limit', label: 'Quantity Limit', type: 'select', options: [['', 'Any'], ['true', 'Yes'], ['false', 'No']] },
      { name: 'has_step_therapy', label: 'Step Therapy', type: 'select', options: [['', 'Any'], ['true', 'Yes'], ['false', 'No']] },
      { name: 'plan_state', label: 'Plan State', placeholder: 'FL' },
      { name: 'size', label: 'Result Limit', type: 'number', defaultValue: 25 }
    ]
  },
  get_asp_pricing: {
    label: 'ASP Pricing',
    title: 'Look up Medicare Part B ASP pricing',
    description: 'Get payment limit, calculated ASP, dosage, coinsurance, and effective period by HCPCS code.',
    sample: { method: 'get_asp_pricing', hcpcs_code_asp: 'J9035', quarter: '2025Q1' },
    fields: [
      { name: 'hcpcs_code_asp', label: 'HCPCS Code', placeholder: 'J9035', required: true },
      { name: 'quarter', label: 'Quarter', placeholder: '2025Q1' }
    ]
  },
  get_asp_trend: {
    label: 'ASP Trend',
    title: 'Track ASP price changes over time',
    description: 'Trend a Part B drug across quarters and summarize pricing movement.',
    sample: { method: 'get_asp_trend', hcpcs_code_asp: 'J9035', start_quarter: '2024Q1', end_quarter: '2025Q1' },
    fields: [
      { name: 'hcpcs_code_asp', label: 'HCPCS Code', placeholder: 'J9035', required: true },
      { name: 'start_quarter', label: 'Start Quarter', placeholder: '2024Q1', required: true },
      { name: 'end_quarter', label: 'End Quarter', placeholder: '2025Q1', required: true }
    ]
  },
  compare_hospitals: {
    label: 'Compare Hospitals',
    title: 'Compare hospitals across quality metrics',
    description: 'Enter multiple hospital CCNs and choose metrics to compare side by side.',
    sample: { method: 'compare_hospitals', hospital_ids: ['100001', '100007'], metrics: ['star_rating', 'readmission_rate', 'mortality_rate'], size: 25 },
    fields: [
      { name: 'hospital_ids', label: 'Hospital CCNs', type: 'textarea', placeholder: '100001\n100007', help: 'One CCN per line or comma separated.' },
      { name: 'metrics', label: 'Metrics', type: 'textarea', placeholder: 'star_rating\nreadmission_rate\nmortality_rate', help: 'One metric per line or comma separated.' },
      { name: 'size', label: 'Result Limit', type: 'number', defaultValue: 25 }
    ]
  }
};

const form = document.querySelector('#queryForm');
const modeButtons = [...document.querySelectorAll('.mode-button')];
const modeEyebrow = document.querySelector('#modeEyebrow');
const modeTitle = document.querySelector('#modeTitle');
const modeDescription = document.querySelector('#modeDescription');
const sampleButton = document.querySelector('#sampleButton');
const clearButton = document.querySelector('#clearButton');
const resultsTitle = document.querySelector('#resultsTitle');
const summaryGrid = document.querySelector('#summaryGrid');
const resultsContainer = document.querySelector('#resultsContainer');
const copyJsonButton = document.querySelector('#copyJsonButton');
const downloadCsvButton = document.querySelector('#downloadCsvButton');
const statusDot = document.querySelector('#statusDot');
const statusLabel = document.querySelector('#statusLabel');
const statusDetail = document.querySelector('#statusDetail');

let activeMode = 'search_providers';
let lastResult = null;

function setNestedValue(target, path, value) {
  const parts = path.split('.');
  let current = target;
  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      current[part] = value;
      return;
    }
    current[part] = current[part] || {};
    current = current[part];
  });
}

function normalizeValue(field, value) {
  if (value === '') return undefined;
  if (field.type === 'number') return Number(value);
  if (['true', 'false'].includes(value)) return value === 'true';
  if (field.type === 'textarea' && ['hospital_ids', 'metrics', 'hcpcs_codes'].includes(field.name)) {
    return value.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
  }
  return value;
}

function renderForm(sample = {}) {
  const mode = modes[activeMode];
  modeEyebrow.textContent = mode.label;
  modeTitle.textContent = mode.title;
  modeDescription.textContent = mode.description;
  form.innerHTML = '';

  mode.fields.forEach((field) => {
    const wrapper = document.createElement('div');
    wrapper.className = `field ${field.type === 'textarea' ? 'full' : ''}`;

    const label = document.createElement('label');
    label.htmlFor = field.name;
    label.textContent = field.label;
    wrapper.appendChild(label);

    let input;
    const sampleValue = getSampleValue(sample, field.name);
    const value = sampleValue ?? field.defaultValue ?? '';

    if (field.type === 'select') {
      input = document.createElement('select');
      (field.options || []).forEach((option) => {
        const opt = document.createElement('option');
        const tuple = Array.isArray(option) ? option : [option, option];
        opt.value = tuple[0];
        opt.textContent = tuple[1];
        input.appendChild(opt);
      });
      input.value = value;
    } else if (field.type === 'textarea') {
      input = document.createElement('textarea');
      input.value = Array.isArray(value) ? value.join('\n') : value;
    } else {
      input = document.createElement('input');
      input.type = field.type || 'text';
      input.value = value;
      input.placeholder = field.placeholder || '';
    }

    input.id = field.name;
    input.name = field.name;
    if (field.required) input.required = true;
    wrapper.appendChild(input);

    if (field.help) {
      const help = document.createElement('small');
      help.textContent = field.help;
      wrapper.appendChild(help);
    }

    form.appendChild(wrapper);
  });
}

function getSampleValue(sample, path) {
  return path.split('.').reduce((value, part) => value && value[part], sample);
}

function collectPayload() {
  const mode = modes[activeMode];
  const payload = { method: activeMode };

  mode.fields.forEach((field) => {
    const input = form.elements[field.name];
    if (!input) return;
    const value = normalizeValue(field, input.value);
    if (value === undefined || Number.isNaN(value)) return;
    setNestedValue(payload, field.name, value);
  });

  return payload;
}

function extractRows(result) {
  if (!result || typeof result !== 'object') return [];
  const candidates = ['providers', 'prescribers', 'hospitals', 'spending', 'formulary', 'results', 'comparisons', 'trend_data', 'quality_metrics', 'scores'];
  for (const key of candidates) {
    if (Array.isArray(result[key])) return result[key];
  }
  if (Array.isArray(result.data)) return result.data;
  return [result];
}

function formatValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return Number.isFinite(value) ? value.toLocaleString() : String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function makeSummary(result, rows) {
  const entries = [];
  if (typeof result?.total !== 'undefined') entries.push(['Total Found', result.total]);
  entries.push(['Rows Shown', rows.length]);
  if (result?.year) entries.push(['Year', result.year]);
  if (result?.quarter) entries.push(['Quarter', result.quarter]);
  if (result?.data_points) entries.push(['Data Points', result.data_points]);
  if (result?.drugs_found) entries.push(['Drugs Found', result.drugs_found]);
  if (result?.effective_period) entries.push(['Effective Period', result.effective_period]);

  summaryGrid.innerHTML = entries.slice(0, 8).map(([label, value]) => `
    <div class="metric-card"><strong>${escapeHtml(formatValue(value))}</strong><span>${escapeHtml(label)}</span></div>
  `).join('');
}

function renderResults(result) {
  lastResult = result;
  const rows = extractRows(result);
  resultsTitle.textContent = rows.length ? `${rows.length.toLocaleString()} result row${rows.length === 1 ? '' : 's'}` : 'No rows returned';
  makeSummary(result, rows);

  if (!rows.length) {
    resultsContainer.className = 'results-container empty-state';
    resultsContainer.textContent = 'No rows came back. Try widening the filters or loading a sample query.';
    return;
  }

  const columns = [...rows.reduce((set, row) => {
    Object.keys(row || {}).forEach((key) => set.add(key));
    return set;
  }, new Set())].slice(0, 18);

  const table = `
    <div class="table-wrap">
      <table>
        <thead><tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')}</tr></thead>
        <tbody>
          ${rows.map((row) => `<tr>${columns.map((column) => `<td>${escapeHtml(formatValue(row?.[column]))}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    </div>
    <pre class="raw-json">${escapeHtml(JSON.stringify(result, null, 2))}</pre>
  `;

  resultsContainer.className = 'results-container';
  resultsContainer.innerHTML = table;
}

function renderError(error) {
  resultsTitle.textContent = 'Search failed';
  summaryGrid.innerHTML = '';
  resultsContainer.className = 'results-container';
  resultsContainer.innerHTML = `<div class="error-box"><strong>Something broke.</strong><br>${escapeHtml(error.message || String(error))}</div>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}

async function runSearch() {
  const payload = collectPayload();
  resultsTitle.textContent = 'Running query';
  summaryGrid.innerHTML = '';
  resultsContainer.className = 'results-container empty-state';
  resultsContainer.innerHTML = '<span class="loader">Asking Medicare data nicely. Firmly, but nicely.</span>';

  try {
    const response = await fetch('/api/medicare-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }
    renderResults(data);
  } catch (error) {
    renderError(error);
  }
}

function objectToCsv(result) {
  const rows = extractRows(result);
  if (!rows.length) return '';
  const columns = [...rows.reduce((set, row) => {
    Object.keys(row || {}).forEach((key) => set.add(key));
    return set;
  }, new Set())];

  const csvRows = [columns.join(',')];
  rows.forEach((row) => {
    csvRows.push(columns.map((column) => {
      const value = formatValue(row[column]).replace(/"/g, '""');
      return `"${value}"`;
    }).join(','));
  });
  return csvRows.join('\n');
}

function downloadText(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function checkHealth() {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Health check failed');
    statusDot.className = 'status-dot ok';
    statusLabel.textContent = 'API Online';
    statusDetail.textContent = data.apiBaseUrl || 'Medicare engine connected';
  } catch (error) {
    statusDot.className = 'status-dot bad';
    statusLabel.textContent = 'API Offline';
    statusDetail.textContent = error.message || 'Unable to connect';
  }
}

modeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeMode = button.dataset.mode;
    modeButtons.forEach((item) => item.classList.toggle('active', item === button));
    renderForm();
  });
});

sampleButton.addEventListener('click', () => renderForm(modes[activeMode].sample));

clearButton.addEventListener('click', () => {
  lastResult = null;
  resultsTitle.textContent = 'Ready when you are';
  summaryGrid.innerHTML = '';
  resultsContainer.className = 'results-container empty-state';
  resultsContainer.textContent = 'Results cleared. Like nothing ever happened. Legally speaking, probably.';
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  runSearch();
});

copyJsonButton.addEventListener('click', async () => {
  if (!lastResult) return;
  await navigator.clipboard.writeText(JSON.stringify(lastResult, null, 2));
  copyJsonButton.textContent = 'Copied';
  setTimeout(() => { copyJsonButton.textContent = 'Copy JSON'; }, 1200);
});

downloadCsvButton.addEventListener('click', () => {
  if (!lastResult) return;
  downloadText(`medicare-results-${Date.now()}.csv`, objectToCsv(lastResult), 'text/csv;charset=utf-8');
});

renderForm(modes[activeMode].sample);
checkHealth();
