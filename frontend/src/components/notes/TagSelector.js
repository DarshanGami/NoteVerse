import React, { useState, useRef, useEffect } from 'react';
import { FiTag, FiPlus, FiX, FiCheck } from 'react-icons/fi';
import { tagsApi } from '../../api/tags';
import TagPill from '../common/TagPill';
import toast from 'react-hot-toast';

const COLORS = ['#6C63FF','#10b981','#3b82f6','#f59e0b','#ef4444','#ec4899','#8b5cf6','#14b8a6'];

const TagSelector = ({ noteTags = [], allTags = [], onUpdate, onTagsRefresh }) => {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedIds = new Set(noteTags);

  const toggle = (tagId) => {
    const next = new Set(selectedIds);
    if (next.has(tagId)) next.delete(tagId);
    else next.add(tagId);
    onUpdate([...next]);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await tagsApi.createTag({ name: newName.trim(), color: newColor });
      const created = res.data.data;
      await onTagsRefresh();
      onUpdate([...selectedIds, created.id]);
      setNewName('');
      setShowCreate(false);
      toast.success(`Tag "${created.name}" created`);
    } catch {
      toast.error('Failed to create tag');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, tagId) => {
    e.stopPropagation();
    try {
      await tagsApi.deleteTag(tagId);
      await onTagsRefresh();
      if (selectedIds.has(tagId)) {
        const next = new Set(selectedIds);
        next.delete(tagId);
        onUpdate([...next]);
      }
      toast.success('Tag deleted');
    } catch {
      toast.error('Failed to delete tag');
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors
          ${open || noteTags.length > 0
            ? 'bg-primary-500 bg-opacity-20 text-primary-400 border border-primary-500 border-opacity-40'
            : 'bg-dark-surface border border-dark-border text-gray-400 hover:text-white hover:border-gray-500'
          }`}
        title="Manage tags"
      >
        <FiTag size={14} />
        {noteTags.length > 0 && <span className="text-xs font-medium">{noteTags.length}</span>}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-dark-surface border border-dark-border rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-dark-border">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tags</p>
          </div>

          <div className="max-h-52 overflow-y-auto">
            {allTags.length === 0 && !showCreate && (
              <p className="text-xs text-gray-500 text-center py-4">No tags yet. Create one below.</p>
            )}
            {allTags.map(tag => (
              <div
                key={tag.id}
                onClick={() => toggle(tag.id)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-dark-bg cursor-pointer group"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors
                  ${selectedIds.has(tag.id) ? 'border-primary-500 bg-primary-500' : 'border-gray-600'}`}>
                  {selectedIds.has(tag.id) && <FiCheck size={10} className="text-white" />}
                </div>
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color || '#6C63FF' }}
                />
                <span className="text-sm text-gray-300 flex-1 truncate">{tag.name}</span>
                <button
                  onClick={(e) => handleDelete(e, tag.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-0.5"
                  title="Delete tag"
                >
                  <FiX size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-dark-border p-2">
            {!showCreate ? (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs text-gray-400 hover:text-primary-400 rounded-lg hover:bg-dark-bg transition-colors"
              >
                <FiPlus size={13} /> Create new tag
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowCreate(false); }}
                  placeholder="Tag name..."
                  className="w-full px-2 py-1.5 text-xs bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-600 outline-none focus:border-primary-500"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      className={`w-5 h-5 rounded-full border-2 transition-transform ${newColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={handleCreate}
                    disabled={creating || !newName.trim()}
                    className="flex-1 py-1 text-xs bg-primary-500 hover:bg-primary-600 text-white rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    onClick={() => { setShowCreate(false); setNewName(''); }}
                    className="px-2 py-1 text-xs text-gray-400 hover:text-white rounded-lg hover:bg-dark-bg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagSelector;
