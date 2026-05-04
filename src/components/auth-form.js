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
              <input type="email" name="email" class="form-input" placeholder="exemplo@email.com" required>
            </div>
            
            <div class="form-group password-group">
              <label class="form-label">Palavra-passe</label>
              <div class="input-wrapper">
                <input type="password" name="password" id="main-password" class="form-input" placeholder="••••••••" required>
                <button type="button" class="btn-icon-small pwd-toggle" title="Mostrar/Esconder">🙈</button>
              </div>
              ${!isLogin ? `<button type="button" class="btn-link-small suggest-pwd">Sugerir password segura</button>` : ''}
            </div>

            ${!isLogin ? `
            <div class="form-group">
              <label class="form-label">Confirmar Palavra-passe</label>
              <div class="input-wrapper">
                <input type="password" name="confirmPassword" id="confirm-password" class="form-input" placeholder="••••••••" required>
              </div>
            </div>
            ` : ''}
            
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
    const toggleAuthBtn = container.querySelector('#toggle-auth');
    const errorEl = container.querySelector('#auth-error');

    // Password Visibility Logic (Targeted)
    const toggleBtns = container.querySelectorAll('.pwd-toggle');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const inputs = form.querySelectorAll('input[name="password"], input[name="confirmPassword"]');
        const isCurrentlyPassword = inputs[0].type === 'password';
        inputs.forEach(input => input.type = isCurrentlyPassword ? 'text' : 'password');
        btn.textContent = isCurrentlyPassword ? '👁️' : '🙈';
      });
    });

    // Suggest Password Logic
    const suggestBtn = container.querySelector('.suggest-pwd');
    if (suggestBtn) {
      suggestBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
        const newPwd = Array.from({length: 12}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        form.password.value = newPwd;
        if (form.confirmPassword) form.confirmPassword.value = newPwd;
        
        // Show passwords
        const inputs = form.querySelectorAll('input[name="password"], input[name="confirmPassword"]');
        inputs.forEach(input => input.type = 'text');
        const toggleBtn = form.querySelector('.pwd-toggle');
        if (toggleBtn) toggleBtn.textContent = '👁️';
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.email.value;
      const password = form.password.value;
      
      if (!isLogin) {
        const confirmPassword = form.confirmPassword.value;
        if (password !== confirmPassword) {
          errorEl.textContent = "As palavras-passe não coincidem.";
          errorEl.classList.remove('hidden');
          return;
        }
      }

      const submitBtn = form.querySelector('.auth-submit');
      submitBtn.disabled = true;
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<div class="loading-spinner"></div>';
      errorEl.classList.add('hidden');

      try {
        if (isLogin) {
          await onLogin(email, password);
        } else {
          await onRegister(email, password);
        }
      } catch (err) {
        console.error('Auth error:', err);
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });

    toggleAuthBtn.addEventListener('click', () => {
      isLogin = !isLogin;
      update();
    });
  }

  update();
}
