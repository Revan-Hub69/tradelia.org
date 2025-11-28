import { Locale } from './config';

const dictionaries = {
  it: () => import('./it.json').then((module) => module.default),
  en: () => import('./en.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]();
};
