import nodeFetch from 'node-fetch';

const runtimeFetch =
  typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : nodeFetch;

export default runtimeFetch;
