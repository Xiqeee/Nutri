/* main.js — NutriTrack Pro */

import { api } from './backend-api.js';
import { renderAuthForm } from './components/auth-form.js';
import { renderOnboardingForm } from './components/onboarding-form.js';
import { renderFoodInput, setLoading, showPreview, clearPreview, clearInput, showInputError } from './components/food-input.js';
import { renderNutritionSummary, calculateTotals } from './components/nutrition-summary.js';
import { renderDailyLog } from './components/daily-log.js';
import { renderGoalsModal, showGoalsModal, hideGoalsModal } from './components/goals-modal.js';
import { renderDateNavigation, formatDate, addDays } from './components/history.js';

// --- App State ---
const state = {
  user: null,
  currentDate: formatDate(new Date()),
  selectedMeal: 'almoco',
  pendingResult: null,
  pendingText: '',
  initialized: false
};

const appEl = document.getElementById('app');

async function init() {
  const token = localStorage.getItem('nutritrack_token');
  if (token) {
    try {
      const data = await api.getMe();
      if (data) {
        state.user = data;
      }
    } catch (err) {
      localStorage.removeItem('nutritrack_token');
    }
  }
  state.initialized = true;
  renderApp();
}

async function renderApp() {
  if (!state.initialized) return;

  // 1. Not logged in
  if (!state.user) {
    appEl.innerHTML = '<div id="auth-root"></div>';
    renderAuthForm(document.getElementById('auth-root'), {
      onLogin: async (email, password) => {
        const data = await api.login(email, password);
        state.user = data.user;
        renderApp();
      },
      onRegister: async (email, password) => {
        const data = await api.register(email, password);
        state.user = data.user;
        renderApp();
      }
    });
    return;
  }

  // 2. Logged in but needs onboarding
  if (!state.user.profile) {
    appEl.innerHTML = '<div id="onboarding-root"></div>';
    renderOnboardingForm(document.getElementById('onboarding-root'), {
      onSave: async (profileData) => {
        const profile = await api.saveProfile(profileData);
        state.user.profile = profile;
        renderApp();
      }
    });
    return;
  }

  // 3. Main Dashboard
  appEl.innerHTML = `
    <header class="app-header">
      <div class="header-left">
        <span class="logo-icon">🥗</span>
        <span class="logo-text">NutriTrack</span>
      </div>
      <div class="header-center" id="date-navigation"></div>
      <div class="header-right">
        <button id="btn-goals" class="btn-icon" title="Metas Nutricionais">🎯</button>
        <button id="btn-logout" class="btn-icon" title="Sair" style="margin-left: 10px">🚪</button>
      </div>
    </header>

    <main class="main-content">
      <section id="nutrition-summary" class="nutrition-summary-section"></section>
      <section id="food-input" class="food-input-section"></section>
      <section id="daily-log" class="daily-log-section"></section>
    </main>

    <div id="goals-modal" class="modal-overlay hidden"></div>
  `;

  const summaryEl = document.getElementById('nutrition-summary');
  const inputEl = document.getElementById('food-input');
  const logEl = document.getElementById('daily-log');
  const dateNavEl = document.getElementById('date-navigation');
  const goalsModalEl = document.getElementById('goals-modal');
  
  // Fetch data for current date
  const meals = await api.getMeals(state.currentDate);
  const totals = calculateTotals(meals);
  const goals = state.user.profile.targets;

  // Render components
  renderDateNavigation(dateNavEl, state.currentDate, {
    onPrev: () => { state.currentDate = addDays(state.currentDate, -1); renderApp(); },
    onNext: () => { state.currentDate = addDays(state.currentDate, 1); renderApp(); },
    onToday: () => { state.currentDate = formatDate(new Date()); renderApp(); },
  });

  renderNutritionSummary(summaryEl, totals, goals);
  
  renderFoodInput(inputEl, {
    selectedMeal: state.selectedMeal,
    onMealSelect: (meal) => { state.selectedMeal = meal; },
    onAnalyze: handleAnalyze,
  });

  renderDailyLog(logEl, meals, {
    onDeleteMeal: handleDeleteMeal,
    onEditMeal: handleEditMeal,
  });

  // Handlers
  document.getElementById('btn-logout').onclick = () => api.logout();
  document.getElementById('btn-goals').onclick = () => {
    renderGoalsModal(goalsModalEl, {
      goals: state.user.profile.targets,
      onSave: async (newGoals) => {
        const updatedProfile = await api.saveProfile({
          ...state.user.profile,
          targets: newGoals
        });
        state.user.profile = updatedProfile;
        hideGoalsModal(goalsModalEl);
        renderApp();
      },
      onClose: () => hideGoalsModal(goalsModalEl),
    });
    showGoalsModal(goalsModalEl);
  };
}

async function handleAnalyze(text) {
  const inputEl = document.getElementById('food-input');
  setLoading(inputEl, true);
  state.pendingText = text;

  try {
    const data = await api.analyze(text);
    state.pendingResult = data;
    setLoading(inputEl, false);
    showPreview(inputEl, data, {
      onSave: handleSave,
      onDiscard: handleDiscard,
    });
  } catch (error) {
    setLoading(inputEl, false);
    console.error('Erro na análise:', error);
    showInputError(inputEl, `A IA não conseguiu responder: ${error.message}. Verifica a tua chave da Groq.`);
  }
}

async function handleSave() {
  if (!state.pendingResult) return;
  const mealData = {
    meal_type: state.pendingResult.meal_type || state.selectedMeal,
    original_text: state.pendingText,
    items: state.pendingResult.items,
    source_info: state.pendingResult.source_info || null,
    date: state.currentDate
  };
  await api.saveMeal(mealData);
  state.pendingResult = null;
  state.pendingText = '';
  renderApp();
}

function handleDiscard() {
  state.pendingResult = null;
  state.pendingText = '';
  clearPreview(document.getElementById('food-input'));
}

async function handleDeleteMeal(id) {
  await api.deleteMeal(id);
  renderApp();
}

async function handleEditMeal(id) {
  const newName = prompt('Novo nome para a refeição?');
  if (newName) {
    // Para simplificar agora, apenas mostramos o prompt. 
    // Futuramente podemos implementar edição completa de itens.
    alert('Edição de itens será implementada na próxima fase!');
  }
}

init();
