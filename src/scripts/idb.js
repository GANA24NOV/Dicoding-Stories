// src/scripts/idb.js
import { openDB } from 'idb';

const dbPromise = openDB('story-db', 1, {
  upgrade(db) {
    db.createObjectStore('offline-stories', { keyPath: 'id' });
  },
});

export const saveStory = async (story) => (await dbPromise).put('offline-stories', story);
export const getAllStories = async () => (await dbPromise).getAll('offline-stories');
export const deleteStory = async (id) => (await dbPromise).delete('offline-stories', id);
export const getStoryById = async (id) => (await dbPromise).get('offline-stories', id);
