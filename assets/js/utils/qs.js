// /assets/js/utils/qs.js
export function getDataURL() {
  const pageURL = new URL(window.location.href);
  const dataParam = pageURL.searchParams.get('data');
  const idParam   = pageURL.searchParams.get('id');
  const debug     = pageURL.searchParams.get('debug') === '1';

  const ensureJson = (s) => {
    // Non toccare se già ha .json prima di ?/# (es. foo.json?x=1)
    if (/\.(json)(?=($|[?#]))/i.test(s)) return s;
    // Se c'è già query/hash, inserisci .json prima
    const m = s.match(/^([^?#]+)([?#].*)?$/);
    if (!m) return s + '.json';
    const base = m[1], tail = m[2] || '';
    return base + '.json' + tail;
  };

  const withBust = (u) => {
    if (!debug) return u.toString();
    const tmp = new URL(u.toString());
    tmp.searchParams.set('_v', String(Date.now()));
    return tmp.toString();
  };

  // 1) Priorità a ?data=...
  if (dataParam) {
    // Risolvi rispetto alla pagina corrente (copre subpath su GitHub Pages)
    const candidate = ensureJson(dataParam.trim());
    const resolved  = new URL(candidate, document.baseURI);

    // Consenti solo http/https o origin relativo
    if (!/^https?:$/.test(resolved.protocol)) {
      throw new Error(`Parametro "data" non valido: schema ${resolved.protocol} non supportato`);
    }
    return withBust(resolved);
  }

  // 2) ?id=... -> ./data/<id>.json
  if (idParam) {
    let fname = idParam.trim();

    // Togli eventuali path/dir traversal per sicurezza
    fname = fname.replace(/[/\\]+/g, '');
    // Consenti solo alfanumerico, punto, underscore, dash
    fname = fname.replace(/[^a-zA-Z0-9._-]/g, '');

    if (!fname) throw new Error('Parametro "id" vuoto/non valido');
    fname = ensureJson(fname);

    const resolved = new URL(`./data/${fname}`, document.baseURI);
    return withBust(resolved);
  }

  // 3) Default
  const fallback = new URL('./data/sample.json', document.baseURI);
  return withBust(fallback);
}
