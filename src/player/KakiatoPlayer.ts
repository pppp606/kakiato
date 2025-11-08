/**
 * KakiatoPlayer
 *
 * Main class for replaying editing events.
 */

import type { KakiatoDocument } from '../core/types.js';
import { PlaybackEngine } from './engine.js';
import { StateReconstructor } from './state.js';
import { TextViewer, type ViewerStyles } from './viewer.js';
import type { TextState } from './state.js';

export interface PlayerOptions {
  /** Container element for visualization */
  container?: HTMLElement;
  /** Playback speed multiplier (default: 1.0) */
  speed?: number;
  /** Auto-play on initialization */
  autoPlay?: boolean;
  /** Show selection in visualization */
  showSelection?: boolean;
  /** Custom styles for the viewer */
  styles?: ViewerStyles;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  textState: TextState;
}

export class KakiatoPlayer {
  private document: KakiatoDocument | null = null;
  private engine: PlaybackEngine;
  private stateReconstructor: StateReconstructor;
  private viewer: TextViewer | null = null;

  constructor(options: PlayerOptions = {}) {
    this.engine = new PlaybackEngine({
      speed: options.speed ?? 1.0,
    });

    this.stateReconstructor = new StateReconstructor();

    // Set up event handler
    this.engine.onEvent((event) => {
      this.stateReconstructor.applyEvent(event);
      if (this.viewer) {
        this.viewer.render(this.stateReconstructor.getState());
      }
    });

    // Set up viewer if container provided
    if (options.container) {
      this.viewer = new TextViewer({
        container: options.container,
        showSelection: options.showSelection ?? true,
        ...(options.styles && { styles: options.styles }),
      });
    }
  }

  /**
   * Load a Kakiato document
   */
  load(document: KakiatoDocument): void {
    this.document = document;
    this.engine.loadEvents(document.events);
    this.stateReconstructor.reset(document.initial_text);

    if (this.viewer) {
      this.viewer.render(this.stateReconstructor.getState());
    }
  }

  /**
   * Load from JSON string
   */
  loadJSON(json: string): void {
    const document = JSON.parse(json) as KakiatoDocument;
    this.load(document);
  }

  /**
   * Start playback
   */
  play(): void {
    if (!this.document) {
      throw new Error('No document loaded');
    }
    this.engine.play();
  }

  /**
   * Pause playback
   */
  pause(): void {
    this.engine.pause();
  }

  /**
   * Stop playback and reset to beginning
   */
  stop(): void {
    this.engine.stop();
    if (this.document) {
      this.stateReconstructor.reset(this.document.initial_text);
      if (this.viewer) {
        this.viewer.render(this.stateReconstructor.getState());
      }
    }
  }

  /**
   * Seek to a specific time (in milliseconds)
   */
  seek(timeMs: number): void {
    this.engine.seek(timeMs);
  }

  /**
   * Set playback speed
   */
  setSpeed(speed: number): void {
    this.engine.setSpeed(speed);
  }

  /**
   * Get current player state
   */
  getState(): PlayerState {
    return {
      isPlaying: this.engine.getIsPlaying(),
      currentTime: this.engine.getCurrentTime(),
      duration: this.engine.getDuration(),
      speed: this.engine.getSpeed(),
      textState: this.stateReconstructor.getState(),
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.engine.stop();
    // Viewer cleanup is handled by removing the container
  }
}
