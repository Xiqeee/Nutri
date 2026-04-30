/* history.js — Date navigation */

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export function renderDateNavigation(container, currentDate, { onPrev, onNext, onToday }) {
  const date = new Date(currentDate + 'T00:00:00');
  const today = formatDate(new Date());
  const isToday = currentDate === today;

  const dayName = WEEKDAYS[date.getDay()];
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];

  container.innerHTML = `
    <div class="date-nav">
      <button class="date-nav-btn" id="btn-prev-day" title="Dia anterior">‹</button>
      <div class="date-display" id="btn-today" title="Ir para hoje">
        ${dayName}, ${day} de ${month}
        ${isToday ? '<span class="date-today-badge">Hoje</span>' : ''}
      </div>
      <button class="date-nav-btn" id="btn-next-day" title="Dia seguinte">›</button>
    </div>
  `;

  container.querySelector('#btn-prev-day').addEventListener('click', onPrev);
  container.querySelector('#btn-next-day').addEventListener('click', onNext);
  container.querySelector('#btn-today').addEventListener('click', onToday);
}

export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(dateStr, days) {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return formatDate(date);
}
