// Archivo: /home/ubuntu/artistrm-360-github/src/lib/zeus/__tests__/dataConnectors.test.js

import { 
  getArtistProfile, 
  getArtistEvents, 
  getArtistReleases,
  getSocialMetrics,
  getStreamingStats,
  getArtistSummary
} from '../dataConnectors';
import { db } from '@/lib/firebase/config';

// Mock de Firebase Firestore
jest.mock('@/lib/firebase/config', () => ({
  db: {
    collection: jest.fn(),
  }
}));

// Mock de funciones de Firestore
const mockCollection = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();
const mockGetDocs = jest.fn();
const mockDoc = jest.fn();
const mockGetDoc = jest.fn();

// Configuración de mocks
jest.mock('firebase/firestore', () => ({
  collection: (...args) => {
    mockCollection(...args);
    return 'collection-ref';
  },
  query: (...args) => {
    mockQuery(...args);
    return 'query-ref';
  },
  where: (...args) => {
    mockWhere(...args);
    return 'where-constraint';
  },
  orderBy: (...args) => {
    mockOrderBy(...args);
    return 'order-constraint';
  },
  limit: (...args) => {
    mockLimit(...args);
    return 'limit-constraint';
  },
  getDocs: async (...args) => {
    mockGetDocs(...args);
    return {
      forEach: (callback) => {
        mockData.forEach((item, index) => {
          callback({
            id: `doc-${index}`,
            data: () => item
          });
        });
      }
    };
  },
  doc: (...args) => {
    mockDoc(...args);
    return 'doc-ref';
  },
  getDoc: async (...args) => {
    mockGetDoc(...args);
    return {
      exists: () => mockDocExists,
      data: () => mockDocData
    };
  }
}));

// Datos de prueba
let mockData = [];
let mockDocExists = true;
let mockDocData = {};

