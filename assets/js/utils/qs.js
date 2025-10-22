// /assets/js/utils/qs.js
export function getDataURL() {
  const u=new URL(window.location.href);
  const data = u.searchParams.get('data');
  const id   = u.searchParams.get('id');
  if (data) return data;
  if (id)   return `./data/${encodeURIComponent(id)}.json`;
  return './data/sample.json';
}
