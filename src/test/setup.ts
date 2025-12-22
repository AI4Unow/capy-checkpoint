/**
 * Vitest global setup - runs before all tests
 * Provides localStorage mock for Zustand persist middleware
 */
import { vi } from 'vitest';

// Mock localStorage for Zustand persist middleware
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] || null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
  length: 0,
  key: vi.fn(() => null),
};

Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });
