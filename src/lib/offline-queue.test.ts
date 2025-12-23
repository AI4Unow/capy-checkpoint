import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import {
  addToQueue,
  getQueue,
  removeFromQueue,
  clearQueue,
  getQueueCount,
  updateRetryCount,
  hasQueuedOperations,
  resetDBForTesting,
} from "./offline-queue";

describe("offline-queue", () => {
  beforeEach(async () => {
    // Delete and reset DB for fresh state each test
    await resetDBForTesting();
  });

  describe("addToQueue", () => {
    it("adds operation with generated id and timestamp", async () => {
      const id = await addToQueue({
        type: "learning",
        uid: "user-123",
        data: { eloRating: 1200 },
      });

      expect(id).toBeDefined();
      expect(typeof id).toBe("string");

      const queue = await getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe(id);
      expect(queue[0].type).toBe("learning");
      expect(queue[0].uid).toBe("user-123");
      expect(queue[0].data).toEqual({ eloRating: 1200 });
      expect(queue[0].timestamp).toBeGreaterThan(0);
      expect(queue[0].retries).toBe(0);
    });

    it("stores multiple operations", async () => {
      await addToQueue({ type: "learning", uid: "u1", data: { a: 1 } });
      await addToQueue({ type: "session", uid: "u1", data: { b: 2 } });
      await addToQueue({ type: "profile", uid: "u1", data: { c: 3 } });

      const queue = await getQueue();
      expect(queue).toHaveLength(3);

      // Verify all types are present
      const types = queue.map(q => q.type);
      expect(types).toContain("learning");
      expect(types).toContain("session");
      expect(types).toContain("profile");
    });

    it("applies LRU eviction when exceeding 100 items", async () => {
      // Add 100 items
      for (let i = 0; i < 100; i++) {
        await addToQueue({
          type: "learning",
          uid: "test",
          data: { index: i },
        });
      }

      // Verify we have 100
      expect(await getQueueCount()).toBe(100);

      // Add one more - should evict oldest
      await addToQueue({ type: "learning", uid: "test", data: { index: 100 } });

      // Still 100 (oldest evicted)
      expect(await getQueueCount()).toBe(100);

      // Last added should exist
      const queue = await getQueue();
      const lastItem = queue.find((op) => (op.data as { index: number }).index === 100);
      expect(lastItem).toBeDefined();
    });
  });

  describe("getQueue", () => {
    it("returns all operations added", async () => {
      const id1 = await addToQueue({ type: "learning", uid: "u1", data: { order: 1 } });
      const id2 = await addToQueue({ type: "session", uid: "u1", data: { order: 2 } });
      const id3 = await addToQueue({ type: "profile", uid: "u1", data: { order: 3 } });

      const queue = await getQueue();
      expect(queue).toHaveLength(3);

      // Verify all IDs are present (order may vary with same-ms timestamps)
      const ids = queue.map(q => q.id);
      expect(ids).toContain(id1);
      expect(ids).toContain(id2);
      expect(ids).toContain(id3);
    });

    it("returns empty array when queue is empty", async () => {
      const queue = await getQueue();
      expect(queue).toEqual([]);
    });
  });

  describe("removeFromQueue", () => {
    it("removes operation by ID", async () => {
      const id1 = await addToQueue({ type: "learning", uid: "u1", data: {} });
      const id2 = await addToQueue({ type: "session", uid: "u1", data: {} });

      await removeFromQueue(id1);

      const queue = await getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe(id2);
    });

    it("does nothing for non-existent ID", async () => {
      await addToQueue({ type: "learning", uid: "u1", data: {} });

      // Should not throw
      await removeFromQueue("non-existent-id");

      const queue = await getQueue();
      expect(queue).toHaveLength(1);
    });
  });

  describe("clearQueue", () => {
    it("removes all operations", async () => {
      await addToQueue({ type: "learning", uid: "u1", data: {} });
      await addToQueue({ type: "session", uid: "u1", data: {} });
      await addToQueue({ type: "profile", uid: "u1", data: {} });

      await clearQueue();

      expect(await getQueueCount()).toBe(0);
    });
  });

  describe("getQueueCount", () => {
    it("returns correct count", async () => {
      expect(await getQueueCount()).toBe(0);

      await addToQueue({ type: "learning", uid: "u1", data: {} });
      expect(await getQueueCount()).toBe(1);

      await addToQueue({ type: "session", uid: "u1", data: {} });
      expect(await getQueueCount()).toBe(2);
    });
  });

  describe("updateRetryCount", () => {
    it("increments retry count and returns true under limit", async () => {
      const id = await addToQueue({ type: "learning", uid: "u1", data: {} });

      let queue = await getQueue();
      expect(queue[0].retries).toBe(0);

      const result1 = await updateRetryCount(id);
      expect(result1).toBe(true);
      queue = await getQueue();
      expect(queue[0].retries).toBe(1);

      const result2 = await updateRetryCount(id);
      expect(result2).toBe(true);
      queue = await getQueue();
      expect(queue[0].retries).toBe(2);
    });

    it("discards operation after max retries exceeded", async () => {
      const id = await addToQueue({ type: "learning", uid: "u1", data: {} });

      // Retry 5 times (MAX_RETRIES = 5)
      for (let i = 0; i < 5; i++) {
        const result = await updateRetryCount(id);
        expect(result).toBe(true);
      }

      // 6th retry exceeds max, should discard and return false
      const result = await updateRetryCount(id);
      expect(result).toBe(false);

      // Operation should be removed
      const queue = await getQueue();
      expect(queue).toHaveLength(0);
    });

    it("returns false for non-existent ID", async () => {
      const result = await updateRetryCount("non-existent-id");
      expect(result).toBe(false);
    });
  });

  describe("hasQueuedOperations", () => {
    it("returns false when empty", async () => {
      expect(await hasQueuedOperations()).toBe(false);
    });

    it("returns true when has operations", async () => {
      await addToQueue({ type: "learning", uid: "u1", data: {} });
      expect(await hasQueuedOperations()).toBe(true);
    });
  });
});
