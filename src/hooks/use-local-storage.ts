
"use client";

import type { Dispatch, SetStateAction} from 'react';
import { useState, useEffect, useRef } from 'react';

// Helper function to safely get and parse value from localStorage
function getValueFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const storedValue = window.localStorage.getItem(key);
    if (storedValue === null) {
      return defaultValue;
    }
    // Parse the stored JSON
    const parsedStoredValue = JSON.parse(storedValue);

    // If both defaultValue and parsedStoredValue are objects (but not arrays), merge them
    // This ensures that new keys in defaultValue are included if not present in storedValue
    if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue) &&
        typeof parsedStoredValue === 'object' && parsedStoredValue !== null && !Array.isArray(parsedStoredValue)) {
      return { ...defaultValue, ...parsedStoredValue } as T;
    }

    // Otherwise, return the parsed value directly
    return parsedStoredValue as T;
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>] {
  // Initialize with defaultValue to avoid SSR/client hydration mismatch
  // The localStorage value will be synced in useEffect on mount
  const [value, setValue] = useState<T>(defaultValue);
  const mountedRef = useRef(false);

  // First effect: read from localStorage on mount (runs once)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!mountedRef.current) {
      const storedValue = getValueFromLocalStorage(key, defaultValue);
      setValue(storedValue);
      mountedRef.current = true;
    }
  }, [key]); // Only re-run if key changes

  // Second effect: write to localStorage when value changes (only after mount)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Only write after we've mounted and loaded initial value
    if (mountedRef.current) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    }
  }, [key, value]);
  
  // Effect to update state if localStorage changes in another tab/window
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          const newValueFromStorage = JSON.parse(event.newValue);
           // Similar merge logic as in getValueFromLocalStorage, if needed
           if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue) &&
               typeof newValueFromStorage === 'object' && newValueFromStorage !== null && !Array.isArray(newValueFromStorage)) {
            setValue({ ...defaultValue, ...newValueFromStorage } as T);
           } else {
            setValue(newValueFromStorage as T);
           }
        } catch (error) {
          console.error(`Error parsing updated localStorage key "${key}" from storage event:`, error);
           // Optionally reset to defaultValue or current value if parsing fails
           // setValue(defaultValue); 
        }
      } else if (event.key === key && event.newValue === null) {
        // Key was removed from localStorage, reset to default
        setValue(defaultValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, defaultValue]); // Include defaultValue in dependencies if its structure can change

  return [value, setValue];
}

