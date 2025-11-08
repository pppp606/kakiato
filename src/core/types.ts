/**
 * Kakiato type definitions.
 *
 * These interfaces define the Kakiato document format v0.1 and are
 * shared across recorder and player implementations.
 */

export type KakiatoVersion = "0.1";

type KnownKakiatoDevice = "desktop" | "mobile" | "tablet";

export interface KakiatoSessionMeta {
  id: string;
  user_agent: string;
  lang: string;
  device: KnownKakiatoDevice | (string & {});
  source: string;
  meta?: Record<string, unknown>;
}

export interface KakiatoModifiers {
  shift?: boolean;
  ctrl?: boolean;
  alt?: boolean;
  meta?: boolean;
  [modifier: string]: boolean | undefined;
}

export interface KakiatoEventBase {
  time: number;
  type: KakiatoEventType;
  pos?: number;
  meta?: Record<string, unknown>;
}

export type KakiatoEventType =
  | "keydown"
  | "keyup"
  | "beforeinput"
  | "input"
  | "compositionstart"
  | "compositionupdate"
  | "compositionend"
  | "selectionchange"
  | "focus"
  | "blur"
  | "custom";

export interface KakiatoKeyboardEvent extends KakiatoEventBase {
  type: "keydown" | "keyup";
  key: string;
  code: string;
  modifiers?: KakiatoModifiers;
}

export interface KakiatoInputEvent extends KakiatoEventBase {
  type: "beforeinput" | "input";
  inputType: string;
  data?: string | null;
  text?: string | null;
  modifiers?: KakiatoModifiers;
}

export interface KakiatoCompositionSegment {
  text: string;
  highlight?: boolean;
}

export interface KakiatoCompositionEvent extends KakiatoEventBase {
  type: "compositionstart" | "compositionupdate" | "compositionend";
  data?: string;
  segments?: KakiatoCompositionSegment[];
}

export interface KakiatoSelectionPosition {
  index: number;
  affinity?: "forward" | "backward" | "none";
}

export interface KakiatoSelectionChangeEvent extends KakiatoEventBase {
  type: "selectionchange";
  anchor: KakiatoSelectionPosition;
  focus: KakiatoSelectionPosition;
}

export interface KakiatoFocusEvent extends KakiatoEventBase {
  type: "focus" | "blur";
}

export interface KakiatoCustomEvent extends KakiatoEventBase {
  type: "custom";
  label: string;
  payload?: Record<string, unknown>;
}

export type KakiatoEvent =
  | KakiatoKeyboardEvent
  | KakiatoInputEvent
  | KakiatoCompositionEvent
  | KakiatoSelectionChangeEvent
  | KakiatoFocusEvent
  | KakiatoCustomEvent;

export interface KakiatoDocument {
  version: KakiatoVersion;
  session: KakiatoSessionMeta;
  initial_text: string;
  events: KakiatoEvent[];
}

