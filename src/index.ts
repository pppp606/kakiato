/**
 * Kakiato - Capturing the traces of writing
 *
 * A comprehensive event capture and replay system for text editing interactions.
 */

// Recorder
export { KakiatoRecorder } from './recorder/KakiatoRecorder.js';
export type { RecorderOptions } from './recorder/KakiatoRecorder.js';

// Player
export { KakiatoPlayer } from './player/KakiatoPlayer.js';
export { PlaybackEngine } from './player/engine.js';
export { StateReconstructor } from './player/state.js';
export { TextViewer } from './player/viewer.js';
export type { PlayerOptions, PlayerState } from './player/KakiatoPlayer.js';
export type { TextState } from './player/state.js';
export type { ViewerOptions } from './player/viewer.js';

// Core types
export type * from './core/types.js';
