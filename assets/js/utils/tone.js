// /assets/js/utils/tone.js
export const tone = {
  fromConfidence: (v)=> (v==null||isNaN(v))?'neutral': v>=0.80?'green': v>=0.60?'yellow':'red',
  fromFreshness:  (label)=> !label?'neutral': /T-0/i.test(label)?'green': /T-1/i.test(label)?'yellow':'red',
  simple01:       (v)=> (v==null||isNaN(v))?'neutral': v>=0.85?'green': v>=0.65?'yellow':'red',
  fromState:      (s)=>({ACTIVE:'green',REVIEW:'yellow',HOLD:'red'})[(String(s||'').toUpperCase())]||'neutral',
  toClass:        (t)=> ({green:'tone-g',yellow:'tone-y',red:'tone-r',neutral:'tone-n'}[(t||'neutral').toLowerCase()]||'tone-n'),
};
