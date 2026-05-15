import React from 'react';
import { motion } from 'framer-motion';
import { FiFileText } from 'react-icons/fi';
import NoteCard from './NoteCard';

const NoteList = ({ notes, onRefresh, viewMode = 'grid' }) => {
  if (!notes || notes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-primary-500 bg-opacity-10 flex items-center justify-center mb-4">
          <FiFileText className="text-primary-400" size={36} />
        </div>
        <h3 className="text-xl font-heading font-semibold text-dark-text mb-2">No notes yet</h3>
        <p className="text-gray-400 text-sm max-w-xs">
          Click the "New Note" button to create your first note.
        </p>
      </motion.div>
    );
  }

  // Separate pinned notes
  const pinnedNotes = notes.filter((n) => n.isPinned);
  const unpinnedNotes = notes.filter((n) => !n.isPinned);

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {pinnedNotes.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Pinned</p>
            <div className="space-y-2">
              {pinnedNotes.map((note) => (
                <NoteCard key={note.id} note={note} onRefresh={onRefresh} viewMode="list" />
              ))}
            </div>
            {unpinnedNotes.length > 0 && (
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2 px-1">Other Notes</p>
            )}
          </div>
        )}
        <div className="space-y-2">
          {unpinnedNotes.map((note) => (
            <NoteCard key={note.id} note={note} onRefresh={onRefresh} viewMode="list" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {pinnedNotes.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Pinned</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pinnedNotes.map((note) => (
              <NoteCard key={note.id} note={note} onRefresh={onRefresh} viewMode="grid" />
            ))}
          </div>
        </div>
      )}
      {unpinnedNotes.length > 0 && (
        <div>
          {pinnedNotes.length > 0 && (
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Other Notes</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {unpinnedNotes.map((note) => (
              <NoteCard key={note.id} note={note} onRefresh={onRefresh} viewMode="grid" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteList;
