/**
 * KakiatoRecorder
 *
 * Main class for recording editing events.
 */

import type { KakiatoDocument, KakiatoEvent, KakiatoSessionMeta } from '../core/types.js';
import { KeyboardHandler } from './handlers/keyboard.js';
import { InputHandler } from './handlers/input.js';
import { CompositionHandler } from './handlers/composition.js';
import { SelectionHandler } from './handlers/selection.js';
import { FocusHandler } from './handlers/focus.js';

export interface RecorderOptions {
  /** Target element to observe (default: document) */
  target?: HTMLElement | Document;
  /** Auto-start recording on initialization */
  autoStart?: boolean;
}

export class KakiatoRecorder {
  private events: KakiatoEvent[] = [];
  private sessionMetadata: KakiatoSessionMeta | null = null;
  private isRecording = false;
  private initialText = '';
  private startTime = 0;
  private target: HTMLElement | Document;

  // Event handlers
  private keyboardHandler: KeyboardHandler | null = null;
  private inputHandler: InputHandler | null = null;
  private compositionHandler: CompositionHandler | null = null;
  private selectionHandler: SelectionHandler | null = null;
  private focusHandler: FocusHandler | null = null;

  constructor(options: RecorderOptions = {}) {
    this.target = options.target ?? document;
    if (options.autoStart) {
      this.start();
    }
  }

  /**
   * Start recording events
   */
  start(): void {
    if (this.isRecording) {
      console.warn('Recorder is already running');
      return;
    }

    this.isRecording = true;
    this.events = [];
    this.startTime = Date.now();
    this.sessionMetadata = this.createSessionMetadata();

    // Capture initial text if available
    this.initialText = this.getInitialText();

    // Initialize and attach event handlers
    const onEvent = (event: KakiatoEvent) => {
      if (this.isRecording) {
        this.events.push(event);
      }
    };

    this.keyboardHandler = new KeyboardHandler(this.startTime, onEvent);
    this.inputHandler = new InputHandler(this.startTime, onEvent);
    this.compositionHandler = new CompositionHandler(this.startTime, onEvent);
    this.selectionHandler = new SelectionHandler(this.startTime, onEvent);
    this.focusHandler = new FocusHandler(this.startTime, onEvent);

    this.keyboardHandler.attach(this.target);
    this.inputHandler.attach(this.target);
    this.compositionHandler.attach(this.target);
    this.selectionHandler.attach();
    this.focusHandler.attach(this.target);

    console.log('Recording started');
  }

  /**
   * Stop recording events
   */
  stop(): void {
    if (!this.isRecording) {
      console.warn('Recorder is not running');
      return;
    }

    this.isRecording = false;

    // Detach all event handlers
    if (this.keyboardHandler) {
      this.keyboardHandler.detach(this.target);
      this.keyboardHandler = null;
    }
    if (this.inputHandler) {
      this.inputHandler.detach(this.target);
      this.inputHandler = null;
    }
    if (this.compositionHandler) {
      this.compositionHandler.detach(this.target);
      this.compositionHandler = null;
    }
    if (this.selectionHandler) {
      this.selectionHandler.detach();
      this.selectionHandler = null;
    }
    if (this.focusHandler) {
      this.focusHandler.detach(this.target);
      this.focusHandler = null;
    }

    console.log('Recording stopped');
  }

  /**
   * Get initial text from active element
   */
  private getInitialText(): string {
    const activeElement = document.activeElement;

    if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
      return activeElement.value;
    }

    if (activeElement instanceof HTMLElement && activeElement.isContentEditable) {
      return activeElement.textContent ?? '';
    }

    return '';
  }

  /**
   * Get the recorded document
   */
  getDocument(): KakiatoDocument {
    if (!this.sessionMetadata) {
      throw new Error('No recording session available');
    }

    return {
      version: '0.1',
      session: this.sessionMetadata,
      initial_text: this.initialText,
      events: this.events,
    };
  }

  /**
   * Export as JSON string
   */
  exportJSON(): string {
    return JSON.stringify(this.getDocument(), null, 2);
  }

  /**
   * Export as NDJSON string
   */
  exportNDJSON(): string {
    const doc = this.getDocument();
    const lines = [
      JSON.stringify({ version: doc.version, session: doc.session }),
      ...doc.events.map(event => JSON.stringify(event)),
    ];
    return lines.join('\n');
  }

  private createSessionMetadata(): KakiatoSessionMeta {
    return {
      id: crypto.randomUUID(),
      user_agent: navigator.userAgent,
      lang: navigator.language,
      device: this.detectDevice(),
      source: 'KakiatoRecorder',
    };
  }

  private detectDevice(): string {
    const ua = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|tablet/.test(ua)) {
      return /tablet|ipad/.test(ua) ? 'tablet' : 'mobile';
    }
    return 'desktop';
  }
}
