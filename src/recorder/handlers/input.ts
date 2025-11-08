/**
 * Input event handler
 *
 * Captures beforeinput and input events for text insertion and deletion.
 */

import type { KakiatoInputEvent, KakiatoModifiers } from '../../core/types.js';

export class InputHandler {
  private startTime: number;
  private onEvent: (event: KakiatoInputEvent) => void;

  constructor(startTime: number, onEvent: (event: KakiatoInputEvent) => void) {
    this.startTime = startTime;
    this.onEvent = onEvent;
  }

  /**
   * Handle beforeinput event
   */
  handleBeforeInput = (event: InputEvent): void => {
    const pos = this.getCursorPosition(event.target);
    const modifiers = this.extractModifiers(event);

    const kakiatoEvent: KakiatoInputEvent = {
      time: Date.now() - this.startTime,
      type: 'beforeinput',
      inputType: event.inputType,
      ...(pos !== undefined && { pos }),
      ...(event.data !== null && { data: event.data }),
      ...(modifiers && { modifiers }),
    };

    this.onEvent(kakiatoEvent);
  };

  /**
   * Handle input event
   */
  handleInput = (event: InputEvent): void => {
    const target = event.target;
    const pos = this.getCursorPosition(event.target);
    const modifiers = this.extractModifiers(event);
    let text: string | null = null;

    // Extract current text content
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      text = target.value;
    } else if (target instanceof HTMLElement && target.isContentEditable) {
      text = target.textContent;
    }

    const kakiatoEvent: KakiatoInputEvent = {
      time: Date.now() - this.startTime,
      type: 'input',
      inputType: event.inputType,
      ...(pos !== undefined && { pos }),
      ...(event.data !== null && { data: event.data }),
      ...(text !== null && { text }),
      ...(modifiers && { modifiers }),
    };

    this.onEvent(kakiatoEvent);
  };

  /**
   * Extract modifier keys from input event
   */
  private extractModifiers(event: InputEvent): KakiatoModifiers | undefined {
    // InputEvent doesn't directly expose modifier keys,
    // but we can check if it's a UIEvent
    const uiEvent = event as UIEvent & {
      shiftKey?: boolean;
      ctrlKey?: boolean;
      altKey?: boolean;
      metaKey?: boolean;
    };

    const modifiers: KakiatoModifiers = {};
    let hasModifiers = false;

    if (uiEvent.shiftKey) {
      modifiers.shift = true;
      hasModifiers = true;
    }
    if (uiEvent.ctrlKey) {
      modifiers.ctrl = true;
      hasModifiers = true;
    }
    if (uiEvent.altKey) {
      modifiers.alt = true;
      hasModifiers = true;
    }
    if (uiEvent.metaKey) {
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
    target.addEventListener('beforeinput', this.handleBeforeInput as EventListener);
    target.addEventListener('input', this.handleInput as EventListener);
  }

  /**
   * Detach event listeners from target element
   */
  detach(target: HTMLElement | Document = document): void {
    target.removeEventListener('beforeinput', this.handleBeforeInput as EventListener);
    target.removeEventListener('input', this.handleInput as EventListener);
  }
}
