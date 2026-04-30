/* food-input.js — Input component */

const MEAL_TYPES = [
  { id: 'pequeno-almoco', label: '🌅 Peq. Almoço' },
  { id: 'almoco', label: '🍽️ Almoço' },
  { id: 'lanche', label: '🍪 Lanche' },
  { id: 'jantar', label: '🌙 Jantar' },
  { id: 'snack', label: '🥤 Snack' },
];

export function renderFoodInput(container, { onAnalyze, selectedMeal, onMealSelect }) {
  container.innerHTML = `
    <div class="glass-card">
      <div class="input-header">
        <div class="input-title">✍️ O que comeste?</div>
      </div>
      <div class="meal-selector" id="meal-selector">
        ${MEAL_TYPES.map(m => `
          <button class="meal-btn ${selectedMeal === m.id ? 'active' : ''}" data-meal="${m.id}">${m.label}</button>
        `).join('')}
      </div>
      <textarea
        id="food-text"
        class="food-textarea"
        placeholder="Ex: Comi 100g de frango grelhado, 120g de arroz basmati e uma salada com tomate e pepino..."
        style="margin-top: var(--space-md)"
      ></textarea>
      <div id="input-error"></div>
      <div id="preview-container"></div>
      <div class="input-actions" id="input-actions">
        <button class="btn-primary" id="btn-analyze">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          Analisar
        </button>
      </div>
    </div>
  `;

  // Meal selector events
  container.querySelectorAll('.meal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.meal-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onMealSelect(btn.dataset.meal);
    });
  });

  // Analyze button
  const btnAnalyze = container.querySelector('#btn-analyze');
  const textarea = container.querySelector('#food-text');

  btnAnalyze.addEventListener('click', () => {
    const text = textarea.value.trim();
    if (!text) {
      showError(container, 'Escreve o que comeste antes de analisar.');
      return;
    }
    onAnalyze(text);
  });

  // Enter key (Ctrl+Enter)
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      btnAnalyze.click();
    }
  });
}

export function setLoading(container, loading) {
  const btn = container.querySelector('#btn-analyze');
  const textarea = container.querySelector('#food-text');
  if (!btn) return;

  if (loading) {
    btn.disabled = true;
    btn.innerHTML = '<div class="loading-spinner"></div> A analisar...';
    textarea.disabled = true;
  } else {
    btn.disabled = false;
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      Analisar
    `;
    textarea.disabled = false;
  }
}

export function showPreview(container, data, { onSave, onDiscard }) {
  const previewContainer = container.querySelector('#preview-container');
  if (!previewContainer) return;

  previewContainer.innerHTML = `
    <div class="preview-section">
      <div class="preview-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        Resultado da análise
      </div>
      <div class="preview-items">
        ${data.items.map((item, i) => `
          <div class="preview-item" style="animation-delay: ${i * 60}ms">
            <div>
              <span class="preview-item-name">${item.name}</span>
              <span class="preview-item-qty">${item.quantity}</span>
            </div>
            <div class="preview-item-macros">
              <span><span class="dot" style="background:var(--color-calories)"></span> ${Math.round(item.calories)} kcal</span>
              <span><span class="dot" style="background:var(--color-protein)"></span> ${item.protein.toFixed(1)}g P</span>
              <span><span class="dot" style="background:var(--color-carbs)"></span> ${item.carbs.toFixed(1)}g H</span>
              <span><span class="dot" style="background:var(--color-fat)"></span> ${item.fat.toFixed(1)}g G</span>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="preview-actions">
        <button class="btn-secondary" id="btn-discard">Descartar</button>
        <button class="btn-primary" id="btn-save">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>
          Guardar
        </button>
      </div>
    </div>
  `;

  previewContainer.querySelector('#btn-save').addEventListener('click', onSave);
  previewContainer.querySelector('#btn-discard').addEventListener('click', onDiscard);
}

export function clearPreview(container) {
  const previewContainer = container.querySelector('#preview-container');
  if (previewContainer) previewContainer.innerHTML = '';
}

export function clearInput(container) {
  const textarea = container.querySelector('#food-text');
  if (textarea) textarea.value = '';
  clearPreview(container);
}

function showError(container, message) {
  const errorDiv = container.querySelector('#input-error');
  if (!errorDiv) return;
  errorDiv.innerHTML = `<div class="error-message">${message}</div>`;
  setTimeout(() => { errorDiv.innerHTML = ''; }, 4000);
}

export function showInputError(container, message) {
  showError(container, message);
}
