/**
 * Text State Reconstruction
 *
 * Rebuilds text content and cursor state from events.
 */

import type { KakiatoEvent } from '../core/types.js';

export interface TextState {
  text: string;
  cursorPosition: number;
  selectionStart: number;
  selectionEnd: number;
  isComposing: boolean;
  compositionText: string;
}

export class StateReconstructor {
  private state: TextState;

  constructor(initialText = '') {
    this.state = {
      text: initialText,
      cursorPosition: 0,
      selectionStart: 0,
      selectionEnd: 0,
      isComposing: false,
      compositionText: '',
    };
  }

  /**
   * Get current state
   */
  getState(): TextState {
    return { ...this.state };
  }

  /**
   * Reset to initial state
   */
  reset(initialText = ''): void {
    this.state = {
      text: initialText,
      cursorPosition: 0,
      selectionStart: 0,
      selectionEnd: 0,
      isComposing: false,
      compositionText: '',
    };
  }

  /**
   * Apply an event to the state
   */
  applyEvent(event: KakiatoEvent): void {
    switch (event.type) {
      case 'input':
        this.handleInputEvent(event);
        break;
      case 'beforeinput':
        // beforeinput is informational, actual changes come from input event
        break;
      case 'compositionstart':
        this.state.isComposing = true;
        this.state.compositionText = event.data ?? '';
        break;
      case 'compositionupdate':
        this.state.compositionText = event.data ?? '';
        break;
      case 'compositionend':
        this.state.isComposing = false;
        this.state.compositionText = '';
        break;
      case 'selectionchange':
        this.handleSelectionChange(event);
        break;
      case 'keydown':
      case 'keyup':
        // Keyboard events update cursor position if provided
        if (event.pos !== undefined) {
          this.state.cursorPosition = event.pos;
        }
        break;
      case 'focus':
      case 'blur':
        // Focus events don't change text state
        break;
    }
  }

  /**
   * Handle input event
   */
  private handleInputEvent(event: KakiatoEvent): void {
    if (event.type !== 'input') return;

    // If the event contains the full text, use it
    if (event.text !== undefined && event.text !== null) {
      this.state.text = event.text;
    } else if (event.data !== undefined && event.data !== null) {
      // Otherwise, apply the data as an insertion
      const pos = event.pos ?? this.state.cursorPosition;

      switch (event.inputType) {
        case 'insertText':
        case 'insertCompositionText':
          this.insertText(pos, event.data);
          break;
        case 'deleteContentBackward':
          this.deleteBackward(pos);
          break;
        case 'deleteContentForward':
          this.deleteForward(pos);
          break;
        case 'deleteByCut':
        case 'deleteByDrag':
          // These would need selection range info
          break;
        default:
          // Handle other input types as needed
          break;
      }
    }

    // Update cursor position
    if (event.pos !== undefined) {
      this.state.cursorPosition = event.pos;
    }
  }

  /**
   * Handle selection change event
   */
  private handleSelectionChange(event: KakiatoEvent): void {
    if (event.type !== 'selectionchange') return;

    const anchor = event.anchor.index;
    const focus = event.focus.index;

    this.state.selectionStart = Math.min(anchor, focus);
    this.state.selectionEnd = Math.max(anchor, focus);
    this.state.cursorPosition = focus;
  }

  /**
   * Insert text at position
   */
  private insertText(pos: number, text: string): void {
    const before = this.state.text.substring(0, pos);
    const after = this.state.text.substring(pos);
    this.state.text = before + text + after;
    this.state.cursorPosition = pos + text.length;
  }

  /**
   * Delete character backward from position
   */
  private deleteBackward(pos: number): void {
    if (pos <= 0) return;
    const before = this.state.text.substring(0, pos - 1);
    const after = this.state.text.substring(pos);
    this.state.text = before + after;
    this.state.cursorPosition = pos - 1;
  }

  /**
   * Delete character forward from position
   */
  private deleteForward(pos: number): void {
    if (pos >= this.state.text.length) return;
    const before = this.state.text.substring(0, pos);
    const after = this.state.text.substring(pos + 1);
    this.state.text = before + after;
  }
}
