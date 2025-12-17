import { describe, it, expect } from 'vitest';
import { processCommand, applyEvents } from '../engine/core';

const baseState = {
  orders: {},
  positions: {},
  trades: {},
  riskPolicies: {},
};

describe('engine core - deterministic flows', () => {
  it('places an order and updates state', () => {
    const placeCmd = {
      type: 'PlaceOrder',
      payload: {
        eventId: '11111111-1111-1111-1111-111111111111',
        orderId: '22222222-2222-2222-2222-222222222222',
        userId: '33333333-3333-3333-3333-333333333333',
        instrument: 'BTC-USD',
        side: 'BUY',
        type: 'MARKET',
        quantity: '0.5',
        timestamp: '2025-12-17T12:00:00Z'
      }
    } as const;

    const res = processCommand(baseState as any, placeCmd as any);
    expect(Object.keys(res.state.orders)).toHaveLength(1);
    const order = res.state.orders['22222222-2222-2222-2222-222222222222'];
    expect(order).toBeDefined();
    expect(order.status).toBe('OPEN');
    expect(res.events).toHaveLength(1);
  });

  it('executes an order -> creates trade and position', () => {
    const execCmd = {
      type: 'ExecuteOrder',
      payload: {
        eventId: '44444444-4444-4444-4444-444444444444',
        executionId: '55555555-5555-5555-5555-555555555555',
        orderId: '22222222-2222-2222-2222-222222222222',
        userId: '33333333-3333-3333-3333-333333333333',
        instrument: 'BTC-USD',
        executedQty: '0.5',
        executionPrice: '45000',
        executedAt: '2025-12-17T12:01:00Z'
      }
    } as const;

    // place an order first to simulate realistic state
    const placed = processCommand(baseState as any, {
      type: 'PlaceOrder',
      payload: {
        eventId: '11111111-1111-1111-1111-111111111111',
        orderId: '22222222-2222-2222-2222-222222222222',
        userId: '33333333-3333-3333-3333-333333333333',
        instrument: 'BTC-USD',
        side: 'BUY',
        type: 'MARKET',
        quantity: '0.5',
        timestamp: '2025-12-17T12:00:00Z'
      }
    } as any);

    const res = processCommand(placed.state as any, execCmd as any);
    // Order should be executed
    expect(res.state.orders['22222222-2222-2222-2222-222222222222'].status).toBe('EXECUTED');
    // A trade record should exist
    expect(Object.keys(res.state.trades)).toHaveLength(1);
    // A position should exist
    expect(Object.keys(res.state.positions)).toHaveLength(1);
  });

  it('applies multiple events deterministically', () => {
    const events = [
      {
        eventId: 'a1',
        orderId: 'o1',
        userId: 'u1',
        instrument: 'SYM',
        side: 'BUY',
        type: 'MARKET',
        quantity: '1',
        timestamp: '2025-12-17T12:00:00Z'
      },
    ];

    const s = applyEvents(baseState as any, events as any);
    // After applying, state should reflect the order
    expect(Object.keys(s.orders)).toHaveLength(1);
  });
});
