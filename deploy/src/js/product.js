// Product Detail Page Script
document.addEventListener('DOMContentLoaded', async () => {
  let allModels = [];

  // Fetch models data
  const localData = localStorage.getItem('zoomlion_models');
  if (localData) {
    try {
      allModels = JSON.parse(localData);
    } catch (e) {
      console.error('Failed to parse localStorage models:', e);
    }
  }

  if (!allModels || allModels.length === 0) {
    try {
      const response = await fetch('./src/data/models.json');
      allModels = await response.json();
    } catch (err) {
      console.error('Failed to load models:', err);
      return;
    }
  }

  // Apply Site Settings
  applySiteSettings();

  // Get Model ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const targetId = urlParams.get('id') || urlParams.get('model') || allModels[0]?.id;

  const currentModel = allModels.find(m => m.id === targetId) || allModels[0];
  if (!currentModel) return;

  // Render Product Details
  renderProductDetails(currentModel);

  // Render Related Models
  renderRelatedModels(currentModel);

  // Setup Product Calculator
  setupProductCalculator(currentModel);

  // Setup Quote Modal
  setupQuoteModal(currentModel);

  // --- Render Functions ---
  function renderProductDetails(model) {
    // Title & Meta
    document.title = `${model.name} на шасси ${model.chassis} — Купить АБН ZOOMLION DDP`;
    
    const breadcrumb = document.getElementById('breadcrumbCurrent');
    if (breadcrumb) breadcrumb.textContent = `${model.name} (${model.chassis})`;

    // Image
    const mainImg = document.getElementById('productImage');
    if (mainImg) {
      mainImg.src = model.image;
      mainImg.alt = model.name;
    }

    // Header info
    const titleEl = document.getElementById('productTitle');
    const chassisEl = document.getElementById('productChassis');
    const availBadge = document.getElementById('productAvailability');
    const yearBadge = document.getElementById('productYear');
    const wheelBadge = document.getElementById('productWheel');

    if (titleEl) titleEl.textContent = model.name;
    if (chassisEl) chassisEl.textContent = model.chassis;
    if (availBadge) {
      availBadge.textContent = model.availability;
      if (!model.availability.includes('В наличии')) {
        availBadge.className = 'badge badge-amber';
      }
    }
    if (yearBadge) yearBadge.textContent = `${model.year} г.`;
    if (wheelBadge) wheelBadge.textContent = model.wheel_formula || '8x4';

    // Price Box
    const priceFormatted = document.getElementById('productPriceFormatted');
    const locationEl = document.getElementById('productLocation');
    const warrantyEl = document.getElementById('productWarranty');

    if (priceFormatted) priceFormatted.textContent = model.price_formatted;
    if (locationEl) locationEl.textContent = model.location;
    if (warrantyEl) warrantyEl.textContent = model.warranty;

    // Manager
    const mName = document.getElementById('productManagerName');
    const mPhone = document.getElementById('productManagerPhone');
    const mPhoneLink = document.getElementById('productManagerPhoneLink');

    if (mName) mName.textContent = model.manager || 'Отдел продаж';
    if (mPhone) mPhone.textContent = model.phone || '+7 906 113 51 16';
    if (mPhoneLink) mPhoneLink.href = `tel:${(model.phone || '').replace(/[^0-9+]/g, '')}`;

    // Spec Badges
    const sHeight = document.getElementById('specHeight');
    const sOutput = document.getElementById('specOutput');
    const sFolding = document.getElementById('specFolding');
    const sWheel = document.getElementById('specChassisFormula');
    const sPressure = document.getElementById('specPressure');
    const sHopper = document.getElementById('specHopper');

    if (sHeight) sHeight.textContent = `${model.boom_height} м`;
    if (sOutput) sOutput.textContent = `${model.output_m3h} м³/ч`;
    if (sFolding) sFolding.textContent = model.folding_type || '6RZ';
    if (sWheel) sWheel.textContent = model.wheel_formula || '8x4';
    if (sPressure) sPressure.textContent = model.specs['Давление подачи бетона'] || `${model.pressure_mpa || 8.8} МПа`;
    if (sHopper) sHopper.textContent = model.specs['Объем бункера'] || '550 Л';

    // Highlights Checklist
    const highlightsContainer = document.getElementById('productHighlightsList');
    if (highlightsContainer && model.highlights) {
      highlightsContainer.innerHTML = model.highlights.map(h => `
        <li style="margin-bottom: 10px; color: var(--text-secondary); display: flex; align-items: center; gap: 10px; font-size: 0.95rem;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7FB300" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>${h}</span>
        </li>
      `).join('');
    }

    // Full Specs Table
    const specsTableBody = document.getElementById('productFullSpecsBody');
    if (specsTableBody && model.specs) {
      let rowsHtml = '';
      for (const [key, val] of Object.entries(model.specs)) {
        rowsHtml += `
          <tr>
            <td style="color: var(--text-muted); width: 45%;">${key}</td>
            <td style="font-weight: 600; color: var(--text-main);">${val}</td>
          </tr>
        `;
      }
      // Add extra row for location and status
      rowsHtml += `
        <tr>
          <td style="color: var(--text-muted);">Город базирования / Склад</td>
          <td style="font-weight: 600; color: var(--text-main);">г. ${model.location} (${model.availability})</td>
        </tr>
      `;
      specsTableBody.innerHTML = rowsHtml;
    }
  }

  // Related Models
  function renderRelatedModels(current) {
    const container = document.getElementById('relatedModelsGrid');
    if (!container) return;

    const related = allModels.filter(m => m.id !== current.id).slice(0, 3);
    container.innerHTML = related.map(m => `
      <div class="card">
        <div class="card-img-container">
          <img src="${m.image}" alt="${m.name}" class="card-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?auto=format&fit=crop&w=800&q=80'">
          <div class="card-badge-top">
            <span class="badge ${m.availability.includes('В наличии') ? 'badge-green' : 'badge-amber'}">${m.availability}</span>
          </div>
          <div class="card-badge-top-right">
            <span class="badge badge-blue">${m.year} г.</span>
          </div>
        </div>
        <div class="card-body">
          <h3 class="card-title">${m.name}</h3>
          <div class="card-chassis">Шасси: <strong>${m.chassis}</strong></div>

          <div class="card-specs-mini">
            <div class="spec-mini-item">
              <span class="spec-mini-val">${m.boom_height} м</span>
              <span class="spec-mini-lbl">Стрела</span>
            </div>
            <div class="spec-mini-item">
              <span class="spec-mini-val">${m.output_m3h} м³/ч</span>
              <span class="spec-mini-lbl">Произв-сть</span>
            </div>
            <div class="spec-mini-item">
              <span class="spec-mini-val">${m.folding_type}</span>
              <span class="spec-mini-lbl">Сложение</span>
            </div>
            <div class="spec-mini-item">
              <span class="spec-mini-val">${m.wheel_formula}</span>
              <span class="spec-mini-lbl">Колеса</span>
            </div>
          </div>

          <div class="card-footer">
            <div class="price-tag">
              <span class="price-lbl">Стоимость:</span>
              <span class="price-amount">${m.price_formatted}</span>
            </div>
            <a href="./product.html?id=${m.id}" class="btn btn-primary" style="padding: 10px 18px; font-size: 0.9rem;">
              Перейти к модели
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Product Calculator
  function setupProductCalculator(model) {
    const calcName = document.getElementById('calcModelNameDisplay');
    const advanceRange = document.getElementById('advanceRange');
    const termRange = document.getElementById('termRange');
    const advanceValText = document.getElementById('advanceValText');
    const termValText = document.getElementById('termValText');

    const monthlyPaymentText = document.getElementById('monthlyPaymentText');
    const advanceAmountText = document.getElementById('advanceAmountText');

    if (calcName) calcName.value = `${model.name} (${model.chassis}) — ${model.price_formatted}`;

    function updateCalc() {
      const price = model.price || 35000000;
      const advancePercent = parseInt(advanceRange.value) || 20;
      const termMonths = parseInt(termRange.value) || 36;

      if (advanceValText) advanceValText.textContent = `${advancePercent}%`;
      if (termValText) termValText.textContent = `${termMonths} мес.`;

      const advanceSum = price * (advancePercent / 100);
      const financedSum = price - advanceSum;

      const monthlyRate = 0.13 / 12;
      const monthlyPayment = (financedSum * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) / (Math.pow(1 + monthlyRate, termMonths) - 1);

      if (advanceAmountText) advanceAmountText.textContent = `${Math.round(advanceSum).toLocaleString('ru-RU')} ₽`;
      if (monthlyPaymentText) monthlyPaymentText.textContent = `${Math.round(monthlyPayment).toLocaleString('ru-RU')} ₽/мес`;
    }

    if (advanceRange && termRange) {
      advanceRange.addEventListener('input', updateCalc);
      termRange.addEventListener('input', updateCalc);
      updateCalc();
    }
  }

  // Quote Modal Logic
  function setupQuoteModal(model) {
    const quoteModal = document.getElementById('quoteModal');
    const quoteCloseBtn = document.getElementById('quoteCloseBtn');
    const quoteForm = document.getElementById('quoteForm');
    const modelInput = document.getElementById('quoteModelInput');

    if (modelInput) modelInput.value = model.name;

    document.querySelectorAll('.btn-quote-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        if (quoteModal) quoteModal.classList.add('active');
      });
    });

    if (quoteCloseBtn) {
      quoteCloseBtn.addEventListener('click', () => {
        if (quoteModal) quoteModal.classList.remove('active');
      });
    }

    if (quoteModal) {
      quoteModal.addEventListener('click', (e) => {
        if (e.target === quoteModal) {
          quoteModal.classList.remove('active');
        }
      });
    }

    if (quoteForm) {
      quoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert(`Спасибо за вашу заявку на ${model.name}! Наш менеджер свяжется с вами в ближайшее время.`);
        if (quoteModal) quoteModal.classList.remove('active');
        quoteForm.reset();
      });
    }
  }

  // Dynamic Site Settings Sync
  function applySiteSettings() {
    const defaultSettings = {
      header: {
        phoneLabel: "Отдел продаж:",
        phone: "+7 (906) 113-51-16",
        phoneRaw: "+79061135116",
        quoteBtnText: "Запросить КП"
      },
      footer: {
        manager1: "Роженцев Артем Викторович: +7 906 113 51 16",
        manager2: "Рылов Роман: +7 967 246 40 60",
        locations: "Пермь, Забайкальск, Москва"
      }
    };

    let settings = defaultSettings;
    const saved = localStorage.getItem('zoomlion_site_settings');
    if (saved) {
      try { settings = JSON.parse(saved); } catch (e) {}
    }

    // Header
    const hLabel = document.getElementById('headerPhoneLabel');
    const hText = document.getElementById('headerPhoneText');
    const hLink = document.getElementById('headerPhoneLink');
    const hBtn = document.getElementById('headerQuoteBtn');
    if (hLabel) hLabel.textContent = settings.header?.phoneLabel || defaultSettings.header.phoneLabel;
    if (hText) hText.textContent = settings.header?.phone || defaultSettings.header.phone;
    if (hLink) hLink.href = `tel:${settings.header?.phoneRaw || defaultSettings.header.phoneRaw}`;
    if (hBtn) hBtn.textContent = settings.header?.quoteBtnText || defaultSettings.header.quoteBtnText;

    // Footer
    const fm1 = document.getElementById('footerManager1');
    const fm2 = document.getElementById('footerManager2');
    const floc = document.getElementById('footerLocations');
    if (fm1) fm1.textContent = settings.footer?.manager1 || defaultSettings.footer.manager1;
    if (fm2) fm2.textContent = settings.footer?.manager2 || defaultSettings.footer.manager2;
    if (floc) floc.textContent = `Склады наличия: ${settings.footer?.locations || defaultSettings.footer.locations}`;
  }
});
