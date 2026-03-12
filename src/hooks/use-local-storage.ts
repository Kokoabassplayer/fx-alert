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
    const parsedStoredValue = JSON.parse(storedValue);

    if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue) &&
        typeof parsedStoredValue === 'object' && parsedStoredValue !== null && !Array.isArray(parsedStoredValue)) {
      return { ...defaultValue, ...parsedStoredValue } as T;
    }

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
  const [value, setValue] = useState<T>(defaultValue);
  const initializedRef = useRef(false);

  // Read from localStorage on mount (runs once per component mount)
  useEffect(() => {
    if (typeof window === 'undefined' || initializedRef.current) return;

    const storedValue = getValueFromLocalStorage(key, defaultValue);
    setValue(storedValue);
    initializedRef.current = true;
  }, [key]);

  // Write to localStorage when value changes (only after initialization)
  useEffect(() => {
    if (typeof window === 'undefined' || !initializedRef.current) return;

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  // Cross-tab synchronization
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          const newValueFromStorage = JSON.parse(event.newValue);
           if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue) &&
               typeof newValueFromStorage === 'object' && newValueFromStorage !== null && !Array.isArray(newValueFromStorage)) {
            setValue({ ...defaultValue, ...newValueFromStorage } as T);
           } else {
            setValue(newValueFromStorage as T);
           }
        } catch (error) {
          console.error(`Error parsing updated localStorage key "${key}" from storage event:`, error);
        }
      } else if (event.key === key && event.newValue === null) {
        setValue(defaultValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, defaultValue]);

  return [value, setValue];
}
