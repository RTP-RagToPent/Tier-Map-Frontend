/**
 * Google Maps JavaScript API の型定義拡張
 */

declare global {
  interface Window {
    google?: typeof google;
  }
}

export {};
