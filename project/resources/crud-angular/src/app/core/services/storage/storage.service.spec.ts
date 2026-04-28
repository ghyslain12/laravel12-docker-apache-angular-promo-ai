import { TestBed } from '@angular/core/testing';
import { StorageService, StorageType } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService]
    });
    service = TestBed.inject(StorageService);

    // On vide les storages avant chaque test
    localStorage.clear();
    sessionStorage.clear();

    // On espionne console.error pour ne pas polluer les logs de test en cas d'erreur simulée
    spyOn(console, 'error');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setItem', () => {
    it('should save an item in SessionStorage by default', () => {
      const data = { id: 1, name: 'test' };
      service.setItem('myKey', data);

      const stored = sessionStorage.getItem('myKey');
      expect(stored).toBe(JSON.stringify(data));
    });

    it('should save an item in LocalStorage when specified', () => {
      service.setItem('localKey', 'value', StorageType.LOCAL);
      expect(localStorage.getItem('localKey')).toBe(JSON.stringify('value'));
    });

    it('should handle circular references or errors during stringify', () => {
      const circular: any = {};
      circular.self = circular; // Création d'une erreur JSON.stringify

      service.setItem('error', circular);
      expect(console.error).toHaveBeenCalledWith('Error saving to storage', jasmine.any(TypeError));
    });
  });

  describe('getItem', () => {
    it('should return null if item does not exist', () => {
      const result = service.getItem('ghost');
      expect(result).toBeNull();
    });

    it('should return parsed JSON object', () => {
      const data = { user: 'admin' };
      sessionStorage.setItem('user', JSON.stringify(data));

      const result = service.getItem<{user: string}>('user');
      expect(result).toEqual(data);
    });

    it('should return raw string if parsing fails', () => {
      const rawString = 'just a string';
      sessionStorage.setItem('raw', rawString);

      const result = service.getItem<string>('raw');
      expect(result).toBe(rawString);
    });

    it('should handle storage access errors', () => {
      // Simulation d'une erreur d'accès au storage (ex: quota dépassé ou restriction navigateur)
      spyOn(Storage.prototype, 'getItem').and.throwError('Security Error');

      const result = service.getItem('any');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('should remove item from specific storage', () => {
      sessionStorage.setItem('key', 'val');
      service.removeItem('key');
      expect(sessionStorage.getItem('key')).toBeNull();
    });

    it('should handle errors during removal', () => {
      spyOn(Storage.prototype, 'removeItem').and.throwError('Locked');
      service.removeItem('key');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear only the specified storage', () => {
      localStorage.setItem('l', '1');
      sessionStorage.setItem('s', '1');

      service.clear(StorageType.SESSION);

      expect(sessionStorage.length).toBe(0);
      expect(localStorage.length).toBe(1);
    });

    it('should handle errors during clear', () => {
      spyOn(Storage.prototype, 'clear').and.throwError('Fatal');
      service.clear();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
