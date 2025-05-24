import {
  cn,
  formatDate,
  formatRelativeDate,
  formatCurrency,
  formatCompactNumber,
  truncate,
  generateId,
  getFileExtension,
  getFileTypeCategory,
  formatFileSize,
  calculateProgress,
  getInitials,
  isValidEmail,
} from '../index';

describe('Utility Functions', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
      expect(cn('bg-red-500', { 'text-white': true })).toBe('bg-red-500 text-white');
      expect(cn('bg-red-500', { 'text-white': false })).toBe('bg-red-500');
    });

    it('should handle tailwind class conflicts', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
      expect(cn('p-4', 'p-2')).toBe('p-2');
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2024-05-24');

    it('should format date in short format', () => {
      expect(formatDate(testDate, 'short')).toBe('May 24, 2024');
    });

    it('should format date in long format', () => {
      expect(formatDate(testDate, 'long')).toBe('May 24, 2024');
    });

    it('should handle string dates', () => {
      expect(formatDate('2024-05-24', 'short')).toBe('May 24, 2024');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(1000)).toBe('$1,000.00');
    });

    it('should format other currencies', () => {
      expect(formatCurrency(1234.56, 'EUR')).toContain('1,234.56');
    });
  });

  describe('formatCompactNumber', () => {
    it('should format large numbers compactly', () => {
      expect(formatCompactNumber(1500)).toBe('1.5K');
      expect(formatCompactNumber(2300000)).toBe('2.3M');
      expect(formatCompactNumber(999)).toBe('999');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('This is a long string', 10)).toBe('This is a ...');
      expect(truncate('Short', 10)).toBe('Short');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extensions correctly', () => {
      expect(getFileExtension('file.mp3')).toBe('mp3');
      expect(getFileExtension('document.pdf')).toBe('pdf');
      expect(getFileExtension('image.jpeg')).toBe('jpeg');
      expect(getFileExtension('noextension')).toBe('');
    });
  });

  describe('getFileTypeCategory', () => {
    it('should categorize files correctly', () => {
      expect(getFileTypeCategory('song.mp3')).toBe('audio');
      expect(getFileTypeCategory('video.mp4')).toBe('video');
      expect(getFileTypeCategory('photo.jpg')).toBe('image');
      expect(getFileTypeCategory('contract.pdf')).toBe('document');
      expect(getFileTypeCategory('data.xml')).toBe('other');
    });
  });

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress percentage correctly', () => {
      expect(calculateProgress(5, 10)).toBe(50);
      expect(calculateProgress(3, 4)).toBe(75);
      expect(calculateProgress(10, 10)).toBe(100);
      expect(calculateProgress(0, 10)).toBe(0);
      expect(calculateProgress(5, 0)).toBe(0);
    });
  });

  describe('getInitials', () => {
    it('should extract initials correctly', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('Alice')).toBe('A');
      expect(getInitials('Bob James Smith')).toBe('BJ');
    });
  });

  describe('isValidEmail', () => {
    it('should validate email addresses correctly', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('invalid.email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });
  });
});