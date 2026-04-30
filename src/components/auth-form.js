/* auth-form.js — Login and Register UI */

export function renderAuthForm(container, { onLogin, onRegister }) {
  let isLogin = true;

  function update() {
    container.innerHTML = `
      <div class="auth-container">
        <div class="glass-card auth-card">
          <div class="auth-header">
            <div class="logo-icon">🥗</div>
            <h1 class="logo-text">NutriTrack</h1>
            <p class="auth-subtitle">${isLogin ? 'Bem-vindo de volta!' : 'Cria a tua conta gratuita'}</p>
          </div>

          <form id="auth-form" class="auth-form">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" id="email" class="form-input" placeholder="exemplo@email.com" required>
            </div>
            <div class="form-group">
              <label class="form-label">Palavra-passe</label>
              <input type="password" id="password" class="form-input" placeholder="••••••••" required>
            </div>
            
            <div id="auth-error" class="auth-error hidden"></div>

            <button type="submit" class="btn-primary auth-submit">
              ${isLogin ? 'Entrar' : 'Registar'}
            </button>
          </form>

          <div class="auth-footer">
            <span>${isLogin ? 'Não tens conta?' : 'Já tens conta?'}</span>
            <button id="toggle-auth" class="btn-link">${isLogin ? 'Registar agora' : 'Fazer Login'}</button>
          </div>
        </div>
      </div>
    `;

    const form = container.querySelector('#auth-form');
    const toggleBtn = container.querySelector('#toggle-auth');
    const errorEl = container.querySelector('#auth-error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.email.value;
      const password = form.password.value;
      const submitBtn = form.querySelector('.auth-submit');
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="loading-spinner"></div>';
      errorEl.classList.add('hidden');

      try {
        if (isLogin) {
          await onLogin(email, password);
        } else {
          await onRegister(email, password);
        }
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.innerHTML = isLogin ? 'Entrar' : 'Registar';
      }
    });

    toggleBtn.addEventListener('click', () => {
      isLogin = !isLogin;
      update();
    });
  }

  update();
}
