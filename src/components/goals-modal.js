/* goals-modal.js — Modal para definir metas diárias */

import { saveGoals, loadGoals, getDefaultGoals } from '../storage.js';

const FIELDS = [
  { key: 'calories', label: 'Calorias', unit: 'kcal', color: 'var(--color-calories)', primary: true },
  { key: 'protein', label: 'Proteína', unit: 'g', color: 'var(--color-protein)', primary: true },
  { key: 'carbs', label: 'Hidratos de Carbono', unit: 'g', color: 'var(--color-carbs)', primary: true },
  { key: 'fat', label: 'Gordura', unit: 'g', color: 'var(--color-fat)', primary: true },
  { key: 'fiber', label: 'Fibra', unit: 'g', color: 'var(--color-fiber)', primary: false },
  { key: 'sugar', label: 'Açúcar', unit: 'g', color: 'var(--color-sugar)', primary: false },
  { key: 'saturated_fat', label: 'Gordura Saturada', unit: 'g', color: 'var(--color-sat-fat)', primary: false },
  { key: 'sodium', label: 'Sódio', unit: 'mg', color: 'var(--color-sodium)', primary: false },
];

export function renderGoalsModal(container, { onSave, onClose }) {
  const goals = loadGoals();
  const primaryFields = FIELDS.filter(f => f.primary);
  const secondaryFields = FIELDS.filter(f => !f.primary);

  container.innerHTML = `
    <div class="modal-card">
      <div class="modal-title">🎯 Metas Diárias</div>
      <div class="modal-subtitle">Define os teus objectivos nutricionais diários.</div>
      
      ${primaryFields.map(f => `
        <div class="form-group">
          <label class="form-label" for="goal-${f.key}">
            <span class="dot" style="background:${f.color}"></span>
            ${f.label} (${f.unit})
          </label>
          <input type="number" id="goal-${f.key}" class="form-input" 
            value="${goals[f.key]}" min="0" step="1" placeholder="${f.label}">
        </div>
      `).join('')}

      <hr class="form-divider">
      <div class="form-section-title">Nutrientes secundários</div>

      ${secondaryFields.map(f => `
        <div class="form-group">
          <label class="form-label" for="goal-${f.key}">
            <span class="dot" style="background:${f.color}"></span>
            ${f.label} (${f.unit})
          </label>
          <input type="number" id="goal-${f.key}" class="form-input" 
            value="${goals[f.key]}" min="0" step="1" placeholder="${f.label}">
        </div>
      `).join('')}

      <div class="modal-actions">
        <button class="btn-secondary" id="btn-reset-goals">Repor padrão</button>
        <button class="btn-secondary" id="btn-cancel-goals">Cancelar</button>
        <button class="btn-primary" id="btn-save-goals">Guardar</button>
      </div>
    </div>
  `;

  // Close on overlay click
  container.addEventListener('click', (e) => {
    if (e.target === container) onClose();
  });

  // Cancel
  container.querySelector('#btn-cancel-goals').addEventListener('click', onClose);

  // Reset
  container.querySelector('#btn-reset-goals').addEventListener('click', () => {
    const defaults = getDefaultGoals();
    FIELDS.forEach(f => {
      const input = container.querySelector(`#goal-${f.key}`);
      if (input) input.value = defaults[f.key];
    });
  });

  // Save
  container.querySelector('#btn-save-goals').addEventListener('click', () => {
    const newGoals = {};
    FIELDS.forEach(f => {
      const input = container.querySelector(`#goal-${f.key}`);
      newGoals[f.key] = parseFloat(input.value) || 0;
    });
    saveGoals(newGoals);
    onSave(newGoals);
  });
}

export function showGoalsModal(container) {
  container.classList.remove('hidden');
}

export function hideGoalsModal(container) {
  container.classList.add('hidden');
}
