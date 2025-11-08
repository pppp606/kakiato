/**
 * Keyboard event handler
 *
 * Captures keydown and keyup events with modifier keys and cursor position.
 */

import type { KakiatoKeyboardEvent, KakiatoModifiers } from '../../core/types.js';

export class KeyboardHandler {
  private startTime: number;
  private onEvent: (event: KakiatoKeyboardEvent) => void;

  constructor(startTime: number, onEvent: (event: KakiatoKeyboardEvent) => void) {
    this.startTime = startTime;
    this.onEvent = onEvent;
  }

  /**
   * Handle keydown event
   */
  handleKeyDown = (event: KeyboardEvent): void => {
    const pos = this.getCursorPosition(event.target);
    const modifiers = this.extractModifiers(event);

    const kakiatoEvent: KakiatoKeyboardEvent = {
      time: Date.now() - this.startTime,
      type: 'keydown',
      key: event.key,
      code: event.code,
      ...(pos !== undefined && { pos }),
      ...(modifiers && { modifiers }),
    };

    this.onEvent(kakiatoEvent);
  };

  /**
   * Handle keyup event
   */
  handleKeyUp = (event: KeyboardEvent): void => {
    const pos = this.getCursorPosition(event.target);
    const modifiers = this.extractModifiers(event);

    const kakiatoEvent: KakiatoKeyboardEvent = {
      time: Date.now() - this.startTime,
      type: 'keyup',
      key: event.key,
      code: event.code,
      ...(pos !== undefined && { pos }),
      ...(modifiers && { modifiers }),
    };

    this.onEvent(kakiatoEvent);
  };

  /**
   * Extract modifier keys from keyboard event
   */
  private extractModifiers(event: KeyboardEvent): KakiatoModifiers | undefined {
    const modifiers: KakiatoModifiers = {};
    let hasModifiers = false;

    if (event.shiftKey) {
      modifiers.shift = true;
      hasModifiers = true;
    }
    if (event.ctrlKey) {
      modifiers.ctrl = true;
      hasModifiers = true;
    }
    if (event.altKey) {
      modifiers.alt = true;
      hasModifiers = true;
    }
    if (event.metaKey) {
      modifiers.meta = true;
      hasModifiers = true;
    }

    return hasModifiers ? modifiers : undefined;
  }

  /**
   * Get cursor position from the event target
   */
  private getCursorPosition(target: EventTarget | null): number | undefined {
    if (!target) return undefined;

    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      return target.selectionStart ?? undefined;
    }

    // For contenteditable elements
    if (target instanceof HTMLElement && target.isContentEditable) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return undefined;

      const range = selection.getRangeAt(0);
      return range.startOffset;
    }

    return undefined;
  }

  /**
   * Attach event listeners to target element
   */
  attach(target: HTMLElement | Document = document): void {
    target.addEventListener('keydown', this.handleKeyDown as EventListener);
    target.addEventListener('keyup', this.handleKeyUp as EventListener);
  }

  /**
   * Detach event listeners from target element
   */
  detach(target: HTMLElement | Document = document): void {
    target.removeEventListener('keydown', this.handleKeyDown as EventListener);
    target.removeEventListener('keyup', this.handleKeyUp as EventListener);
  }
}
