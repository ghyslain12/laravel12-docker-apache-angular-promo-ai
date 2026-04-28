import { Injectable } from '@angular/core';

export enum StorageType {
  LOCAL = 'localStorage',
  SESSION = 'sessionStorage'
}

@Injectable({ providedIn: 'root' })
export class StorageService {

  setItem(key: string, value: any, type: StorageType = StorageType.SESSION): void {
    try {
      const storage = type === StorageType.LOCAL ? localStorage : sessionStorage;
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to storage', error);
    }
  }

  getItem<T>(key: string, type: StorageType = StorageType.SESSION): T | null {
    try {
      const storage = type === StorageType.LOCAL ? localStorage : sessionStorage;
      const item = storage.getItem(key);
      if (!item) return null;

      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    } catch (error) {
      console.error('Error reading from storage', error);
      return null;
    }
  }

  removeItem(key: string, type: StorageType = StorageType.SESSION): void {
    try {
      const storage = type === StorageType.LOCAL ? localStorage : sessionStorage;
      storage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage', error);
    }
  }

  clear(type: StorageType = StorageType.SESSION): void {
    try {
      const storage = type === StorageType.LOCAL ? localStorage : sessionStorage;
      storage.clear();
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  }
}
