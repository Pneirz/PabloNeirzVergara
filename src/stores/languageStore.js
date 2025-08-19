// Language store to manage the current language
import { atom } from 'nanostores';

// Create a store with Spanish as the default language
export const currentLanguage = atom('es');

// Function to toggle language between 'es' and 'en'
export function toggleLanguage() {
  const current = currentLanguage.get();
  currentLanguage.set(current === 'es' ? 'en' : 'es');
}

// Function to set language explicitly
export function setLanguage(lang) {
  if (lang === 'es' || lang === 'en') {
    currentLanguage.set(lang);
  }
}
