import { describe, it, expect, beforeEach } from 'vitest';
import { StateReconstructor } from './state';
import type { KakiatoEvent } from '../core/types';

describe('StateReconstructor', () => {
  let reconstructor: StateReconstructor;

  beforeEach(() => {
    reconstructor = new StateReconstructor('');
  });

  describe('initialization', () => {
    it('should initialize with empty text', () => {
      const state = reconstructor.getState();
      expect(state.text).toBe('');
      expect(state.cursorPosition).toBe(0);
      expect(state.isComposing).toBe(false);
    });

    it('should initialize with provided text', () => {
      const reconstructor = new StateReconstructor('hello');
      const state = reconstructor.getState();
      expect(state.text).toBe('hello');
    });
  });

  describe('input events', () => {
    it('should handle text insertion', () => {
      const event: KakiatoEvent = {
        time: 100,
        type: 'input',
        inputType: 'insertText',
        data: 'h',
        text: 'h',
        pos: 1,
      };

      reconstructor.applyEvent(event);
      const state = reconstructor.getState();

      expect(state.text).toBe('h');
      expect(state.cursorPosition).toBe(1);
    });

    it('should handle multiple character insertion', () => {
      reconstructor.applyEvent({
        time: 100,
        type: 'input',
        inputType: 'insertText',
        data: 'h',
        text: 'h',
        pos: 1,
      });

      reconstructor.applyEvent({
        time: 200,
        type: 'input',
        inputType: 'insertText',
        data: 'e',
        text: 'he',
        pos: 2,
      });

      const state = reconstructor.getState();
      expect(state.text).toBe('he');
      expect(state.cursorPosition).toBe(2);
    });

    it('should use full text from event when available', () => {
      const event: KakiatoEvent = {
        time: 100,
        type: 'input',
        inputType: 'insertText',
        text: 'hello world',
        pos: 11,
      };

      reconstructor.applyEvent(event);
      const state = reconstructor.getState();

      expect(state.text).toBe('hello world');
    });
  });

  describe('composition events', () => {
    it('should track composition state', () => {
      reconstructor.applyEvent({
        time: 100,
        type: 'compositionstart',
        data: 'h',
      });

      let state = reconstructor.getState();
      expect(state.isComposing).toBe(true);
      expect(state.compositionText).toBe('h');

      reconstructor.applyEvent({
        time: 200,
        type: 'compositionupdate',
        data: 'he',
      });

      state = reconstructor.getState();
      expect(state.isComposing).toBe(true);
      expect(state.compositionText).toBe('he');

      reconstructor.applyEvent({
        time: 300,
        type: 'compositionend',
        data: 'hello',
      });

      state = reconstructor.getState();
      expect(state.isComposing).toBe(false);
      expect(state.compositionText).toBe('');
    });
  });

  describe('selection events', () => {
    it('should update selection range', () => {
      reconstructor.reset('hello world');

      const event: KakiatoEvent = {
        time: 100,
        type: 'selectionchange',
        anchor: { index: 0, affinity: 'forward' },
        focus: { index: 5, affinity: 'forward' },
      };

      reconstructor.applyEvent(event);
      const state = reconstructor.getState();

      expect(state.selectionStart).toBe(0);
      expect(state.selectionEnd).toBe(5);
      expect(state.cursorPosition).toBe(5);
    });

    it('should handle backward selection', () => {
      reconstructor.reset('hello world');

      const event: KakiatoEvent = {
        time: 100,
        type: 'selectionchange',
        anchor: { index: 5, affinity: 'backward' },
        focus: { index: 0, affinity: 'backward' },
      };

      reconstructor.applyEvent(event);
      const state = reconstructor.getState();

      expect(state.selectionStart).toBe(0);
      expect(state.selectionEnd).toBe(5);
      expect(state.cursorPosition).toBe(0);
    });
  });

  describe('keyboard events', () => {
    it('should update cursor position from keyboard event', () => {
      reconstructor.reset('hello');

      const event: KakiatoEvent = {
        time: 100,
        type: 'keydown',
        key: 'ArrowRight',
        code: 'ArrowRight',
        pos: 3,
      };

      reconstructor.applyEvent(event);
      const state = reconstructor.getState();

      expect(state.cursorPosition).toBe(3);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      reconstructor.applyEvent({
        time: 100,
        type: 'input',
        inputType: 'insertText',
        text: 'hello',
        pos: 5,
      });

      reconstructor.reset('new text');
      const state = reconstructor.getState();

      expect(state.text).toBe('new text');
      expect(state.cursorPosition).toBe(0);
      expect(state.isComposing).toBe(false);
    });
  });

  describe('focus events', () => {
    it('should not modify state on focus/blur', () => {
      const initialState = reconstructor.getState();

      reconstructor.applyEvent({
        time: 100,
        type: 'focus',
      });

      const state1 = reconstructor.getState();
      expect(state1).toEqual(initialState);

      reconstructor.applyEvent({
        time: 200,
        type: 'blur',
      });

      const state2 = reconstructor.getState();
      expect(state2).toEqual(initialState);
    });
  });
});
