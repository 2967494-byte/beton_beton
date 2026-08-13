// App Script for Zoomlion Auto Concrete Pump Truck Catalog
document.addEventListener('DOMContentLoaded', async () => {
  let allModels = [];

  // Fetch models data (localStorage priority for admin panel sync)
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
      localStorage.setItem('zoomlion_models', JSON.stringify(allModels));
    } catch (err) {
      console.error('Failed to load models:', err);
      return;
    }
  }

  // DOM Elements
  const gridContainer = document.getElementById('modelsGrid');
  const searchInput = document.getElementById('searchInput');
  const heightFilter = document.getElementById('heightFilter');
  const chassisFilter = document.getElementById('chassisFilter');
  const statusFilter = document.getElementById('statusFilter');
  const countBadge = document.getElementById('modelsCount');
  
  // Modal Elements
  const modalBackdrop = document.getElementById('detailModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBody = document.getElementById('modalBody');

  // Quote Modal Elements
  const quoteModal = document.getElementById('quoteModal');
  const quoteCloseBtn = document.getElementById('quoteCloseBtn');
  const quoteForm = document.getElementById('quoteForm');

  // Render Cards Function
  function renderModels(models) {
    if (!gridContainer) return;
    gridContainer.innerHTML = '';
    countBadge.textContent = models.length;

    if (models.length === 0) {
      gridContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: #fff; border-radius: 16px; border: 1px solid #E2E8F0;">
          <h3 style="font-size: 1.5rem; color: #334155; margin-bottom: 8px;">Модели не найдены</h3>
          <p style="color: #64748B;">Попробуйте изменить параметры фильтрации или поисковый запрос.</p>
        </div>
      `;
      return;
    }

    models.forEach(model => {
      const card = document.createElement('div');
      card.className = 'card';

      const isAvailable = model.availability.includes('В наличии');
      const badgeClass = isAvailable ? 'badge-green' : 'badge-amber';

      card.innerHTML = `
        <div class="card-img-container">
          <img src="${model.image}" alt="${model.name}" class="card-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?auto=format&fit=crop&w=800&q=80'">
          <div class="card-badge-top">
            <span class="badge ${badgeClass}">${model.availability}</span>
          </div>
          <div class="card-badge-top-right">
            <span class="badge badge-blue">${model.year} г.</span>
          </div>
        </div>
        <div class="card-body">
          <h3 class="card-title">${model.name}</h3>
          <div class="card-chassis">Шасси: <strong>${model.chassis}</strong></div>

          <div class="card-specs-mini">
            <div class="spec-mini-item">
              <span class="spec-mini-val">${model.boom_height} м</span>
              <span class="spec-mini-lbl">Высота стрелы</span>
            </div>
            <div class="spec-mini-item">
              <span class="spec-mini-val">${model.output_m3h} м³/ч</span>
              <span class="spec-mini-lbl">Производ-сть</span>
            </div>
            <div class="spec-mini-item">
              <span class="spec-mini-val">${model.folding_type}</span>
              <span class="spec-mini-lbl">Тип стрелы</span>
            </div>
            <div class="spec-mini-item">
              <span class="spec-mini-val">${model.wheel_formula}</span>
              <span class="spec-mini-lbl">Колеса</span>
            </div>
          </div>

          <div class="card-footer">
            <div class="price-tag">
              <span class="price-lbl">Стоимость DDP:</span>
              <span class="price-amount">${model.price_formatted}</span>
            </div>
            <button class="btn btn-primary btn-detail" data-id="${model.id}">
              Характеристики
            </button>
          </div>
        </div>
      `;

      gridContainer.appendChild(card);
    });

    // Add click listeners to detail buttons
    document.querySelectorAll('.btn-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modelId = e.currentTarget.getAttribute('data-id');
        openDetailModal(modelId);
      });
    });
  }

  // Filter Models Logic
  function filterModels() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedHeight = heightFilter ? heightFilter.value : 'all';
    const selectedChassis = chassisFilter ? chassisFilter.value : 'all';
    const selectedStatus = statusFilter ? statusFilter.value : 'all';

    const filtered = allModels.filter(model => {
      // Search
      const matchesSearch = model.name.toLowerCase().includes(searchTerm) ||
                            model.chassis.toLowerCase().includes(searchTerm) ||
                            model.location.toLowerCase().includes(searchTerm);
      
      // Height filter
      let matchesHeight = true;
      if (selectedHeight === 'under40') matchesHeight = model.boom_height < 40;
      else if (selectedHeight === '40to50') matchesHeight = model.boom_height >= 40 && model.boom_height <= 50;
      else if (selectedHeight === 'over50') matchesHeight = model.boom_height > 50;

      // Chassis filter
      let matchesChassis = true;
      if (selectedChassis !== 'all') matchesChassis = model.chassis_brand === selectedChassis;

      // Status filter
      let matchesStatus = true;
      if (selectedStatus === 'in_stock') matchesStatus = model.availability.includes('В наличии');
      else if (selectedStatus === 'on_order') matchesStatus = model.availability.includes('Под заказ');

      return matchesSearch && matchesHeight && matchesChassis && matchesStatus;
    });

    renderModels(filtered);
  }

  // Event Listeners for Filters
  if (searchInput) searchInput.addEventListener('input', filterModels);
  if (heightFilter) heightFilter.addEventListener('change', filterModels);
  if (chassisFilter) chassisFilter.addEventListener('change', filterModels);
  if (statusFilter) statusFilter.addEventListener('change', filterModels);

  // Quick Filter Pill Buttons
  document.querySelectorAll('.pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');

      const filterVal = e.currentTarget.getAttribute('data-height');
      if (heightFilter) {
        heightFilter.value = filterVal;
        filterModels();
      }
    });
  });

  // Modal Open Logic
  function openDetailModal(modelId) {
    const model = allModels.find(m => m.id === modelId);
    if (!model || !modalBody) return;

    let specsRows = '';
    for (const [key, val] of Object.entries(model.specs)) {
      specsRows += `
        <tr>
          <td>${key}</td>
          <td>${val}</td>
        </tr>
      `;
    }

    let highlightsList = model.highlights.map(h => `
      <li style="margin-bottom: 8px; color: #334155; display: flex; align-items: center; gap: 10px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7FB300" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>${h}</span>
      </li>
    `).join('');

    modalBody.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px;">
        <div>
          <img src="${model.image}" alt="${model.name}" style="width: 100%; height: 320px; object-fit: cover; border-radius: 16px; border: 1px solid #E2E8F0;" onerror="this.src='https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?auto=format&fit=crop&w=800&q=80'">
        </div>
        <div>
          <span class="badge badge-green" style="margin-bottom: 12px;">${model.availability}</span>
          <h2 style="font-size: 2rem; margin-bottom: 8px;">${model.name}</h2>
          <p style="color: #64748B; font-size: 1.1rem; margin-bottom: 20px;">На базе автомобиля <strong>${model.chassis}</strong></p>
          
          <div style="background: #F8FAFC; padding: 20px; border-radius: 12px; border: 1px solid #E2E8F0; margin-bottom: 20px;">
            <div style="font-size: 0.85rem; color: #64748B;">Стоимость (DDP ${model.location}):</div>
            <div style="font-size: 2rem; font-weight: 800; color: #6DA600;">${model.price_formatted}</div>
            <div style="font-size: 0.85rem; color: #64748B; margin-top: 4px;">Гарантия: ${model.warranty}</div>
          </div>

          <button class="btn btn-primary" id="modalRequestBtn" style="width: 100%; font-size: 1.1rem; padding: 14px;">
            Запросить КП / Оформить бронь
          </button>
        </div>
      </div>

      <h3 style="font-size: 1.4rem; margin-bottom: 16px;">Преимущества и особенности</h3>
      <ul style="list-style: none; padding: 0; margin-bottom: 32px;">
        ${highlightsList}
      </ul>

      <h3 style="font-size: 1.4rem; margin-bottom: 16px;">Технические характеристики (ТТХ)</h3>
      <table class="specs-table">
        <tbody>
          ${specsRows}
        </tbody>
      </table>

      <div style="margin-top: 32px; padding: 20px; background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 12px;">
        <h4 style="color: #0369A1; margin-bottom: 4px;">Персональный менеджер:</h4>
        <p style="font-size: 1.1rem; font-weight: 700; color: #0F172A;">${model.manager}</p>
        <p style="color: #0284C7; font-weight: 600;">Телефон: ${model.phone}</p>
      </div>
    `;

    modalBackdrop.classList.add('active');

    // Listener inside modal
    const reqBtn = document.getElementById('modalRequestBtn');
    if (reqBtn) {
      reqBtn.addEventListener('click', () => {
        modalBackdrop.classList.remove('active');
        openQuoteModal(model.name);
      });
    }
  }

  // Close Modal
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      modalBackdrop.classList.remove('active');
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        modalBackdrop.classList.remove('active');
      }
    });
  }

  // Quote Modal Logic
  function openQuoteModal(modelName = '') {
    if (!quoteModal) return;
    const modelInput = document.getElementById('quoteModelInput');
    if (modelInput) modelInput.value = modelName;
    quoteModal.classList.add('active');
  }

  if (quoteCloseBtn) {
    quoteCloseBtn.addEventListener('click', () => {
      quoteModal.classList.remove('active');
    });
  }

  if (quoteModal) {
    quoteModal.addEventListener('click', (e) => {
      if (e.target === quoteModal) {
        quoteModal.classList.remove('active');
      }
    });
  }

  // Trigger Quote modal from header or custom buttons
  document.querySelectorAll('.btn-quote-trigger').forEach(btn => {
    btn.addEventListener('click', () => openQuoteModal());
  });

  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Спасибо за вашу заявку! Наш менеджер свяжется с вами в течение 15 минут.');
      quoteModal.classList.remove('active');
      quoteForm.reset();
    });
  }

  // Leasing Calculator Logic
  const calcModelSelect = document.getElementById('calcModel');
  const advanceRange = document.getElementById('advanceRange');
  const advanceValText = document.getElementById('advanceValText');
  const termRange = document.getElementById('termRange');
  const termValText = document.getElementById('termValText');

  const monthlyPaymentText = document.getElementById('monthlyPaymentText');
  const advanceAmountText = document.getElementById('advanceAmountText');

  function calculateLeasing() {
    if (!calcModelSelect) return;
    const selectedPrice = parseFloat(calcModelSelect.value) || 30000000;
    const advancePercent = parseInt(advanceRange.value) || 20;
    const termMonths = parseInt(termRange.value) || 36;

    advanceValText.textContent = `${advancePercent}%`;
    termValText.textContent = `${termMonths} мес.`;

    const advanceSum = selectedPrice * (advancePercent / 100);
    const financedSum = selectedPrice - advanceSum;

    // Approximate leasing rate ~13% per annum
    const monthlyRate = 0.13 / 12;
    const monthlyPayment = (financedSum * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) / (Math.pow(1 + monthlyRate, termMonths) - 1);

    advanceAmountText.textContent = `${Math.round(advanceSum).toLocaleString('ru-RU')} ₽`;
    monthlyPaymentText.textContent = `${Math.round(monthlyPayment).toLocaleString('ru-RU')} ₽/мес`;
  }

  if (calcModelSelect && advanceRange && termRange) {
    calcModelSelect.addEventListener('change', calculateLeasing);
    advanceRange.addEventListener('input', calculateLeasing);
    termRange.addEventListener('input', calculateLeasing);
  }

  // Populate Leasing Select
  if (calcModelSelect && allModels.length > 0) {
    calcModelSelect.innerHTML = allModels.map(m => `
      <option value="${m.price}">${m.name} (${m.chassis}) — ${m.price_formatted}</option>
    `).join('');
    calculateLeasing();
  }

  // Initial Render
  renderModels(allModels);
});
