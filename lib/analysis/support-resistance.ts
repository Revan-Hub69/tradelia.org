/**
 * Support & Resistance Calculator
 * 
 * Calcola supporti e resistenze REALI basati su order book depth,
 * non su pattern grafici o indicatori tecnici classici.
 * 
 * Metodologia:
 * - Supporti: Livelli con alta concentrazione di bid volume (domanda)
 * - Resistenze: Livelli con alta concentrazione di ask volume (offerta)
 * - Usa order book aggregato multi-exchange per maggiore accuratezza
 * 
 * ⚠️ LACUNE METODOLOGICHE:
 * 1. Order book è snapshot, non storico - livelli possono cambiare rapidamente
 * 2. Non considera volume storico reale (solo order book corrente)
 * 3. Non considera test ripetuti di livelli (più test = più forte)
 * 4. Non considera psychological levels (round numbers, ATH, ATL)
 * 5. Non considera che order book può essere manipolato (fake walls)
 * 6. Limita a 5% di distanza - potrebbe perdere livelli importanti
 * 7. Non considera time-weighted volume
 * 8. Order book mostra intenzione, non esecuzione reale
 * 
 * Vedi: docs/SUPPORT-RESISTANCE-LACUNE.md per dettagli completi
 */

import { OrderBookEntry } from '@/lib/price-apis/binance';

export interface SupportResistanceLevel {
  price: number;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong'; // Forza del livello
  type: 'support' | 'resistance';
  volume: number; // Volume concentrato a questo livello
  distancePercent: number; // Distanza dal prezzo corrente (%)
}

/**
 * Calcola supporti e resistenze da order book
 * 
 * @param bids - Order book bids
 * @param asks - Order book asks
 * @param currentPrice - Prezzo corrente
 * @param maxLevels - Numero massimo di livelli da identificare
 * @returns Array di supporti e resistenze ordinati per forza
 */
export function calculateSupportResistance(
  bids: OrderBookEntry[],
  asks: OrderBookEntry[],
  currentPrice: number,
  maxLevels: number = 10
): SupportResistanceLevel[] {
  const levels: SupportResistanceLevel[] = [];

  // Raggruppa volumi per fasce di prezzo (0.1% di tolleranza)
  const priceTolerance = currentPrice * 0.001; // 0.1%

  // Supporti: cerca concentrazioni di bid volume
  const supportMap = new Map<number, number>();
  for (const bid of bids) {
    if (bid.price < currentPrice) {
      // Raggruppa per fascia
      const priceKey = Math.round(bid.price / priceTolerance) * priceTolerance;
      supportMap.set(priceKey, (supportMap.get(priceKey) || 0) + bid.quantity);
    }
  }

  // Resistenze: cerca concentrazioni di ask volume
  const resistanceMap = new Map<number, number>();
  for (const ask of asks) {
    if (ask.price > currentPrice) {
      // Raggruppa per fascia
      const priceKey = Math.round(ask.price / priceTolerance) * priceTolerance;
      resistanceMap.set(priceKey, (resistanceMap.get(priceKey) || 0) + ask.quantity);
    }
  }

  // Calcola mediana volume per determinare soglie
  const allVolumes = [
    ...Array.from(supportMap.values()),
    ...Array.from(resistanceMap.values()),
  ].sort((a, b) => a - b);
  const medianVolume = allVolumes[Math.floor(allVolumes.length / 2)] || 0;
  const strongThreshold = medianVolume * 2;
  const veryStrongThreshold = medianVolume * 5;

  // Aggiungi supporti
  for (const [price, volume] of supportMap.entries()) {
    if (volume > medianVolume * 0.5) { // Filtra solo volumi significativi
      let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
      if (volume >= veryStrongThreshold) {
        strength = 'very-strong';
      } else if (volume >= strongThreshold) {
        strength = 'strong';
      } else if (volume >= medianVolume) {
        strength = 'medium';
      } else {
        strength = 'weak';
      }

      levels.push({
        price,
        strength,
        type: 'support',
        volume,
        distancePercent: ((currentPrice - price) / currentPrice) * 100,
      });
    }
  }

  // Aggiungi resistenze
  for (const [price, volume] of resistanceMap.entries()) {
    if (volume > medianVolume * 0.5) {
      let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
      if (volume >= veryStrongThreshold) {
        strength = 'very-strong';
      } else if (volume >= strongThreshold) {
        strength = 'strong';
      } else if (volume >= medianVolume) {
        strength = 'medium';
      } else {
        strength = 'weak';
      }

      levels.push({
        price,
        strength,
        type: 'resistance',
        volume,
        distancePercent: ((price - currentPrice) / currentPrice) * 100,
      });
    }
  }

  // Ordina per distanza dal prezzo corrente (più vicini prima)
  levels.sort((a, b) => Math.abs(a.distancePercent) - Math.abs(b.distancePercent));

  // Prendi solo i più forti e più vicini
  return levels
    .filter((l) => Math.abs(l.distancePercent) < 5) // Max 5% di distanza
    .slice(0, maxLevels)
    .sort((a, b) => {
      // Ordina per forza (very-strong prima) poi per distanza
      const strengthOrder = { 'very-strong': 4, 'strong': 3, 'medium': 2, 'weak': 1 };
      if (strengthOrder[a.strength] !== strengthOrder[b.strength]) {
        return strengthOrder[b.strength] - strengthOrder[a.strength];
      }
      return Math.abs(a.distancePercent) - Math.abs(b.distancePercent);
    });
}

