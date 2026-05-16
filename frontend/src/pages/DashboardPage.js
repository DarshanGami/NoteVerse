import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGrid, FiList, FiPlus, FiFilter, FiTag } from 'react-icons/fi';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import NoteList from '../components/notes/NoteList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TagPill from '../components/common/TagPill';
import { useNotes } from '../context/NoteContext';
import { notesApi } from '../api/notes';
import toast from 'react-hot-toast';

const filterOptions = [
  { label: 'All Notes', value: 'all' },
  { label: 'Pinned', value: 'pinned' },
  { label: 'Favourites', value: 'favourites' },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const { notes, folders, tags, selectedFolder, setSelectedFolder, refreshNotes, refreshTags } = useNotes();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [selectedTag, setSelectedTag] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = { size: 100 };
      if (selectedFolder) params.folderId = selectedFolder.id;
      if (filter === 'pinned') params.isPinned = true;
      if (filter === 'favourites') params.isFavourite = true;
      if (selectedTag) params.tagId = selectedTag.id;
      await refreshNotes(params);
    } finally {
      setLoading(false);
    }
  }, [selectedFolder, filter, selectedTag, refreshNotes]);

  useEffect(() => { refreshTags(); }, [refreshTags]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleCreateNote = async () => {
    try {
      const res = await notesApi.createNote({
        title: 'Untitled Note',
        content: '',
        folderId: selectedFolder?.id || null,
      });
      const noteId = res.data.data?.id;
      if (noteId) navigate(`/notes/${noteId}`);
    } catch (e) {
      toast.error('Failed to create note');
    }
  };

  const getPageTitle = () => {
    if (selectedFolder) return selectedFolder.name;
    if (filter === 'pinned') return 'Pinned Notes';
    if (filter === 'favourites') return 'Favourite Notes';
    if (selectedTag) return `#${selectedTag.name}`;
    return 'All Notes';
  };

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-heading font-bold text-dark-text">{getPageTitle()}</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  {loading ? 'Loading...' : `${notes.length} note${notes.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* View toggle */}
                <div className="flex items-center bg-dark-surface border border-dark-border rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    title="Grid view"
                  >
                    <FiGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    title="List view"
                  >
                    <FiList size={16} />
                  </button>
                </div>

                <button
                  onClick={handleCreateNote}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <FiPlus size={16} />
                  New Note
                </button>
              </div>
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {/* Status filters */}
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setFilter(opt.value); setSelectedTag(null); setSelectedFolder(null); }}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors
                    ${filter === opt.value && !selectedFolder && !selectedTag
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-surface border border-dark-border text-gray-400 hover:text-white hover:border-gray-500'
                    }`}
                >
                  {opt.label}
                </button>
              ))}

              {/* Folder filter */}
              {selectedFolder && (
                <button
                  onClick={() => setSelectedFolder(null)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-primary-500 text-white font-medium"
                >
                  {selectedFolder.name}
                  <span className="ml-1 opacity-70">×</span>
                </button>
              )}

              {/* Tag filters */}
              {tags.slice(0, 8).map((tag) => (
                <TagPill
                  key={tag.id}
                  tag={tag}
                  size="sm"
                  onClick={() => {
                    setSelectedTag(selectedTag?.id === tag.id ? null : tag);
                    setFilter('all');
                    setSelectedFolder(null);
                  }}
                  style={selectedTag?.id === tag.id ? { opacity: 1, outline: `2px solid ${tag.color || '#6C63FF'}` } : {}}
                />
              ))}
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-xs text-gray-500 hover:text-white px-2 py-1"
                >
                  Clear tag ×
                </button>
              )}
            </div>

            {/* Notes */}
            {loading ? (
              <LoadingSpinner />
            ) : (
              <NoteList notes={notes} onRefresh={loadNotes} viewMode={viewMode} />
            )}
          </div>
        </main>
      </div>

      {/* Floating action button (mobile) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCreateNote}
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 rounded-full bg-primary-500 text-white shadow-xl
          flex items-center justify-center z-30"
      >
        <FiPlus size={24} />
      </motion.button>
    </div>
  );
};

export default DashboardPage;
