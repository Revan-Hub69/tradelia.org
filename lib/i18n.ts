import type uiIt from '../../../content/ui.it.json'
import type uiEn from '../../../content/ui.en.json'

export type Lang = 'it' | 'en'
export type UiDict = typeof uiIt

export async function loadUi(lang: Lang): Promise<UiDict> {
  if (lang === 'it') {
    const mod = await import('../../../content/ui.it.json')
    return mod.default as UiDict
  }
  const mod = await import('../../../content/ui.en.json')
  return mod.default as UiDict
}

export function isLang(x: string): x is Lang {
  return x === 'it' || x === 'en'
}
