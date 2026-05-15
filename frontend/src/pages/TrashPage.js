import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrash2, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { notesApi } from '../api/notes';
import { formatDate, stripHtml, truncate } from '../utils/helpers';
import toast from 'react-hot-toast';

const TrashPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTrash = async () => {
    setLoading(true);
    try {
      const res = await notesApi.getTrash();
      setNotes(res.data.data || []);
    } catch {
      toast.error('Failed to load trash');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTrash(); }, []);

  const handleRestore = async (noteId) => {
    try {
      await notesApi.restoreNote(noteId);
      await loadTrash();
      toast.success('Note restored');
    } catch { toast.error('Failed to restore note'); }
  };

  const handlePermanentDelete = async (noteId) => {
    if (!window.confirm('Permanently delete this note? This cannot be undone.')) return;
    try {
      await notesApi.permanentDelete(noteId);
      await loadTrash();
      toast.success('Note permanently deleted');
    } catch { toast.error('Failed to delete note'); }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm('Empty trash? All notes will be permanently deleted.')) return;
    try {
      await Promise.all(notes.map((n) => notesApi.permanentDelete(n.id)));
      setNotes([]);
      toast.success('Trash emptied');
    } catch { toast.error('Failed to empty trash'); }
  };

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-heading font-bold text-dark-text flex items-center gap-2">
                  <FiTrash2 className="text-red-400" />
                  Trash
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  {loading ? 'Loading...' : `${notes.length} deleted note${notes.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              {notes.length > 0 && (
                <Button variant="danger" size="sm" onClick={handleEmptyTrash}>
                  Empty Trash
                </Button>
              )}
            </div>

            {/* Warning */}
            {!loading && notes.length > 0 && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 mb-6">
                <FiAlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={18} />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Notes in trash are permanently deleted after 30 days.
                </p>
              </div>
            )}

            {loading ? (
              <LoadingSpinner />
            ) : notes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-red-500 bg-opacity-10 flex items-center justify-center mb-4">
                  <FiTrash2 className="text-red-400" size={36} />
                </div>
                <h3 className="text-xl font-heading font-semibold text-dark-text mb-2">Trash is empty</h3>
                <p className="text-gray-400 text-sm">Deleted notes will appear here.</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-dark-surface border border-dark-border"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-dark-text truncate">{note.title || 'Untitled'}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                        {truncate(stripHtml(note.content || ''), 120)}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">Deleted {formatDate(note.updatedAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(note.id)}
                        className="flex items-center gap-1.5"
                      >
                        <FiRefreshCw size={13} />
                        Restore
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handlePermanentDelete(note.id)}
                      >
                        <FiTrash2 size={13} />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TrashPage;
