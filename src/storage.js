/* storage.js — Data layer abstraction */

const STORAGE_PREFIX = 'nutritrack-';
const GOALS_KEY = 'nutritrack-goals';

/**
 * @typedef {Object} FoodItem
 * @property {string} name
 * @property {string} quantity
 * @property {number} calories
 * @property {number} protein
 * @property {number} carbs
 * @property {number} fat
 * @property {number} fiber
 * @property {number} sugar
 * @property {number} saturated_fat
 * @property {number} sodium
 */

/**
 * @typedef {Object} Meal
 * @property {string} id
 * @property {string} meal_type
 * @property {string} original_text
 * @property {FoodItem[]} items
 * @property {string} timestamp
 */

/**
 * @typedef {Object} DayData
 * @property {string} date
 * @property {Meal[]} meals
 */

/**
 * @typedef {Object} Goals
 * @property {number} calories
 * @property {number} protein
 * @property {number} carbs
 * @property {number} fat
 * @property {number} fiber
 * @property {number} sugar
 * @property {number} saturated_fat
 * @property {number} sodium
 */

const DEFAULT_GOALS = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
  fiber: 25,
  sugar: 50,
  saturated_fat: 20,
  sodium: 2300,
};

function dateKey(date) {
  return STORAGE_PREFIX + date;
}

export function saveDayData(date, data) {
  localStorage.setItem(dateKey(date), JSON.stringify(data));
}

export function loadDayData(date) {
  const raw = localStorage.getItem(dateKey(date));
  if (!raw) return { date, meals: [] };
  try {
    return JSON.parse(raw);
  } catch {
    return { date, meals: [] };
  }
}

export function saveGoals(goals) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export function loadGoals() {
  const raw = localStorage.getItem(GOALS_KEY);
  if (!raw) return { ...DEFAULT_GOALS };
  try {
    return { ...DEFAULT_GOALS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_GOALS };
  }
}

export function getDefaultGoals() {
  return { ...DEFAULT_GOALS };
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function getDaysWithData() {
  const days = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(STORAGE_PREFIX) && key !== GOALS_KEY) {
      days.push(key.replace(STORAGE_PREFIX, ''));
    }
  }
  return days.sort().reverse();
}
