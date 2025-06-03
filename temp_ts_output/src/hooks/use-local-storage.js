"use client";
import { useState, useEffect } from 'react';
// Helper function to safely get and parse value from localStorage
function getValueFromLocalStorage(key, defaultValue) {
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
            return Object.assign(Object.assign({}, defaultValue), parsedStoredValue);
        }
        // Otherwise, return the parsed value directly
        return parsedStoredValue;
    }
    catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
        return defaultValue;
    }
}
export function useLocalStorage(key, defaultValue) {
    const [value, setValue] = useState(() => {
        return getValueFromLocalStorage(key, defaultValue);
    });
    // Effect to update localStorage when 'value' changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                window.localStorage.setItem(key, JSON.stringify(value));
            }
            catch (error) {
                console.error(`Error setting localStorage key "${key}":`, error);
            }
        }
    }, [key, value]);
    // Effect to update state if localStorage changes in another tab/window
    useEffect(() => {
        if (typeof window === 'undefined')
            return;
        const handleStorageChange = (event) => {
            if (event.key === key && event.newValue !== null) {
                try {
                    const newValueFromStorage = JSON.parse(event.newValue);
                    // Similar merge logic as in getValueFromLocalStorage, if needed
                    if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue) &&
                        typeof newValueFromStorage === 'object' && newValueFromStorage !== null && !Array.isArray(newValueFromStorage)) {
                        setValue(Object.assign(Object.assign({}, defaultValue), newValueFromStorage));
                    }
                    else {
                        setValue(newValueFromStorage);
                    }
                }
                catch (error) {
                    console.error(`Error parsing updated localStorage key "${key}" from storage event:`, error);
                    // Optionally reset to defaultValue or current value if parsing fails
                    // setValue(defaultValue);
                }
            }
            else if (event.key === key && event.newValue === null) {
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
