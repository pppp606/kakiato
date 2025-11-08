# Worklog

## 2024-05-23
- Initialised core data model structure.
- Added TypeScript definitions for the High-Resolution Edit Format (HREF) v0.1 document and events.
- Authored a JSON Schema (`src/core/schema.ts`) that mirrors the type definitions for validation tooling.

### Next steps
- Decide on package tooling (build/test) and add linting + schema validation dependencies.
- Implement recorder module APIs that emit `KakiatoEvent` sequences conforming to the schema.
- Provide usage examples and fixtures under `examples/` for end-to-end validation.
- Document validation workflow in `README.md` once tooling is in place.

---

## 2025-11-05 - 詳細タスクリスト

### ステータス凡例
- ⏳ 未着手
- 🚧 進行中
- ✅ 完了

---

## Phase 0: プロジェクト基盤 🏗️

### ✅ 0.1 コアスキーマ定義
- **ファイル**: `src/core/schema.ts`, `src/core/types.ts`
- **内容**: JSON Schema と TypeScript 型定義の作成
- **ステータス**: ✅ 完了

### ⏳ 0.2 プロジェクトセットアップ
- **ファイル**: `package.json`, `tsconfig.json`
- **内容**:
  - npm パッケージ初期化
  - TypeScript 設定
  - 必要な依存関係のインストール
  - ビルドスクリプトの設定
- **ステータス**: ⏳ 未着手

### ⏳ 0.3 ビルド環境構築
- **ツール**: esbuild / Vite / webpack など
- **内容**:
  - Recorder用バンドル設定（ブラウザ向け）
  - Player用バンドル設定（ブラウザ向け）
  - 型定義ファイル(.d.ts)の出力設定
- **ステータス**: ⏳ 未着手

---

## Phase 1: Recorder 実装 🎙️

### ⏳ 1.1 基本構造の作成
- **ファイル**: `src/recorder/index.ts`, `src/recorder/KakiatoRecorder.ts`
- **内容**:
  - KakiatoRecorder クラスの骨組み
  - 初期化・開始・停止のAPI
  - セッションメタデータ生成
- **ステータス**: ⏳ 未着手

### ⏳ 1.2 キーボードイベント収集
- **ファイル**: `src/recorder/handlers/keyboard.ts`
- **内容**:
  - `keydown` / `keyup` イベントリスナー
  - `key`, `code`, `modifiers` の記録
  - カーソル位置の取得
- **ステータス**: ⏳ 未着手

### ⏳ 1.3 入力イベント収集
- **ファイル**: `src/recorder/handlers/input.ts`
- **内容**:
  - `beforeinput` / `input` イベントリスナー
  - `inputType`, `data` の記録
  - テキスト挿入・削除の追跡
- **ステータス**: ⏳ 未着手

### ⏳ 1.4 IME（Composition）イベント収集
- **ファイル**: `src/recorder/handlers/composition.ts`
- **内容**:
  - `compositionstart` / `compositionupdate` / `compositionend`
  - 日本語入力時のセグメント情報記録
  - 未確定文字列の追跡
- **ステータス**: ⏳ 未着手

### ⏳ 1.5 選択範囲変更イベント収集
- **ファイル**: `src/recorder/handlers/selection.ts`
- **内容**:
  - `selectionchange` イベントリスナー
  - `anchor` と `focus` 位置の記録
  - affinity の判定
- **ステータス**: ⏳ 未着手

### ⏳ 1.6 フォーカスイベント収集
- **ファイル**: `src/recorder/handlers/focus.ts`
- **内容**:
  - `focus` / `blur` イベントリスナー
  - 編集領域のアクティブ状態記録
- **ステータス**: ⏳ 未着手

### ⏳ 1.7 データエクスポート機能
- **ファイル**: `src/recorder/export.ts`
- **内容**:
  - JSON形式でのエクスポート（`.href.json`）
  - NDJSON形式でのエクスポート（`.href.jsonl`）
  - ダウンロード機能
- **ステータス**: ⏳ 未着手

---

## Phase 2: Player 実装 🎬

### ⏳ 2.1 基本構造の作成
- **ファイル**: `src/player/index.ts`, `src/player/KakiatoPlayer.ts`
- **内容**:
  - KakiatoPlayer クラスの骨組み
  - HREF ドキュメントの読み込み
  - 再生・一時停止・停止のAPI
- **ステータス**: ⏳ 未着手