describe('Data Connectors', () => {
  beforeEach(() => {
    // Reiniciar mocks
    jest.clearAllMocks();
    mockData = [];
    mockDocExists = true;
    mockDocData = {};
  });

  describe('getArtistProfile', () => {
    it('debe obtener el perfil del artista correctamente', async () => {
      // Configurar mock
      mockDocExists = true;
      mockDocData = {
        displayName: 'Test Artist',
        email: 'test@example.com',
        profileImage: 'https://example.com/image.jpg'
      };

      // Ejecutar función
      const result = await getArtistProfile('test-user-id');

      // Verificar resultado
      expect(mockDoc).toHaveBeenCalledWith(db, 'users', 'test-user-id');
      expect(mockGetDoc).toHaveBeenCalled();
      expect(result).toEqual(mockDocData);
    });

    it('debe lanzar error si el perfil no existe', async () => {
      // Configurar mock
      mockDocExists = false;

      // Verificar que lanza error
      await expect(getArtistProfile('test-user-id')).rejects.toThrow('Perfil de artista no encontrado');
    });
  });

  describe('getArtistEvents', () => {
    it('debe obtener eventos pasados y futuros correctamente', async () => {
      // Configurar mock para eventos pasados
      const pastEvents = [
        { userId: 'test-user-id', name: 'Past Event 1', date: new Date('2023-01-15') },
        { userId: 'test-user-id', name: 'Past Event 2', date: new Date('2023-02-20') }
      ];

      // Configurar mock para eventos futuros
      const futureEvents = [
        { userId: 'test-user-id', name: 'Future Event 1', date: new Date('2025-06-15') },
        { userId: 'test-user-id', name: 'Future Event 2', date: new Date('2025-07-20') }
      ];

      // Configurar comportamiento del mock
      mockGetDocs.mockImplementationOnce(async () => ({
        forEach: (callback) => {
          pastEvents.forEach((item, index) => {
            callback({
              id: `past-${index}`,
              data: () => item
            });
          });
        }
      })).mockImplementationOnce(async () => ({
        forEach: (callback) => {
          futureEvents.forEach((item, index) => {
            callback({
              id: `future-${index}`,
              data: () => item
            });
          });
        }
      }));

      // Ejecutar función
      const result = await getArtistEvents('test-user-id');

      // Verificar resultado
      expect(mockCollection).toHaveBeenCalledWith(db, 'events');
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'test-user-id');
      expect(result.past.length).toBe(2);
      expect(result.upcoming.length).toBe(2);
      expect(result.past[0].name).toBe('Past Event 1');
      expect(result.upcoming[0].name).toBe('Future Event 1');
    });
  });

  describe('getArtistReleases', () => {
    it('debe obtener lanzamientos correctamente', async () => {
      // Configurar mock
      mockData = [
        { userId: 'test-user-id', title: 'Album 1', releaseDate: new Date('2023-01-15') },
        { userId: 'test-user-id', title: 'Single 1', releaseDate: new Date('2023-03-20') }
      ];

      // Ejecutar función
      const result = await getArtistReleases('test-user-id');

      // Verificar resultado
      expect(mockCollection).toHaveBeenCalledWith(db, 'releases');
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'test-user-id');
      expect(mockOrderBy).toHaveBeenCalledWith('releaseDate', 'desc');
      expect(result.length).toBe(2);
      expect(result[0].title).toBe('Album 1');
      expect(result[1].title).toBe('Single 1');
    });
  });

  describe('getSocialMetrics', () => {
    it('debe obtener métricas sociales correctamente', async () => {
      // Configurar mock
      mockData = [
        { userId: 'test-user-id', platform: 'instagram', followers: 1000, engagement: 100, date: new Date('2023-01-15') },
        { userId: 'test-user-id', platform: 'instagram', followers: 1200, engagement: 120, date: new Date('2023-02-15') },
        { userId: 'test-user-id', platform: 'spotify', followers: 500, engagement: 50, date: new Date('2023-01-15') },
        { userId: 'test-user-id', platform: 'spotify', followers: 600, engagement: 60, date: new Date('2023-02-15') }
      ];

      // Ejecutar función
      const result = await getSocialMetrics('test-user-id');

      // Verificar resultado
      expect(mockCollection).toHaveBeenCalledWith(db, 'social_metrics');
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'test-user-id');
      expect(result.raw.instagram.length).toBe(2);
      expect(result.raw.spotify.length).toBe(2);
      expect(result.trends.instagram.followers.change).toBe(200);
      expect(result.trends.spotify.followers.change).toBe(100);
    });
  });

  describe('getStreamingStats', () => {
    it('debe obtener estadísticas de streaming correctamente', async () => {
      // Configurar mock
      mockData = [
        { userId: 'test-user-id', platform: 'spotify', streams: 10000, revenue: 50, date: new Date('2023-01-15') },
        { userId: 'test-user-id', platform: 'spotify', streams: 12000, revenue: 60, date: new Date('2023-02-15') },
        { userId: 'test-user-id', platform: 'appleMusic', streams: 5000, revenue: 30, date: new Date('2023-01-15') },
        { userId: 'test-user-id', platform: 'appleMusic', streams: 6000, revenue: 36, date: new Date('2023-02-15') }
      ];

      // Ejecutar función
      const result = await getStreamingStats('test-user-id');

      // Verificar resultado
      expect(mockCollection).toHaveBeenCalledWith(db, 'streaming_stats');
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'test-user-id');
      expect(result.raw.spotify.length).toBe(2);
      expect(result.raw.appleMusic.length).toBe(2);
      expect(result.summary.spotify.totalStreams).toBe(22000);
      expect(result.summary.appleMusic.totalStreams).toBe(11000);
      expect(result.overall.totalStreams).toBe(33000);
      expect(result.overall.totalRevenue).toBe(176);
    });
  });

  describe('getArtistSummary', () => {
    it('debe obtener resumen completo del artista correctamente', async () => {
      // Configurar mocks para cada función
      const mockProfile = { displayName: 'Test Artist', email: 'test@example.com' };
      const mockEvents = { past: [{ name: 'Past Event' }], upcoming: [{ name: 'Future Event' }] };
      const mockReleases = [{ title: 'Album 1' }];
      const mockSocialMetrics = { raw: { instagram: [] }, trends: {} };
      const mockStreamingStats = { raw: { spotify: [] }, summary: {}, overall: {} };

      // Mock de implementaciones
      jest.spyOn(global, 'getArtistProfile').mockResolvedValue(mockProfile);
      jest.spyOn(global, 'getArtistEvents').mockResolvedValue(mockEvents);
      jest.spyOn(global, 'getArtistReleases').mockResolvedValue(mockReleases);
      jest.spyOn(global, 'getSocialMetrics').mockResolvedValue(mockSocialMetrics);
      jest.spyOn(global, 'getStreamingStats').mockResolvedValue(mockStreamingStats);

      // Ejecutar función
      const result = await getArtistSummary('test-user-id');

      // Verificar resultado
      expect(result.profile).toEqual(mockProfile);
      expect(result.events).toEqual(mockEvents);
      expect(result.releases).toEqual(mockReleases);
      expect(result.socialMetrics).toEqual(mockSocialMetrics);
      expect(result.streamingStats).toEqual(mockStreamingStats);
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });
});
