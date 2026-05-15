import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiHeart, FiTrash2, FiSettings, FiFolder, FiFolderPlus,
  FiChevronRight, FiChevronDown, FiTag, FiPlus, FiEdit3, FiX,
  FiCheck, FiMoreVertical, FiEdit2, FiTrash, FiUsers,
} from 'react-icons/fi';
import { useNotes } from '../../context/NoteContext';
import { useAuth } from '../../context/AuthContext';
import { foldersApi } from '../../api/folders';
import { notesApi } from '../../api/notes';
import toast from 'react-hot-toast';
import TagPill from '../common/TagPill';

const NavItem = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150
      ${active
        ? 'bg-primary-500 bg-opacity-20 text-primary-400'
        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
      }`}
  >
    <Icon size={16} />
    {label}
  </Link>
);

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { folders, tags, refreshFolders, refreshTags, selectedFolder, setSelectedFolder } = useNotes();
  const { user } = useAuth();

  const [foldersExpanded, setFoldersExpanded] = useState(true);
  const [tagsExpanded, setTagsExpanded] = useState(true);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState(null);
  const [editFolderName, setEditFolderName] = useState('');

  useEffect(() => {
    refreshFolders();
    refreshTags();
  }, [refreshFolders, refreshTags]);

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
    if (onClose) onClose();
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await foldersApi.createFolder({ name: newFolderName.trim() });
      await refreshFolders();
      setCreatingFolder(false);
      setNewFolderName('');
      toast.success('Folder created');
    } catch (e) {
      toast.error('Failed to create folder');
    }
  };

  const handleUpdateFolder = async (id) => {
    if (!editFolderName.trim()) return;
    try {
      await foldersApi.updateFolder(id, { name: editFolderName.trim() });
      await refreshFolders();
      setEditingFolder(null);
      toast.success('Folder renamed');
    } catch (e) {
      toast.error('Failed to rename folder');
    }
  };

  const handleDeleteFolder = async (id) => {
    if (!window.confirm('Delete this folder? Notes inside will not be deleted.')) return;
    try {
      await foldersApi.deleteFolder(id);
      await refreshFolders();
      if (selectedFolder?.id === id) setSelectedFolder(null);
      toast.success('Folder deleted');
    } catch (e) {
      toast.error('Failed to delete folder');
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-dark-surface border-r border-dark-border w-64">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <FiEdit3 className="text-white text-sm" />
          </div>
          <span className="text-lg font-heading font-bold text-primary-400">NoteVerse</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-gray-700 text-gray-400">
            <FiX size={18} />
          </button>
        )}
      </div>

      {/* New Note Button */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={handleCreateNote}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
            bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors"
        >
          <FiPlus size={16} />
          New Note
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-2 space-y-1">
        <NavItem to="/dashboard" icon={FiGrid} label="All Notes" active={location.pathname === '/dashboard'} />
        <NavItem to="/favourites" icon={FiHeart} label="Favourites" active={location.pathname === '/favourites'} />
        <NavItem to="/shared-with-me" icon={FiUsers} label="Shared with Me" active={location.pathname === '/shared-with-me'} />
        <NavItem to="/trash" icon={FiTrash2} label="Trash" active={location.pathname === '/trash'} />
      </nav>

      <div className="border-t border-dark-border my-2" />

      {/* Folders */}
      <div className="px-3 flex-1 overflow-y-auto">
        <div
          className="flex items-center justify-between py-2 cursor-pointer text-gray-400 hover:text-gray-200"
          onClick={() => setFoldersExpanded(!foldersExpanded)}
        >
          <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">
            {foldersExpanded ? <FiChevronDown size={12} /> : <FiChevronRight size={12} />}
            Folders
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setCreatingFolder(true); }}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
            title="New folder"
          >
            <FiFolderPlus size={14} />
          </button>
        </div>

        <AnimatePresence>
          {foldersExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-0.5 overflow-hidden"
            >
              {creatingFolder && (
                <div className="flex items-center gap-1 px-2 py-1">
                  <input
                    autoFocus
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateFolder();
                      if (e.key === 'Escape') { setCreatingFolder(false); setNewFolderName(''); }
                    }}
                    placeholder="Folder name"
                    className="flex-1 text-sm bg-dark-bg border border-dark-border rounded px-2 py-1 text-dark-text focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <button onClick={handleCreateFolder} className="p-1 text-green-400 hover:text-green-300">
                    <FiCheck size={14} />
                  </button>
                  <button onClick={() => { setCreatingFolder(false); setNewFolderName(''); }} className="p-1 text-red-400 hover:text-red-300">
                    <FiX size={14} />
                  </button>
                </div>
              )}
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors
                    ${selectedFolder?.id === folder.id
                      ? 'bg-primary-500 bg-opacity-20 text-primary-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                    }`}
                  onClick={() => {
                    setSelectedFolder(folder);
                    navigate('/dashboard');
                    if (onClose) onClose();
                  }}
                >
                  {editingFolder === folder.id ? (
                    <input
                      autoFocus
                      value={editFolderName}
                      onChange={(e) => setEditFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateFolder(folder.id);
                        if (e.key === 'Escape') setEditingFolder(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 text-sm bg-dark-bg border border-dark-border rounded px-1 py-0.5 text-dark-text focus:outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FiFolder size={14} className="flex-shrink-0" />
                      <span className="truncate">{folder.name}</span>
                      <span className="text-xs text-gray-600 ml-auto">{folder.noteCount || ''}</span>
                    </div>
                  )}
                  <div className="hidden group-hover:flex items-center gap-1 ml-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFolder(folder.id);
                        setEditFolderName(folder.name);
                      }}
                      className="p-0.5 rounded hover:bg-gray-700 text-gray-500 hover:text-gray-200"
                    >
                      <FiEdit2 size={11} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                      className="p-0.5 rounded hover:bg-gray-700 text-gray-500 hover:text-red-400"
                    >
                      <FiTrash size={11} />
                    </button>
                  </div>
                </div>
              ))}
              {folders.length === 0 && !creatingFolder && (
                <p className="text-xs text-gray-600 px-2 py-1">No folders yet</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="border-t border-dark-border my-3" />

        {/* Tags */}
        <div
          className="flex items-center gap-1 py-2 cursor-pointer text-gray-400 hover:text-gray-200"
          onClick={() => setTagsExpanded(!tagsExpanded)}
        >
          <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">
            {tagsExpanded ? <FiChevronDown size={12} /> : <FiChevronRight size={12} />}
            Tags
          </div>
        </div>

        <AnimatePresence>
          {tagsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-wrap gap-1.5 pb-3 overflow-hidden"
            >
              {tags.map((tag) => (
                <TagPill key={tag.id} tag={tag} size="xs" />
              ))}
              {tags.length === 0 && (
                <p className="text-xs text-gray-600 px-1">No tags yet</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Settings at bottom */}
      <div className="px-3 pb-4 border-t border-dark-border pt-3">
        <NavItem to="/settings" icon={FiSettings} label="Settings" active={location.pathname === '/settings'} />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-60 z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed left-0 top-0 h-full z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
