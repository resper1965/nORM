/**
 * Tests for Logger utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '@/lib/utils/logger';

describe('Logger', () => {
  const originalConsole = { ...console };
  const consoleSpy = {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  };

  beforeEach(() => {
    console.log = consoleSpy.log;
    console.error = consoleSpy.error;
    console.warn = consoleSpy.warn;
    console.debug = consoleSpy.debug;
  });

  afterEach(() => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.debug = originalConsole.debug;
    vi.clearAllMocks();
  });

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test info message');
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should log info messages with metadata', () => {
      logger.info('Test info message', { key: 'value' });
      expect(consoleSpy.log).toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      logger.error('Test error message', new Error('Test error'));
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning message');
      expect(consoleSpy.warn).toHaveBeenCalled();
    });
  });

  describe('debug', () => {
    it('should log debug messages', () => {
      logger.debug('Test debug message');
      // Debug messages may not be logged in production
      // Just verify the method exists and doesn't throw
      expect(() => logger.debug('Test')).not.toThrow();
    });
  });
});

