/* daily-log.js — Daily food log with granular item management */

const MEAL_LABELS = {
  'pequeno-almoco': '🌅 Pequeno-Almoço',
  'almoco': '🍽️ Almoço',
  'lanche': '🍪 Lanche',
  'jantar': '🌙 Jantar',
  'snack': '🥤 Snack',
  'outro': '📝 Outro',
};

const MEAL_ORDER = ['pequeno-almoco', 'almoco', 'lanche', 'jantar', 'snack', 'outro'];

export function renderDailyLog(container, meals, { onDeleteMeal, onDeleteItem, onMoveItem }) {
  if (!meals || meals.length === 0) {
    container.innerHTML = `
      <div class="glass-card">
        <div class="empty-state">
          <div class="empty-state-icon">🍱</div>
          <div class="empty-state-text">Ainda não registaste nenhuma refeição hoje.</div>
        </div>
      </div>
    `;
    return;
  }

  // Group meals and calculate totals
  const grouped = MEAL_ORDER.map(type => {
    const typeMeals = meals.filter(m => normalizeMealType(m.meal_type) === type);
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    typeMeals.forEach(m => {
      m.items.forEach(item => {
        totals.calories += item.calories || 0;
        totals.protein += item.protein || 0;
        totals.carbs += item.carbs || 0;
        totals.fat += item.fat || 0;
      });
    });

    return { id: type, label: MEAL_LABELS[type], meals: typeMeals, totals };
  });

  container.innerHTML = `
    <div class="daily-log">
      ${grouped.map(group => `
        <div class="meal-group ${group.meals.length === 0 ? 'empty' : ''}" data-meal-type="${group.id}">
          <div class="meal-group-header">
            <div class="meal-group-title">
              <span class="meal-group-name">${group.label}</span>
            </div>
            ${group.totals.calories > 0 ? `
              <div class="meal-group-macros">
                <span>${Math.round(group.totals.calories)} <small>kcal</small></span>
                <span style="color:var(--prot)">${group.totals.protein.toFixed(1)}g <small>P</small></span>
                <span style="color:var(--carb)">${group.totals.carbs.toFixed(1)}g <small>H</small></span>
                <span style="color:var(--fat)">${group.totals.fat.toFixed(1)}g <small>G</small></span>
              </div>
            ` : ''}
          </div>
          <div class="meal-items-container" id="drop-zone-${group.id}">
            ${group.meals.map(meal => meal.items.map((item, itemIdx) => `
              <div class="log-item" draggable="true" data-meal-id="${meal.id}" data-item-idx="${itemIdx}">
                <div class="log-item-main">
                  <div class="log-item-info">
                    <div class="log-item-name">${item.name}</div>
                    <div class="log-item-qty">${item.quantity}</div>
                  </div>
                  <div class="log-item-macros">
                    <span class="macro-val">${Math.round(item.calories)} <small>kcal</small></span>
                    <div class="log-item-actions">
                      ${item.source_info ? `<a href="${item.source_info}" target="_blank" class="action-btn" title="Ver Fonte">🔗</a>` : ''}
                      <button class="action-btn delete-item-btn" data-meal-id="${meal.id}" data-item-idx="${itemIdx}" title="Remover item">✕</button>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')).join('')}
            ${group.meals.length === 0 ? '<div class="drop-placeholder">Arrasta algo para aqui</div>' : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // --- Handlers using Delegation ---
  container.onclick = (e) => {
    const deleteBtn = e.target.closest('.delete-item-btn');
    if (deleteBtn) {
      console.log('🖱️ Clique em Apagar detetado via delegação');
      e.stopPropagation();
      const { mealId, itemIdx } = deleteBtn.dataset;
      if (confirm('Remover este ingrediente?')) {
        onDeleteItem(mealId, parseInt(itemIdx));
      }
    }
  };

  // --- Drag & Drop ---
  const logItems = container.querySelectorAll('.log-item');
  const groups = container.querySelectorAll('.meal-group');

  logItems.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      console.log('🏃 Drag Start:', item.dataset.mealId);
      item.classList.add('dragging');
      e.dataTransfer.setData('text/plain', JSON.stringify({
        mealId: item.dataset.mealId,
        itemIdx: parseInt(item.dataset.itemIdx)
      }));
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
    });
  });

  groups.forEach(group => {
    group.addEventListener('dragover', (e) => {
      e.preventDefault();
      group.classList.add('drag-over');
    });

    group.addEventListener('dragleave', () => {
      group.classList.remove('drag-over');
    });

    group.addEventListener('drop', (e) => {
      e.preventDefault();
      group.classList.remove('drag-over');
      try {
        const dataTransferText = e.dataTransfer.getData('text/plain');
        console.log('📥 Drop detetado. Dados:', dataTransferText);
        const data = JSON.parse(dataTransferText);
        const targetType = group.dataset.mealType;
        
        if (data && targetType) {
          onMoveItem(data.mealId, data.itemIdx, targetType);
        }
      } catch (err) {
        console.error('❌ Erro no drop:', err);
      }
    });
  });
}

function normalizeMealType(type) {
  if (!type) return 'outro';
  const t = type.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (t.includes('pequeno') || t.includes('peq')) return 'pequeno-almoco';
  if (t.includes('almoco')) return 'almoco';
  if (t.includes('lanche')) return 'lanche';
  if (t.includes('jantar') || t.includes('janta')) return 'jantar';
  if (t.includes('snack') || t.includes('petisco')) return 'snack';
  return 'outro';
}
