import React, { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiGrid, FiList } from 'react-icons/fi';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import NoteList from '../components/notes/NoteList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNotes } from '../context/NoteContext';
import { notesApi } from '../api/notes';
import toast from 'react-hot-toast';

const SharedWithMePage = () => {
  const { refreshNotes } = useNotes();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  const loadShared = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notesApi.getSharedWithMe();
      setNotes(res.data.data || []);
    } catch {
      toast.error('Failed to load shared notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadShared(); }, [loadShared]);

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-heading font-bold text-dark-text flex items-center gap-2">
                  <FiUsers className="text-primary-400" />
                  Shared with Me
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  {loading ? 'Loading...' : `${notes.length} shared note${notes.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <div className="flex items-center bg-dark-surface border border-dark-border rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <FiGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <FiList size={16} />
                </button>
              </div>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary-500 bg-opacity-10 flex items-center justify-center mb-4">
                  <FiUsers className="text-primary-400" size={36} />
                </div>
                <h3 className="text-xl font-heading font-semibold text-dark-text mb-2">No shared notes</h3>
                <p className="text-gray-400 text-sm">
                  Notes shared with you by other users will appear here.
                </p>
              </div>
            ) : (
              <NoteList notes={notes} onRefresh={loadShared} viewMode={viewMode} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SharedWithMePage;
