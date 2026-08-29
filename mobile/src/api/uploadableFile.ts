import { File } from 'expo-file-system';

/**
 * Wrap a locally picked asset (e.g. from expo-image-picker) as a real Blob-like
 * object for upload.
 *
 * Expo's fetch (the global `fetch` since SDK 51+) only accepts a genuine `Blob`
 * or an object exposing `.bytes()` in a FormData part — it doesn't understand
 * React Native's classic `{ uri, name, type }` shorthand, and throws
 * "Unsupported FormDataPart implementation" if you pass one. expo-file-system's
 * `File` implements the Blob interface over a local URI, so it's a drop-in fix.
 */
export function toUploadableFile(uri: string): File {
  return new File(uri);
}
