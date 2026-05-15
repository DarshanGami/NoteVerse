import React, { createContext, useContext, useState, useCallback } from 'react';
import { notesApi } from '../api/notes';
import { foldersApi } from '../api/folders';
import { tagsApi } from '../api/tags';

const NoteContext = createContext(null);

export const NoteProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);

  const refreshNotes = useCallback(async (params = {}) => {
    try {
      const res = await notesApi.getNotes(params);
      setNotes(res.data.data?.content || res.data.data || []);
    } catch (e) {
      console.error('Failed to refresh notes:', e);
    }
  }, []);

  const refreshFolders = useCallback(async () => {
    try {
      const res = await foldersApi.getFolders();
      setFolders(res.data.data || []);
    } catch (e) {
      console.error('Failed to refresh folders:', e);
    }
  }, []);

  const refreshTags = useCallback(async () => {
    try {
      const res = await tagsApi.getTags();
      setTags(res.data.data || []);
    } catch (e) {
      console.error('Failed to refresh tags:', e);
    }
  }, []);

  return (
    <NoteContext.Provider value={{
      notes,
      folders,
      tags,
      selectedNote,
      selectedFolder,
      setSelectedNote,
      setSelectedFolder,
      refreshNotes,
      refreshFolders,
      refreshTags,
      setNotes,
      setFolders,
      setTags,
    }}>
      {children}
    </NoteContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (!context) throw new Error('useNotes must be used within NoteProvider');
  return context;
};
