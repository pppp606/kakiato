/**
 * Selection change event handler
 *
 * Captures selection changes including cursor movement and text selection.
 */

import type { KakiatoSelectionChangeEvent } from '../../core/types.js';

export class SelectionHandler {
  private startTime: number;
  private onEvent: (event: KakiatoSelectionChangeEvent) => void;
  private lastSelection: { anchorIndex: number; focusIndex: number } | null = null;

  constructor(startTime: number, onEvent: (event: KakiatoSelectionChangeEvent) => void) {
    this.startTime = startTime;
    this.onEvent = onEvent;
  }

  /**
   * Handle selectionchange event
   */
  handleSelectionChange = (): void => {
    const selection = window.getSelection();
    if (!selection) return;

    const activeElement = document.activeElement;
    if (!activeElement) return;

    // Get anchor and focus positions
    let anchorIndex: number;
    let focusIndex: number;

    if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
      // For input/textarea elements
      anchorIndex = activeElement.selectionStart ?? 0;
      focusIndex = activeElement.selectionEnd ?? 0;
    } else if (activeElement instanceof HTMLElement && activeElement.isContentEditable) {
      // For contenteditable elements
      if (selection.rangeCount === 0) return;

      anchorIndex = this.getTextOffset(activeElement, selection.anchorNode, selection.anchorOffset);
      focusIndex = this.getTextOffset(activeElement, selection.focusNode, selection.focusOffset);
    } else {
      // Not an editable element
      return;
    }

    // Check if selection has actually changed
    if (
      this.lastSelection &&
      this.lastSelection.anchorIndex === anchorIndex &&
      this.lastSelection.focusIndex === focusIndex
    ) {
      return;
    }

    this.lastSelection = { anchorIndex, focusIndex };

    // Determine affinity
    const affinity = this.determineAffinity(anchorIndex, focusIndex);

    const kakiatoEvent: KakiatoSelectionChangeEvent = {
      time: Date.now() - this.startTime,
      type: 'selectionchange',
      anchor: {
        index: anchorIndex,
        affinity,
      },
      focus: {
        index: focusIndex,
        affinity,
      },
    };

    this.onEvent(kakiatoEvent);
  };

  /**
   * Get text offset for contenteditable elements
   */
  private getTextOffset(root: HTMLElement, node: Node | null, offset: number): number {
    if (!node) return 0;

    let textOffset = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

    let currentNode: Node | null;
    while ((currentNode = walker.nextNode())) {
      if (currentNode === node) {
        return textOffset + offset;
      }
      textOffset += currentNode.textContent?.length ?? 0;
    }

    return textOffset;
  }

  /**
   * Determine selection affinity
   */
  private determineAffinity(anchorIndex: number, focusIndex: number): 'forward' | 'backward' | 'none' {
    if (anchorIndex === focusIndex) {
      return 'none';
    }
    return anchorIndex < focusIndex ? 'forward' : 'backward';
  }

  /**
   * Attach event listeners
   */
  attach(): void {
    document.addEventListener('selectionchange', this.handleSelectionChange);
  }

  /**
   * Detach event listeners
   */
  detach(): void {
    document.removeEventListener('selectionchange', this.handleSelectionChange);
  }

  /**
   * Reset internal state
   */
  reset(): void {
    this.lastSelection = null;
  }
}
