// Admin Panel Logic for Zoomlion Catalog Management
document.addEventListener('DOMContentLoaded', async () => {
  let models = [];

  // Load models from localStorage or fallback to JSON
  async function loadAdminData() {
    const localData = localStorage.getItem('zoomlion_models');
    if (localData) {
      try {
        models = JSON.parse(localData);
      } catch (e) {
        console.error('Error parsing localStorage:', e);
      }
    }

    if (!models || models.length === 0) {
      try {
        const response = await fetch('./src/data/models.json');
        models = await response.json();
        saveModels();
      } catch (err) {
        console.error('Failed to load JSON models:', err);
      }
    }

    renderAdminTable();
  }

  // Save to LocalStorage
  function saveModels() {
    localStorage.setItem('zoomlion_models', JSON.stringify(models));
    renderAdminTable();
  }

  // DOM Elements
  const tableBody = document.getElementById('adminTableBody');
  const countText = document.getElementById('adminCountText');
  const searchInput = document.getElementById('adminSearchInput');

  const editModal = document.getElementById('editModal');
  const editModalCloseBtn = document.getElementById('editModalCloseBtn');
  const cancelFormBtn = document.getElementById('cancelFormBtn');
  const modelForm = document.getElementById('modelForm');
  const formModalTitle = document.getElementById('formModalTitle');

  const addModelBtn = document.getElementById('addModelBtn');
  const resetDataBtn = document.getElementById('resetDataBtn');
  const exportJsonBtn = document.getElementById('exportJsonBtn');

  // Render Table
  function renderAdminTable() {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = models.filter(m => 
      m.name.toLowerCase().includes(searchTerm) ||
      m.chassis.toLowerCase().includes(searchTerm) ||
      m.location.toLowerCase().includes(searchTerm)
    );

    if (countText) countText.textContent = filtered.length;

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: #64748B;">
            Модели не найдены.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(m => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #E2E8F0';

      const isAvailable = m.availability.includes('В наличии');
      const badgeStyle = isAvailable ? 'background: #F4F9E6; color: #6DA600;' : 'background: #FFFBEB; color: #D97706;';

      tr.innerHTML = `
        <td>
          <img src="${m.image}" alt="${m.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?auto=format&fit=crop&w=300&q=80'">
        </td>
        <td>
          <div style="font-weight: 700; color: #0F172A; font-size: 1.05rem;">${m.name}</div>
          <div style="font-size: 0.85rem; color: #64748B;">${m.chassis}</div>
        </td>
        <td>
          <div style="font-weight: 600; color: #0F172A;">${m.boom_height} м</div>
          <div style="font-size: 0.8rem; color: #64748B;">Сложение: ${m.folding_type}</div>
        </td>
        <td>
          <div style="font-weight: 700; color: #6DA600;">${m.price_formatted}</div>
        </td>
        <td>
          <span style="display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; ${badgeStyle}">
            ${m.availability}
          </span>
          <div style="font-size: 0.8rem; color: #64748B; margin-top: 2px;">г. ${m.location}</div>
        </td>
        <td style="text-align: right;">
          <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
            <button class="btn btn-outline btn-edit-model" data-id="${m.id}" style="padding: 6px 12px; font-size: 0.85rem; border-width: 1px; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              <span>Изм.</span>
            </button>
            <button class="btn btn-outline btn-delete-model" data-id="${m.id}" style="padding: 6px 12px; font-size: 0.85rem; color: #DC2626; border-color: #FCA5A5; border-width: 1px; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              <span>Удалить</span>
            </button>
          </div>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    // Attach row events
    document.querySelectorAll('.btn-edit-model').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openEditModal(id);
      });
    });

    document.querySelectorAll('.btn-delete-model').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        deleteModel(id);
      });
    });
  }

  if (searchInput) searchInput.addEventListener('input', renderAdminTable);

  // Open Edit Modal
  function openEditModal(modelId = null) {
    if (modelId) {
      const m = models.find(item => item.id === modelId);
      if (!m) return;
      formModalTitle.textContent = `Редактировать: ${m.name}`;

      document.getElementById('fieldId').value = m.id;
      document.getElementById('fieldName').value = m.name;
      document.getElementById('fieldChassisBrand').value = m.chassis_brand || 'SITRAK';
      document.getElementById('fieldChassis').value = m.chassis;
      document.getElementById('fieldWheelFormula').value = m.wheel_formula || '8x4';
      document.getElementById('fieldFoldingType').value = m.folding_type || '6RZ';
      document.getElementById('fieldBoomHeight').value = m.boom_height;
      document.getElementById('fieldOutput').value = m.output_m3h || 180;
      document.getElementById('fieldYear').value = m.year || 2025;
      document.getElementById('fieldPrice').value = m.price;
      document.getElementById('fieldPriceFormatted').value = m.price_formatted;
      document.getElementById('fieldAvailability').value = m.availability;
      document.getElementById('fieldLocation').value = m.location;
      document.getElementById('fieldImage').value = m.image;
      document.getElementById('fieldManager').value = m.manager || '';
      document.getElementById('fieldPhone').value = m.phone || '';
      document.getElementById('fieldHighlights').value = (m.highlights || []).join(', ');
    } else {
      formModalTitle.textContent = 'Добавить новый автобетононасос';
      modelForm.reset();
      document.getElementById('fieldId').value = '';
    }

    editModal.classList.add('active');
  }

  // Delete Model
  function deleteModel(modelId) {
    const m = models.find(item => item.id === modelId);
    if (!m) return;
    if (confirm(`Вы действительно хотите удалить модель "${m.name}"?`)) {
      models = models.filter(item => item.id !== modelId);
      saveModels();
    }
  }

  // Handle Form Submit
  if (modelForm) {
    modelForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const existingId = document.getElementById('fieldId').value;
      const name = document.getElementById('fieldName').value.trim();
      const chassis_brand = document.getElementById('fieldChassisBrand').value;
      const chassis = document.getElementById('fieldChassis').value.trim();
      const wheel_formula = document.getElementById('fieldWheelFormula').value;
      const folding_type = document.getElementById('fieldFoldingType').value;
      const boom_height = parseInt(document.getElementById('fieldBoomHeight').value) || 30;
      const output_m3h = parseInt(document.getElementById('fieldOutput').value) || 160;
      const year = parseInt(document.getElementById('fieldYear').value) || 2025;
      const price = parseFloat(document.getElementById('fieldPrice').value) || 30000000;
      const price_formatted = document.getElementById('fieldPriceFormatted').value.trim();
      const availability = document.getElementById('fieldAvailability').value.trim();
      const location = document.getElementById('fieldLocation').value.trim();
      const image = document.getElementById('fieldImage').value.trim();
      const manager = document.getElementById('fieldManager').value.trim();
      const phone = document.getElementById('fieldPhone').value.trim();

      const highlightsRaw = document.getElementById('fieldHighlights').value;
      const highlights = highlightsRaw.split(',').map(s => s.trim()).filter(Boolean);

      if (existingId) {
        // Edit existing
        const index = models.findIndex(m => m.id === existingId);
        if (index !== -1) {
          models[index] = {
            ...models[index],
            name,
            chassis_brand,
            chassis,
            wheel_formula,
            folding_type,
            boom_height,
            output_m3h,
            year,
            price,
            price_formatted,
            availability,
            location,
            image,
            manager,
            phone,
            highlights,
            specs: {
              ...models[index].specs,
              'Высота подачи': `${boom_height} м`,
              'Макс. производительность': `${output_m3h} м³/ч`,
              'Тип стрелы': `${folding_type}`
            }
          };
        }
      } else {
        // Add new
        const newId = 'zoomlion-' + Date.now();
        const newModel = {
          id: newId,
          name,
          chassis,
          chassis_brand,
          wheel_formula,
          boom_height,
          folding_type,
          price,
          price_formatted,
          output_m3h,
          pressure_mpa: 8.8,
          year,
          availability,
          location,
          warranty: '12 месяцев',
          manager: manager || 'Отдел продаж',
          phone: phone || '+7 906 113 51 16',
          image,
          highlights,
          specs: {
            'Высота подачи': `${boom_height} м`,
            'Макс. производительность': `${output_m3h} м³/ч`,
            'Тип стрелы': `${folding_type}`
          }
        };
        models.unshift(newModel);
      }

      saveModels();
      editModal.classList.remove('active');
    });
  }

  // Modal Controls
  if (addModelBtn) addModelBtn.addEventListener('click', () => openEditModal());
  if (editModalCloseBtn) editModalCloseBtn.addEventListener('click', () => editModal.classList.remove('active'));
  if (cancelFormBtn) cancelFormBtn.addEventListener('click', () => editModal.classList.remove('active'));

  // Reset Data to Default
  if (resetDataBtn) {
    resetDataBtn.addEventListener('click', async () => {
      if (confirm('Сбросить все данные к исходному состоянию из models.json? Все внесенные изменения будут удалены.')) {
        localStorage.removeItem('zoomlion_models');
        models = [];
        await loadAdminData();
      }
    });
  }

  // Export models.json file
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(models, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'models.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });
  }

  loadAdminData();
});
