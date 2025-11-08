/**
 * Focus event handler
 *
 * Captures focus and blur events to track when editing areas become active or inactive.
 */

import type { KakiatoFocusEvent } from '../../core/types.js';

export class FocusHandler {
  private startTime: number;
  private onEvent: (event: KakiatoFocusEvent) => void;

  constructor(startTime: number, onEvent: (event: KakiatoFocusEvent) => void) {
    this.startTime = startTime;
    this.onEvent = onEvent;
  }

  /**
   * Handle focus event
   */
  handleFocus = (event: FocusEvent): void => {
    // Only track focus on editable elements
    const target = event.target;
    if (!this.isEditableElement(target)) return;

    const kakiatoEvent: KakiatoFocusEvent = {
      time: Date.now() - this.startTime,
      type: 'focus',
    };

    this.onEvent(kakiatoEvent);
  };

  /**
   * Handle blur event
   */
  handleBlur = (event: FocusEvent): void => {
    // Only track blur on editable elements
    const target = event.target;
    if (!this.isEditableElement(target)) return;

    const kakiatoEvent: KakiatoFocusEvent = {
      time: Date.now() - this.startTime,
      type: 'blur',
    };

    this.onEvent(kakiatoEvent);
  };

  /**
   * Check if the target is an editable element
   */
  private isEditableElement(target: EventTarget | null): boolean {
    if (!target) return false;

    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      return true;
    }

    if (target instanceof HTMLElement && target.isContentEditable) {
      return true;
    }

    return false;
  }

  /**
   * Attach event listeners to target element
   */
  attach(target: HTMLElement | Document = document): void {
    // Use capture phase to ensure we catch focus events before they bubble
    target.addEventListener('focus', this.handleFocus as EventListener, true);
    target.addEventListener('blur', this.handleBlur as EventListener, true);
  }

  /**
   * Detach event listeners from target element
   */
  detach(target: HTMLElement | Document = document): void {
    target.removeEventListener('focus', this.handleFocus as EventListener, true);
    target.removeEventListener('blur', this.handleBlur as EventListener, true);
  }
}
