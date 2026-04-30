/* nutrition-summary.js — Dashboard de macros */

const CIRCUMFERENCE = 2 * Math.PI * 34; // radius = 34

function ringSVG(color, percent, value) {
  const clamped = Math.min(percent, 100);
  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;
  return `
    <svg viewBox="0 0 80 80">
      <circle class="ring-bg" cx="40" cy="40" r="34"/>
      <circle class="ring-progress" cx="40" cy="40" r="34"
        style="stroke:${color};stroke-dasharray:${CIRCUMFERENCE};stroke-dashoffset:${offset}"
      />
    </svg>
    <div class="ring-label" style="color:${color}">${Math.round(percent)}%</div>
  `;
}

export function renderNutritionSummary(container, totals, goals) {
  const macros = [
    { key: 'calories', name: 'Calorias', unit: 'kcal', color: 'var(--cal)', cssClass: 'calories' },
    { key: 'protein', name: 'Proteína', unit: 'g', color: 'var(--prot)', cssClass: 'protein' },
    { key: 'carbs', name: 'Hidratos', unit: 'g', color: 'var(--carb)', cssClass: 'carbs' },
    { key: 'fat', name: 'Gordura', unit: 'g', color: 'var(--fat)', cssClass: 'fat' },
  ];

  const secondaryMacros = [
    { key: 'fiber', name: 'Fibra', unit: 'g', color: 'var(--fiber)' },
    { key: 'sugar', name: 'Açúcar', unit: 'g', color: 'var(--sugar)' },
    { key: 'saturated_fat', name: 'Gord. Sat.', unit: 'g', color: 'var(--sat)' },
    { key: 'sodium', name: 'Sódio', unit: 'mg', color: 'var(--sod)' },
  ];

  container.innerHTML = `
    ${macros.map((m, i) => {
      const val = totals[m.key] || 0;
      const goal = goals[m.key] || 1;
      const pct = (val / goal) * 100;
      return `
        <div class="macro-card ${m.cssClass}" style="animation-delay: ${i * 80}ms">
          <div class="macro-ring">
            ${ringSVG(m.color, pct, val)}
          </div>
          <div class="macro-name">${m.name}</div>
          <div class="macro-values">
            <span>${m.key === 'calories' ? Math.round(val) : val.toFixed(1)}</span> / ${goal}${m.unit}
          </div>
        </div>
      `;
    }).join('')}
    <div class="secondary-macros">
      ${secondaryMacros.map((m, i) => {
        const val = totals[m.key] || 0;
        const goal = goals[m.key] || 1;
        const pct = Math.min((val / goal) * 100, 100);
        return `
          <div class="mini-macro" style="animation-delay: ${(i + 4) * 80}ms">
            <div class="mini-label">${m.name}</div>
            <div class="mini-value" style="color:${m.color}">
              ${m.key === 'sodium' ? Math.round(val) : val.toFixed(1)}${m.unit}
            </div>
            <div class="mini-bar">
              <div class="mini-bar-fill" style="width:${pct}%;background:${m.color}"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function calculateTotals(meals) {
  const totals = {
    calories: 0, protein: 0, carbs: 0, fat: 0,
    fiber: 0, sugar: 0, saturated_fat: 0, sodium: 0,
  };

  for (const meal of meals) {
    for (const item of meal.items) {
      totals.calories += item.calories || 0;
      totals.protein += item.protein || 0;
      totals.carbs += item.carbs || 0;
      totals.fat += item.fat || 0;
      totals.fiber += item.fiber || 0;
      totals.sugar += item.sugar || 0;
      totals.saturated_fat += item.saturated_fat || 0;
      totals.sodium += item.sodium || 0;
    }
  }

  return totals;
}
