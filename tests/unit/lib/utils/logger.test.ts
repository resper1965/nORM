/**
 * Tests for Logger utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Logger', () => {
  const originalConsole = { ...console };
  const originalEnv = process.env.NODE_ENV;
  const consoleSpy = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  };

  beforeEach(() => {
    // Set NODE_ENV to development for these tests
    process.env.NODE_ENV = 'development';
    console.info = consoleSpy.info;
    console.error = consoleSpy.error;
    console.warn = consoleSpy.warn;
    console.debug = consoleSpy.debug;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    console.info = originalConsole.info;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.debug = originalConsole.debug;
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('info', () => {
    it('should log info messages in development', async () => {
      // Re-import logger to get fresh instance with NODE_ENV=development
      const { logger } = await import('@/lib/utils/logger');
      
      logger.info('Test info message');
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('should log info messages with metadata in development', async () => {
      const { logger } = await import('@/lib/utils/logger');
      
      logger.info('Test info message', { key: 'value' });
      expect(consoleSpy.info).toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should log error messages', async () => {
      const { logger } = await import('@/lib/utils/logger');
      
      logger.error('Test error message', new Error('Test error'));
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should log warning messages', async () => {
      const { logger } = await import('@/lib/utils/logger');
      
      logger.warn('Test warning message');
      expect(consoleSpy.warn).toHaveBeenCalled();
    });
  });

  describe('debug', () => {
    it('should log debug messages in development', async () => {
      const { logger } = await import('@/lib/utils/logger');
      
      logger.debug('Test debug message');
      // Debug messages are logged in development
      expect(consoleSpy.debug).toHaveBeenCalled();
    });
  });
});
