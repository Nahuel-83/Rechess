/**
 * Test Setup File
 * 
 * This file runs before all tests and sets up the testing environment.
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Extend Vitest matchers with Testing Library matchers
import '@testing-library/jest-dom/vitest';

// Cleanup after each test case (for React component tests)
afterEach(() => {
  cleanup();
});

// Global test timeout (10 seconds)
expect.extend({});
