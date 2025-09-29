import type { StorageKey, StorageType } from "../types/types";

const getStorage = (type: StorageType): Storage => {
  return type === "local" ? localStorage : sessionStorage;
};

export const setItem = <T>(type: StorageType, key: StorageKey, value: T): void => {
  const storage = getStorage(type);
  storage.setItem(key, JSON.stringify(value));
};

export const getItem = <T>(type: StorageType, key: StorageKey): T | null => {
  const storage = getStorage(type);
  const raw = storage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
};

export const updateItem = <T extends object>(
  type: StorageType,
  key: StorageKey,
  newValue: Partial<T>
): void => {
  const storage = getStorage(type);
  const current = getItem<T>(type, key);
  if (current && typeof current === "object") {
    const updated = { ...current, ...newValue };
    storage.setItem(key, JSON.stringify(updated));
  } else {
    storage.setItem(key, JSON.stringify(newValue));
  }
};

export const removeItem = (type: StorageType, key: StorageKey): void => {
  const storage = getStorage(type);
  storage.removeItem(key);
};

export const clearStorage = (type: StorageType): void => {
  const storage = getStorage(type);
  storage.clear();
};
