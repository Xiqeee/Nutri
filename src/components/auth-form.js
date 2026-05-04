export function renderAuthForm(container, { onLogin, onRegister }) {
  let isLogin = true;
  let showPassword = false;

  function generateSecurePassword() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

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
            
            <div class="form-group password-group">
              <label class="form-label">Palavra-passe</label>
              <div class="input-wrapper">
                <input type="${showPassword ? 'text' : 'password'}" id="password" class="form-input" placeholder="••••••••" required>
                <button type="button" id="toggle-pwd-vis" class="btn-icon-small" title="Mostrar/Esconder">
                  ${showPassword ? '👁️' : '🙈'}
                </button>
              </div>
              ${!isLogin ? `<button type="button" id="suggest-pwd" class="btn-link-small">Sugerir password segura</button>` : ''}
            </div>

            ${!isLogin ? `
            <div class="form-group">
              <label class="form-label">Confirmar Palavra-passe</label>
              <input type="${showPassword ? 'text' : 'password'}" id="confirm-password" class="form-input" placeholder="••••••••" required>
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
    const toggleVisBtn = container.querySelector('#toggle-pwd-vis');
    const suggestBtn = container.querySelector('#suggest-pwd');

    if (toggleVisBtn) {
      toggleVisBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showPassword = !showPassword;
        update();
      });
    }

    if (suggestBtn) {
      suggestBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const newPwd = generateSecurePassword();
        form.password.value = newPwd;
        if (form['confirm-password']) form['confirm-password'].value = newPwd;
        showPassword = true;
        update();
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.email.value;
      const password = form.password.value;
      
      if (!isLogin) {
        const confirmPassword = form['confirm-password'].value;
        if (password !== confirmPassword) {
          errorEl.textContent = "As palavras-passe não coincidem.";
          errorEl.classList.remove('hidden');
          return;
        }
      }

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

    toggleAuthBtn.addEventListener('click', () => {
      isLogin = !isLogin;
      update();
    });
  }

  update();
}
