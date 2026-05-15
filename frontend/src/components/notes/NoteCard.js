import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiMoreVertical, FiEdit3, FiTrash2, FiHeart, FiBookmark,
  FiShare2, FiLock, FiStar, FiMapPin,
} from 'react-icons/fi';
import { notesApi } from '../../api/notes';
import { formatRelative, stripHtml, truncate } from '../../utils/helpers';
import TagPill from '../common/TagPill';
import toast from 'react-hot-toast';

const NoteCard = ({ note, onRefresh, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTogglePin = async (e) => {
    e.stopPropagation();
    try {
      await notesApi.togglePin(note.id);
      onRefresh?.();
      toast.success(note.isPinned ? 'Unpinned' : 'Pinned');
    } catch { toast.error('Failed to update'); }
    setMenuOpen(false);
  };

  const handleToggleFavourite = async (e) => {
    e.stopPropagation();
    try {
      await notesApi.toggleFavourite(note.id);
      onRefresh?.();
      toast.success(note.isFavourite ? 'Removed from favourites' : 'Added to favourites');
    } catch { toast.error('Failed to update'); }
    setMenuOpen(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Move this note to trash?')) return;
    try {
      await notesApi.deleteNote(note.id);
      onRefresh?.();
      toast.success('Note moved to trash');
    } catch { toast.error('Failed to delete note'); }
    setMenuOpen(false);
  };

  const preview = truncate(stripHtml(note.content || ''), 120);

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 px-4 py-3 rounded-xl bg-dark-surface border border-dark-border
          hover:border-primary-500 hover:border-opacity-50 cursor-pointer transition-all group"
        onClick={() => navigate(`/notes/${note.id}`)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {note.isPinned && <FiMapPin size={12} className="text-primary-400 flex-shrink-0" />}
            {note.isFavourite && <FiHeart size={12} className="text-red-400 flex-shrink-0 fill-current" />}
            {note.isLocked && <FiLock size={12} className="text-yellow-400 flex-shrink-0" />}
            <h3 className="font-medium text-dark-text truncate">{note.title || 'Untitled'}</h3>
          </div>
          <p className="text-sm text-gray-400 truncate mt-0.5">{preview}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {note.tags?.slice(0, 2).map((tag) => (
            <TagPill key={tag.id} tag={tag} size="xs" />
          ))}
          <span className="text-xs text-gray-500">{formatRelative(note.updatedAt)}</span>
          <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-all"
            >
              <FiMoreVertical size={16} />
            </button>
            {menuOpen && <NoteMenu note={note} onPin={handleTogglePin} onFavourite={handleToggleFavourite} onDelete={handleDelete} navigate={navigate} />}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className="relative flex flex-col bg-dark-surface border border-dark-border rounded-xl p-4
        hover:border-primary-500 hover:border-opacity-60 cursor-pointer transition-all group"
      onClick={() => navigate(`/notes/${note.id}`)}
    >
      {/* Status indicators */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {note.isPinned && (
            <span className="p-1 rounded bg-primary-500 bg-opacity-20">
              <FiMapPin size={10} className="text-primary-400" />
            </span>
          )}
          {note.isFavourite && (
            <span className="p-1 rounded bg-red-500 bg-opacity-20">
              <FiHeart size={10} className="text-red-400 fill-current" />
            </span>
          )}
          {note.isLocked && (
            <span className="p-1 rounded bg-yellow-500 bg-opacity-20">
              <FiLock size={10} className="text-yellow-400" />
            </span>
          )}
        </div>
        <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-all"
          >
            <FiMoreVertical size={16} />
          </button>
          {menuOpen && (
            <NoteMenu
              note={note}
              onPin={handleTogglePin}
              onFavourite={handleToggleFavourite}
              onDelete={handleDelete}
              navigate={navigate}
            />
          )}
        </div>
      </div>

      <h3 className="font-heading font-semibold text-dark-text mb-2 line-clamp-2 leading-tight">
        {note.title || 'Untitled'}
      </h3>

      <p className="text-sm text-gray-400 line-clamp-3 flex-1 leading-relaxed">
        {preview || <span className="italic text-gray-600">No content</span>}
      </p>

      <div className="mt-3 pt-3 border-t border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {note.tags?.slice(0, 2).map((tag) => (
              <TagPill key={tag.id} tag={tag} size="xs" />
            ))}
            {note.tags?.length > 2 && (
              <span className="text-xs text-gray-500 self-center">+{note.tags.length - 2}</span>
            )}
          </div>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {formatRelative(note.updatedAt)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const menuItemCls = "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors " +
  "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white";

const NoteMenu = ({ note, onPin, onFavourite, onDelete, navigate }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border shadow-xl z-20"
  >
    <button onClick={() => navigate(`/notes/${note.id}`)} className={menuItemCls + " rounded-t-xl"}>
      <FiEdit3 size={14} /> Edit
    </button>
    <button onClick={onPin} className={menuItemCls}>
      <FiMapPin size={14} /> {note.isPinned ? 'Unpin' : 'Pin'}
    </button>
    <button onClick={onFavourite} className={menuItemCls}>
      <FiHeart size={14} /> {note.isFavourite ? 'Unfavourite' : 'Favourite'}
    </button>
    <button onClick={(e) => { e.stopPropagation(); navigate(`/notes/${note.id}?share=1`); }} className={menuItemCls}>
      <FiShare2 size={14} /> Share
    </button>
    <div className="border-t border-gray-200 dark:border-dark-border" />
    <button
      onClick={onDelete}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-300 transition-colors rounded-b-xl"
    >
      <FiTrash2 size={14} /> Delete
    </button>
  </motion.div>
);

export default NoteCard;
