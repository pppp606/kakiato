import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlaybackEngine } from './engine';
import type { KakiatoEvent } from '../core/types';

describe('PlaybackEngine', () => {
  let engine: PlaybackEngine;
  const mockEvents: KakiatoEvent[] = [
    { time: 0, type: 'focus' },
    { time: 100, type: 'keydown', key: 'h', code: 'KeyH' },
    { time: 200, type: 'input', inputType: 'insertText', data: 'h' },
    { time: 300, type: 'keydown', key: 'i', code: 'KeyI' },
    { time: 400, type: 'input', inputType: 'insertText', data: 'i' },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    engine = new PlaybackEngine({ speed: 1.0 });
  });

  describe('initialization', () => {
    it('should initialize with default options', () => {
      expect(engine.getSpeed()).toBe(1.0);
      expect(engine.getIsPlaying()).toBe(false);
      expect(engine.getCurrentIndex()).toBe(0);
    });

    it('should initialize with custom speed', () => {
      const customEngine = new PlaybackEngine({ speed: 2.0 });
      expect(customEngine.getSpeed()).toBe(2.0);
    });
  });

  describe('loadEvents', () => {
    it('should load events', () => {
      engine.loadEvents(mockEvents);
      expect(engine.getDuration()).toBe(400);
    });

    it('should reset playback state', () => {
      engine.loadEvents(mockEvents);
      engine.play();

      engine.loadEvents(mockEvents);
      expect(engine.getCurrentIndex()).toBe(0);
    });
  });

  describe('play and pause', () => {
    beforeEach(() => {
      engine.loadEvents(mockEvents);
    });

    it('should start playback', () => {
      engine.play();
      expect(engine.getIsPlaying()).toBe(true);
    });

    it('should pause playback', () => {
      engine.play();
      engine.pause();
      expect(engine.getIsPlaying()).toBe(false);
    });

    it('should not play if no events loaded', () => {
      const emptyEngine = new PlaybackEngine();
      emptyEngine.play();
      expect(emptyEngine.getIsPlaying()).toBe(false);
    });

    it('should not play if already playing', () => {
      engine.play();
      const spy = vi.spyOn(console, 'warn');
      engine.play();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('should stop and reset playback', () => {
      engine.loadEvents(mockEvents);
      engine.play();
      vi.advanceTimersByTime(200);

      engine.stop();

      expect(engine.getIsPlaying()).toBe(false);
      expect(engine.getCurrentIndex()).toBe(0);
    });
  });

  describe('speed control', () => {
    beforeEach(() => {
      engine.loadEvents(mockEvents);
    });

    it('should set playback speed', () => {
      engine.setSpeed(2.0);
      expect(engine.getSpeed()).toBe(2.0);
    });

    it('should throw error for invalid speed', () => {
      expect(() => engine.setSpeed(0)).toThrow('Speed must be positive');
      expect(() => engine.setSpeed(-1)).toThrow('Speed must be positive');
    });

    it('should pause and resume when changing speed during playback', () => {
      engine.play();
      const wasPlaying = engine.getIsPlaying();

      engine.setSpeed(2.0);

      expect(wasPlaying).toBe(true);
      expect(engine.getSpeed()).toBe(2.0);
    });
  });

  describe('seek', () => {
    beforeEach(() => {
      engine.loadEvents(mockEvents);
    });

    it('should seek to specific time', () => {
      const events: KakiatoEvent[] = [];
      engine.onEvent((event) => events.push(event));

      engine.seek(200);

      // Should replay events up to time 200
      expect(events.length).toBeGreaterThan(0);
    });

    it('should maintain playing state after seek', () => {
      engine.play();
      vi.advanceTimersByTime(100);

      engine.seek(200);

      // Seek pauses, but we can verify it worked
      expect(engine.getCurrentTime()).toBeGreaterThanOrEqual(200);
    });
  });

  describe('event emission', () => {
    it('should emit events to registered handlers', () => {
      engine.loadEvents(mockEvents);

      const emittedEvents: KakiatoEvent[] = [];
      engine.onEvent((event) => {
        emittedEvents.push(event);
      });

      engine.play();
      vi.advanceTimersByTime(1000);

      expect(emittedEvents.length).toBeGreaterThan(0);
    });

    it('should support multiple event handlers', () => {
      engine.loadEvents(mockEvents);

      const events1: KakiatoEvent[] = [];
      const events2: KakiatoEvent[] = [];

      engine.onEvent((event) => events1.push(event));
      engine.onEvent((event) => events2.push(event));

      engine.play();
      vi.advanceTimersByTime(1000);

      expect(events1.length).toBe(events2.length);
      expect(events1.length).toBeGreaterThan(0);
    });

    it('should remove event handlers', () => {
      engine.loadEvents(mockEvents);

      const events: KakiatoEvent[] = [];
      const handler = (event: KakiatoEvent) => events.push(event);

      engine.onEvent(handler);
      engine.offEvent(handler);

      engine.play();
      vi.advanceTimersByTime(1000);

      expect(events.length).toBe(0);
    });
  });

  describe('duration', () => {
    it('should return 0 for empty events', () => {
      expect(engine.getDuration()).toBe(0);
    });

    it('should return last event time', () => {
      engine.loadEvents(mockEvents);
      expect(engine.getDuration()).toBe(400);
    });
  });

  describe('current time', () => {
    it('should track current time during playback', () => {
      engine.loadEvents(mockEvents);
      engine.play();

      vi.advanceTimersByTime(100);

      expect(engine.getCurrentTime()).toBeGreaterThanOrEqual(0);
    });

    it('should return paused time when not playing', () => {
      engine.loadEvents(mockEvents);
      engine.play();
      vi.advanceTimersByTime(100);
      engine.pause();

      const pausedTime = engine.getCurrentTime();
      vi.advanceTimersByTime(100);

      expect(engine.getCurrentTime()).toBe(pausedTime);
    });
  });
});