### ⏳ 2.2 イベント再生エンジン
- **ファイル**: `src/player/engine.ts`
- **内容**:
  - タイムライン制御
  - イベントの順次実行
  - 再生速度調整（0.5x, 1x, 2x など）
  - シーク機能
- **ステータス**: ⏳ 未着手

### ⏳ 2.3 テキスト状態の再構築
- **ファイル**: `src/player/state.ts`
- **内容**:
  - 各イベントからテキスト状態を復元
  - カーソル位置・選択範囲の再現
  - IME入力の再現
- **ステータス**: ⏳ 未着手

### ⏳ 2.4 可視化UI（基本）
- **ファイル**: `src/player/ui/viewer.ts`
- **内容**:
  - テキスト表示領域
  - カーソル・選択範囲の描画
  - IME変換中の下線表示
- **ステータス**: ⏳ 未着手

### ⏳ 2.5 可視化UI（コントローラー）
- **ファイル**: `src/player/ui/controls.ts`
- **内容**:
  - 再生/一時停止ボタン
  - タイムラインスライダー
  - 速度調整UI
- **ステータス**: ⏳ 未着手

### ⏳ 2.6 解析機能
- **ファイル**: `src/player/analytics.ts`
- **内容**:
  - タイピング速度の計算
  - 修正回数の集計
  - 思考停止時間の検出
  - 統計情報の出力
- **ステータス**: ⏳ 未着手

---

## Phase 3: Examples & Demo 📚

### ⏳ 3.1 サンプルHREFデータ作成
- **ファイル**: `examples/sample-*.href.json`
- **内容**:
  - 英語入力のサンプル
  - 日本語入力のサンプル
  - 修正・削除を含むサンプル
- **ステータス**: ⏳ 未着手

### ⏳ 3.2 Recorder デモページ
- **ファイル**: `examples/recorder-demo.html`
- **内容**:
  - Recorder を使った記録デモ
  - 入力欄とエクスポートボタン
- **ステータス**: ⏳ 未着手

### ⏳ 3.3 Player デモページ
- **ファイル**: `examples/player-demo.html`
- **内容**:
  - サンプルデータの再生デモ
  - ファイルアップロード機能
- **ステータス**: ⏳ 未着手

### ⏳ 3.4 統合デモページ
- **ファイル**: `examples/index.html`
- **内容**:
  - Recorder と Player の両方を使用
  - 記録→再生のフロー体験
- **ステータス**: ⏳ 未着手

---

## Phase 4: ドキュメント & テスト 📝

### ⏳ 4.1 README.md 作成
- **内容**:
  - プロジェクト概要
  - インストール方法
  - 基本的な使い方
  - API リファレンス
- **ステータス**: ⏳ 未着手

### ⏳ 4.2 API ドキュメント
- **ファイル**: `docs/API.md`
- **内容**:
  - KakiatoRecorder API
  - KakiatoPlayer API
  - 型定義の説明
- **ステータス**: ⏳ 未着手

### ⏳ 4.3 ユニットテスト
- **ツール**: Vitest / Jest
- **内容**:
  - スキーマバリデーションテスト
  - イベントハンドラーのテスト
  - 再生エンジンのテスト
- **ステータス**: ⏳ 未着手

### ⏳ 4.4 E2Eテスト
- **ツール**: Playwright / Puppeteer
- **内容**:
  - ブラウザでの記録テスト
  - 再生テスト
- **ステータス**: ⏳ 未着手

---

## Phase 5: 拡張機能 🚀

### ⏳ 5.1 差分形式サポート
- **内容**:
  - 長時間記録時の効率的な保存
  - チャンク分割
- **ステータス**: ⏳ 未着手

### ⏳ 5.2 圧縮サポート
- **内容**:
  - gzip / brotli 圧縮
  - ストリーミング対応
- **ステータス**: ⏳ 未着手

### ⏳ 5.3 マルチ入力デバイス対応
- **内容**:
  - textarea, contenteditable のサポート
  - モバイルデバイス対応
- **ステータス**: ⏳ 未着手

### ⏳ 5.4 プラグインシステム
- **内容**:
  - カスタムイベントの拡張
  - 解析プラグイン
- **ステータス**: ⏳ 未着手

---

## 優先順位付き次のステップ

1. **タスク 0.2**: `package.json` と `tsconfig.json` の作成
2. **タスク 0.3**: ビルド環境の構築
3. **タスク 1.1**: Recorder の基本構造
4. **タスク 1.2-1.6**: 各種イベントハンドラー実装
5. **タスク 3.2**: Recorder デモページで動作確認
