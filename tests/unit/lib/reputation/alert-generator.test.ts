/**
 * Unit tests for alert generator
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSeverityFromScoreDrop } from '@/lib/reputation/alert-generator';

describe('Alert Generator', () => {
  describe('getSeverityFromScoreDrop', () => {
    it('should return critical for drops >= 10', () => {
      expect(getSeverityFromScoreDrop(10)).toBe('critical');
      expect(getSeverityFromScoreDrop(15)).toBe('critical');
    });

    it('should return high for drops >= 5 and < 10', () => {
      expect(getSeverityFromScoreDrop(5)).toBe('high');
      expect(getSeverityFromScoreDrop(7)).toBe('high');
      expect(getSeverityFromScoreDrop(9.9)).toBe('high');
    });

    it('should return medium for drops >= 3 and < 5', () => {
      expect(getSeverityFromScoreDrop(3)).toBe('medium');
      expect(getSeverityFromScoreDrop(4)).toBe('medium');
      expect(getSeverityFromScoreDrop(4.9)).toBe('medium');
    });

    it('should return low for drops < 3', () => {
      expect(getSeverityFromScoreDrop(2)).toBe('low');
      expect(getSeverityFromScoreDrop(1)).toBe('low');
      expect(getSeverityFromScoreDrop(0.5)).toBe('low');
    });
  });
});
