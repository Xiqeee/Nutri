/* daily-log.js — Daily food log */

const MEAL_LABELS = {
  'pequeno-almoco': '🌅 Pequeno-Almoço',
  'almoco': '🍽️ Almoço',
  'lanche': '🍪 Lanche',
  'jantar': '🌙 Jantar',
  'snack': '🥤 Snack',
  'outro': '📝 Outro',
};

const MEAL_ORDER = ['pequeno-almoco', 'almoco', 'lanche', 'jantar', 'snack', 'outro'];

export function renderDailyLog(container, meals, { onDeleteMeal, onEditMeal }) {
  if (!meals || meals.length === 0) {
    container.innerHTML = `
      <div class="glass-card">
        <div class="log-header">
          <div class="log-title">📋 Registo do Dia</div>
        </div>
        <div class="empty-state">
          <div class="empty-state-icon">🍽️</div>
          <div class="empty-state-text">
            Ainda não registaste nenhuma refeição hoje.<br>
            Escreve o que comeste acima para começar!
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Group meals by type
  const grouped = {};
  for (const meal of meals) {
    const type = normalizeMealType(meal.meal_type);
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(meal);
  }

  const sortedTypes = MEAL_ORDER.filter(t => grouped[t]);

  container.innerHTML = `
    <div class="glass-card">
      <div class="log-header">
        <div class="log-title">📋 Registo do Dia</div>
        <div style="font-size:0.8rem;color:var(--text-muted)">${meals.length} refeição(ões)</div>
      </div>
      ${sortedTypes.map(type => `
        <div class="meal-group">
          <div class="meal-group-header">
            ${MEAL_LABELS[type] || type}
          </div>
          ${grouped[type].map(meal =>
            meal.items.map((item, idx) => `
              <div class="log-item-container" data-meal-id="${meal.id}" data-item-idx="${idx}">
                <div class="log-item clickable-item">
                  <div class="log-item-info">
                    <div class="log-item-name">${item.name}</div>
                    <div class="log-item-qty">${item.quantity}</div>
                  </div>
                  <div class="log-item-macros">
                    <span style="color:var(--color-calories)">${Math.round(item.calories)} kcal</span>
                    <span style="color:var(--color-protein)">${item.protein.toFixed(1)}g P</span>
                  </div>
                  <div class="log-item-actions">
                    ${idx === 0 ? `
                      <button class="log-item-edit" data-meal-id="${meal.id}" title="Editar refeição">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2,0 0 0-2 2v14a2 2,0 0 0 2 2h14a2 2,0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button class="log-item-delete" data-meal-id="${meal.id}" title="Eliminar refeição">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"/></svg>
                      </button>
                    ` : ''}
                  </div>
                </div>
                
                <div class="item-details hidden">
                  <div class="details-grid">
                    <div class="detail-pill"><span>Hidratos:</span> <strong>${item.carbs.toFixed(1)}g</strong></div>
                    <div class="detail-pill"><span>Açúcar:</span> <strong>${(item.sugar || 0).toFixed(1)}g</strong></div>
                    <div class="detail-pill"><span>Gordura:</span> <strong>${item.fat.toFixed(1)}g</strong></div>
                    <div class="detail-pill"><span>Saturada:</span> <strong>${(item.saturated_fat || 0).toFixed(1)}g</strong></div>
                    <div class="detail-pill"><span>Fibra:</span> <strong>${(item.fiber || 0).toFixed(1)}g</strong></div>
                    <div class="detail-pill"><span>Sódio:</span> <strong>${(item.sodium || 0).toFixed(0)}mg</strong></div>
                  </div>
                  ${meal.source_info ? `
                    <div class="item-source">
                      <span class="source-icon">🔍</span> Fonte: ${meal.source_info}
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')
          ).join('')}
        </div>
      `).join('')}
    </div>
  `;

  // Toggle expansion
  container.querySelectorAll('.clickable-item').forEach(item => {
    item.addEventListener('click', (e) => {
      // Don't expand if clicking actions
      if (e.target.closest('.log-item-actions')) return;
      
      const container = item.closest('.log-item-container');
      const details = container.querySelector('.item-details');
      details.classList.toggle('hidden');
      item.classList.toggle('expanded');
    });
  });

  // Edit buttons
  container.querySelectorAll('.log-item-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onEditMeal(btn.dataset.mealId);
    });
  });

  // Delete buttons
  container.querySelectorAll('.log-item-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const mealId = btn.dataset.mealId;
      if (confirm('Tens a certeza que queres eliminar esta refeição?')) {
        onDeleteMeal(mealId);
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
