# Kakiato

**Capturing the traces of writing.**

A comprehensive event capture and replay system for text editing interactions. Kakiato records every keystroke, IME input, selection change, and editing event with precise timing, allowing you to replay and analyze text editing sessions.


## Features

- 🎙️ **High-fidelity recording** - Captures keyboard, input, IME composition, selection, and focus events
- 🎬 **Smooth playback** - Replay recordings with adjustable speed and timeline seeking
- 🌏 **IME support** - Full support for Japanese, Chinese, and other complex input methods
- 📊 **Structured format** - JSON-based format with comprehensive event data
- 🎨 **Visualization** - Built-in text viewer with selection rendering
- 🔧 **TypeScript** - Fully typed with excellent IDE support

## Installation

```bash
npm install kakiato
```

## Quick Start

### Recording

```typescript
import { KakiatoRecorder } from 'kakiato';

// Create recorder
const recorder = new KakiatoRecorder({
  target: document.querySelector('textarea')
});

// Start recording
recorder.start();

// Stop recording
recorder.stop();

// Get recorded document
const document = recorder.getDocument();

// Export as JSON
const json = recorder.exportJSON();
```

### Playback

```typescript
import { KakiatoPlayer } from 'kakiato/player';

// Create player with container
const player = new KakiatoPlayer({
  container: document.getElementById('viewer'),
  speed: 1.0
});

// Load recording
player.load(document);

// Control playback
player.play();
player.pause();
player.stop();

// Seek to specific time (in milliseconds)
player.seek(5000);

// Adjust speed
player.setSpeed(2.0);
```

## API Reference

### KakiatoRecorder

#### Constructor Options

```typescript
interface RecorderOptions {
  target?: HTMLElement | Document;  // Element to observe (default: document)
  autoStart?: boolean;              // Auto-start recording (default: false)
}
```

#### Methods

- `start(): void` - Start recording events
- `stop(): void` - Stop recording
- `getDocument(): KakiatoDocument` - Get recorded document
- `exportJSON(): string` - Export as JSON string
- `exportNDJSON(): string` - Export as newline-delimited JSON

### KakiatoPlayer

#### Constructor Options

```typescript
interface PlayerOptions {
  container?: HTMLElement;      // Container for visualization
  speed?: number;               // Playback speed multiplier (default: 1.0)
  showSelection?: boolean;      // Show selection highlight (default: true)
  styles?: ViewerStyles;        // Custom styles for the viewer
}

interface ViewerStyles {
  // Container styles
  fontFamily?: string;          // Default: 'monospace'
  fontSize?: string;            // Default: '14px'
  lineHeight?: string;          // Default: '1.6'
  padding?: string;             // Default: '1rem'
  border?: string;              // Default: '1px solid #888'
  borderRadius?: string;        // Default: '6px'
  background?: string;          // Default: '#fff'
  minHeight?: string;           // Default: '300px'
  whiteSpace?: string;          // Default: 'pre-wrap'
  color?: string;               // Default: inherit

  // Selection highlight color
  selectionBackground?: string; // Default: 'rgba(0, 0, 0, 0.2)'
}
```

**Example with custom styles:**

```typescript
const player = new KakiatoPlayer({
  container: document.getElementById('viewer'),
  speed: 1.0,
  styles: {
    fontFamily: 'serif',
    fontSize: '16px',
    background: '#f5f5f5',
    border: '2px solid #000',
    borderRadius: '12px',
    padding: '2rem',
    color: '#333',
    selectionBackground: '#ffeb3b',
  }
});
```

#### Methods

- `load(document: KakiatoDocument): void` - Load document
- `loadJSON(json: string): void` - Load from JSON string
- `play(): void` - Start playback
- `pause(): void` - Pause playback
- `stop(): void` - Stop and reset
- `seek(time: number): void` - Seek to time in milliseconds
- `setSpeed(speed: number): void` - Set playback speed
- `getState(): PlayerState` - Get current player state
- `attachViewer(container: HTMLElement, options?: { showSelection?: boolean; styles?: ViewerStyles }): void` - Attach viewer to a new container
- `detachViewer(): void` - Detach and clear viewer

## Document Format

Kakiato documents follow a structured JSON format:

```json
{
  "version": "0.1",
  "session": {
    "id": "session-uuid",
    "user_agent": "Mozilla/5.0...",
    "lang": "ja",
    "device": "desktop",
    "source": "KakiatoRecorder"
  },
  "initial_text": "",
  "events": [
    {
      "time": 0,
      "type": "focus"
    },
    {
      "time": 100,
      "type": "keydown",
      "key": "h",
      "code": "KeyH",
      "pos": 0
    },
    {
      "time": 120,
      "type": "input",
      "inputType": "insertText",
      "data": "h",
      "text": "h",
      "pos": 1
    }
  ]
}
```

## Event Types

Kakiato captures the following event types:

- **keyboard** - `keydown`, `keyup`
- **input** - `beforeinput`, `input`
- **composition** - `compositionstart`, `compositionupdate`, `compositionend` (IME)
- **selection** - `selectionchange`
- **focus** - `focus`, `blur`

## Examples

See the `examples/` directory for complete demos:

- `examples/index.html` - Integrated recorder and player demo
- `examples/recorder-demo.html` - Standalone recorder demo
- `examples/player-demo.html` - Standalone player demo

## Development

```bash
# Install dependencies
npm install

# Build library
npm run build

# Watch mode
npm run build:watch

# Run demo server
npm run dev
```

## License

MIT
