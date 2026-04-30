/* onboarding-form.js — User metrics questionnaire */

export function renderOnboardingForm(container, { onSave }) {
  container.innerHTML = `
    <div class="auth-container">
      <div class="glass-card auth-card onboarding-card">
        <div class="auth-header">
          <h1 class="logo-text">Personaliza o teu NutriTrack</h1>
          <p class="auth-subtitle">Diz-nos um pouco sobre ti para calcularmos as tuas metas.</p>
        </div>

        <form id="onboarding-form" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Género</label>
              <select id="gender" class="form-input" required>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Idade</label>
              <input type="number" id="age" class="form-input" placeholder="25" min="15" max="100" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Peso (kg)</label>
              <input type="number" id="weight" class="form-input" placeholder="70" step="0.1" required>
            </div>
            <div class="form-group">
              <label class="form-label">Altura (cm)</label>
              <input type="number" id="height" class="form-input" placeholder="175" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Nível de Atividade</label>
            <select id="activity_level" class="form-input" required>
              <option value="sedentario">Sedentário (Trabalho de escritório)</option>
              <option value="leve">Leve (1-2x semana)</option>
              <option value="moderado">Moderado (3-5x semana)</option>
              <option value="ativo">Ativo (Diário)</option>
              <option value="atleta">Atleta (Intenso/Profissional)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Objetivo</label>
            <select id="goal" class="form-input" required>
              <option value="perder">Perder Gordura</option>
              <option value="manter">Manter Peso</option>
              <option value="ganhar">Ganhar Massa Muscular</option>
            </select>
          </div>

          <button type="submit" class="btn-primary auth-submit">
            Começar a Monitorizar 🚀
          </button>
        </form>
      </div>
    </div>
  `;

  const form = container.querySelector('#onboarding-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      gender: form.gender.value,
      age: parseInt(form.age.value),
      weight: parseFloat(form.weight.value),
      height: parseInt(form.height.value),
      activity_level: form.activity_level.value,
      goal: form.goal.value
    };
    onSave(data);
  });
}
