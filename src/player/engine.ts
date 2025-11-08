/**
 * Playback Engine
 *
 * Handles timeline control, event scheduling, and playback speed.
 */

import type { KakiatoEvent } from '../core/types.js';

export interface PlaybackOptions {
  speed?: number;
  loop?: boolean;
}

export type PlaybackEventHandler = (event: KakiatoEvent, index: number) => void;

export class PlaybackEngine {
  private events: KakiatoEvent[] = [];
  private currentIndex = 0;
  private isPlaying = false;
  private speed = 1.0;
  private loop = false;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private startTime = 0;
  private pausedAt = 0; // Time in the recording timeline (not real time)
  private onEventHandlers: PlaybackEventHandler[] = [];

  constructor(options: PlaybackOptions = {}) {
    this.speed = options.speed ?? 1.0;
    this.loop = options.loop ?? false;
  }

  /**
   * Load events for playback
   */
  loadEvents(events: KakiatoEvent[]): void {
    this.events = events;
    this.currentIndex = 0;
    this.pausedAt = 0;
  }

  /**
   * Add event handler
   */
  onEvent(handler: PlaybackEventHandler): void {
    this.onEventHandlers.push(handler);
  }

  /**
   * Remove event handler
   */
  offEvent(handler: PlaybackEventHandler): void {
    const index = this.onEventHandlers.indexOf(handler);
    if (index > -1) {
      this.onEventHandlers.splice(index, 1);
    }
  }

  /**
   * Start playback
   */
  play(): void {
    if (this.isPlaying) return;
    if (this.events.length === 0) return;

    this.isPlaying = true;
    // startTime is when we started playing in real time
    // pausedAt is the recording timeline position we're resuming from
    // Calculate: if we're at pausedAt in recording time, how much real time has elapsed?
    // realTime = recordingTime / speed
    this.startTime = Date.now() - this.pausedAt / this.speed;
    this.scheduleNextEvent();
  }

  /**
   * Pause playback
   */
  pause(): void {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    // Store the recording timeline position (not real time elapsed)
    // recordingTime = realTime * speed
    this.pausedAt = (Date.now() - this.startTime) * this.speed;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Stop playback and reset
   */
  stop(): void {
    this.pause();
    this.currentIndex = 0;
    this.pausedAt = 0;
  }

  /**
   * Seek to specific time (in milliseconds)
   */
  seek(time: number): void {
    const wasPlaying = this.isPlaying;
    this.pause();

    // Find the event index at or before the target time
    let targetIndex = 0;
    for (let i = 0; i < this.events.length; i++) {
      if (this.events[i].time <= time) {
        targetIndex = i;
      } else {
        break;
      }
    }

    this.currentIndex = targetIndex;
    this.pausedAt = time;

    // Replay all events up to this point
    for (let i = 0; i <= targetIndex; i++) {
      this.emitEvent(this.events[i], i);
    }

    if (wasPlaying) {
      this.play();
    }
  }

  /**
   * Set playback speed
   */
  setSpeed(speed: number): void {
    if (speed <= 0) {
      throw new Error('Speed must be positive');
    }

    const wasPlaying = this.isPlaying;
    if (wasPlaying) {
      this.pause();
    }

    this.speed = speed;

    if (wasPlaying) {
      this.play();
    }
  }

  /**
   * Get current playback speed
   */
  getSpeed(): number {
    return this.speed;
  }

  /**
   * Get current playback time
   */
  getCurrentTime(): number {
    if (this.isPlaying) {
      // Return recording timeline position
      // recordingTime = realTime * speed
      return (Date.now() - this.startTime) * this.speed;
    }
    return this.pausedAt;
  }

  /**
   * Get total duration
   */
  getDuration(): number {
    if (this.events.length === 0) return 0;
    return this.events[this.events.length - 1].time;
  }

  /**
   * Get current event index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Check if playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Schedule the next event
   */
  private scheduleNextEvent(): void {
    if (!this.isPlaying) return;
    if (this.currentIndex >= this.events.length) {
      if (this.loop) {
        this.currentIndex = 0;
        this.startTime = Date.now();
        this.pausedAt = 0;
        this.scheduleNextEvent();
      } else {
        this.isPlaying = false;
      }
      return;
    }

    const event = this.events[this.currentIndex];
    // Calculate elapsed real time
    const elapsedRealTime = Date.now() - this.startTime;
    // Convert to recording timeline: recordingTime = realTime * speed
    const currentTime = elapsedRealTime * this.speed;
    // Calculate remaining time in recording timeline
    const timeUntilEvent = event.time - currentTime;
    // Convert to real time delay: realDelay = recordingDelay / speed
    const delay = Math.max(0, timeUntilEvent / this.speed);

    this.timeoutId = setTimeout(() => {
      this.emitEvent(event, this.currentIndex);
      this.currentIndex++;
      this.scheduleNextEvent();
    }, delay);
  }

  /**
   * Emit event to all handlers
   */
  private emitEvent(event: KakiatoEvent, index: number): void {
    for (const handler of this.onEventHandlers) {
      handler(event, index);
    }
  }
}
