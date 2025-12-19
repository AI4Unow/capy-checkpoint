import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchQuestions } from './questionsService';
import * as firebase from './firebase';
import { getDocs, collection } from 'firebase/firestore';

// Mock firebase
vi.mock('./firebase', () => ({
  getFirebaseDb: vi.fn(),
  isFirebaseConfigured: vi.fn(),
}));

// Mock firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  increment: vi.fn(),
}));

describe('questionsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchQuestions', () => {
    it('should fetch questions from Firestore when configured', async () => {
      // Setup
      vi.mocked(firebase.isFirebaseConfigured).mockReturnValue(true);
      vi.mocked(firebase.getFirebaseDb).mockReturnValue({} as any);
      
      const mockQuestions = [
        { id: '1', text: 'Q1', topic: 'number', difficulty: 800 },
        { id: '2', text: 'Q2', topic: 'geometry', difficulty: 900 },
      ];

      const mockSnapshot = {
        forEach: (callback: any) => {
          mockQuestions.forEach(q => callback({ data: () => q }));
        },
        length: mockQuestions.length
      };

      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);
      vi.mocked(collection).mockReturnValue({} as any);

      // Execute
      const result = await fetchQuestions();

      // Verify
      expect(firebase.isFirebaseConfigured).toHaveBeenCalled();
      expect(getDocs).toHaveBeenCalled();
      expect(result).toEqual(mockQuestions);
    });

    it('should filter questions by topic', async () => {
      // Setup
      vi.mocked(firebase.isFirebaseConfigured).mockReturnValue(true);
      
      const mockQuestions = [
        { id: '1', text: 'Q1', topic: 'number', difficulty: 800 },
        { id: '2', text: 'Q2', topic: 'geometry', difficulty: 900 },
      ];

      const mockSnapshot = {
        forEach: (callback: any) => {
          mockQuestions.forEach(q => callback({ data: () => q }));
        },
        length: mockQuestions.length
      };

      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      const { fetchQuestionsByTopic } = await import('./questionsService');
      
      // Execute
      const result = await fetchQuestionsByTopic('number');

      // Verify
      expect(result).toEqual([mockQuestions[0]]);
    });
  });
});
