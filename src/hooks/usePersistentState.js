import { useEffect, useRef, useState } from 'react';
import { storage } from '../lib/storage.js';

/**
 * useState mirrored to safe storage. Initial value is read once on mount.
 * Writes are debounced via a microtask coalesce to avoid hammering storage.
 */
export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    const SENTINEL = '__missing__';
    const stored = storage.get(key, SENTINEL);
    if (stored === SENTINEL || stored === null || stored === undefined) {
      return typeof initial === 'function' ? initial() : initial;
    }
    return stored;
  });

  const pendingRef = useRef(false);
  useEffect(() => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    queueMicrotask(() => {
      pendingRef.current = false;
      storage.set(key, value);
    });
  }, [key, value]);

  return [value, setValue];
}
