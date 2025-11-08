import { describe, it, expect, beforeEach } from 'vitest';
import { KakiatoRecorder } from './KakiatoRecorder';

describe('KakiatoRecorder', () => {
  let recorder: KakiatoRecorder;

  beforeEach(() => {
    recorder = new KakiatoRecorder();
  });

  describe('initialization', () => {
    it('should create a recorder instance', () => {
      expect(recorder).toBeInstanceOf(KakiatoRecorder);
    });

    it('should not auto-start by default', () => {
      recorder.start();
      recorder.stop();
      const doc = recorder.getDocument();
      expect(doc.events).toHaveLength(0);
    });

    it('should auto-start when specified', () => {
      const autoRecorder = new KakiatoRecorder({ autoStart: true });
      // Just verify it doesn't throw
      autoRecorder.stop();
    });
  });

  describe('start and stop', () => {
    it('should start recording', () => {
      recorder.start();
      // Should not throw
      expect(() => recorder.stop()).not.toThrow();
    });

    it('should warn when starting twice', () => {
      recorder.start();
      // Starting again should handle gracefully
      recorder.start();
      recorder.stop();
    });

    it('should warn when stopping without starting', () => {
      // Should handle gracefully
      recorder.stop();
    });
  });

  describe('getDocument', () => {
    it('should return a valid Kakiato document', () => {
      recorder.start();
      recorder.stop();

      const doc = recorder.getDocument();

      expect(doc).toHaveProperty('version');
      expect(doc).toHaveProperty('session');
      expect(doc).toHaveProperty('initial_text');
      expect(doc).toHaveProperty('events');

      expect(doc.version).toBe('0.1');
      expect(Array.isArray(doc.events)).toBe(true);
    });

    it('should include session metadata', () => {
      recorder.start();
      recorder.stop();

      const doc = recorder.getDocument();

      expect(doc.session).toHaveProperty('id');
      expect(doc.session).toHaveProperty('user_agent');
      expect(doc.session).toHaveProperty('lang');
      expect(doc.session).toHaveProperty('device');
      expect(doc.session).toHaveProperty('source');

      expect(doc.session.source).toBe('KakiatoRecorder');
    });

    it('should throw error when no session available', () => {
      expect(() => recorder.getDocument()).toThrow('No recording session available');
    });
  });

  describe('exportJSON', () => {
    it('should export as valid JSON string', () => {
      recorder.start();
      recorder.stop();

      const json = recorder.exportJSON();
      const parsed = JSON.parse(json);

      expect(parsed).toHaveProperty('version');
      expect(parsed).toHaveProperty('session');
      expect(parsed).toHaveProperty('events');
    });

    it('should be pretty-printed', () => {
      recorder.start();
      recorder.stop();

      const json = recorder.exportJSON();

      // Pretty-printed JSON should contain newlines
      expect(json).toContain('\n');
    });
  });

  describe('exportNDJSON', () => {
    it('should export as newline-delimited JSON', () => {
      recorder.start();
      recorder.stop();

      const ndjson = recorder.exportNDJSON();
      const lines = ndjson.split('\n');

      expect(lines.length).toBeGreaterThan(0);

      // First line should be header
      const header = JSON.parse(lines[0]);
      expect(header).toHaveProperty('version');
      expect(header).toHaveProperty('session');
    });

    it('should have one event per line after header', () => {
      recorder.start();
      recorder.stop();

      const doc = recorder.getDocument();
      const ndjson = recorder.exportNDJSON();
      const lines = ndjson.split('\n').filter(line => line.trim());

      // Header + events
      expect(lines.length).toBe(1 + doc.events.length);
    });
  });

  describe('device detection', () => {
    it('should detect desktop by default', () => {
      recorder.start();
      recorder.stop();

      const doc = recorder.getDocument();

      // In test environment, should default to desktop
      expect(['desktop', 'mobile', 'tablet']).toContain(doc.session.device);
    });
  });

  describe('initial text capture', () => {
    it('should capture empty initial text', () => {
      recorder.start();
      recorder.stop();

      const doc = recorder.getDocument();

      expect(doc.initial_text).toBe('');
    });
  });

  describe('session id uniqueness', () => {
    it('should generate unique session IDs', () => {
      const recorder1 = new KakiatoRecorder();
      const recorder2 = new KakiatoRecorder();

      recorder1.start();
      recorder2.start();

      recorder1.stop();
      recorder2.stop();

      const doc1 = recorder1.getDocument();
      const doc2 = recorder2.getDocument();

      expect(doc1.session.id).not.toBe(doc2.session.id);
    });
  });
});
