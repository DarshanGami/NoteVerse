import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiSave, FiCpu, FiLock, FiUnlock, FiShare2,
  FiDownload, FiHeart, FiMapPin, FiTag, FiFolder, FiMoreVertical,
  FiTrash2, FiCheck, FiX, FiUsers,
} from 'react-icons/fi';
import NoteEditor from '../components/notes/NoteEditor';
import AIPanel from '../components/ai/AIPanel';
import TagPill from '../components/common/TagPill';
import TagSelector from '../components/notes/TagSelector';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import CollaborateModal from '../components/notes/CollaborateModal';
import { notesApi } from '../api/notes';
import { useNotes } from '../context/NoteContext';
import { useAuth } from '../context/AuthContext';
import { formatDate, countWords } from '../utils/helpers';
import toast from 'react-hot-toast';

const NoteEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { folders, tags, refreshNotes, refreshTags } = useNotes();

  useEffect(() => { refreshTags(); }, [refreshTags]);
  const { user } = useAuth();

  const isNew = !id || id === 'new';
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('Untitled Note');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [showMeta, setShowMeta] = useState(true);
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockPassword, setLockPassword] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showCollaborateModal, setShowCollaborateModal] = useState(false);

  const isOwner = !note || note.userId === user?.id;
  const myPermission = note?.collaborators?.find(c => c.userId === user?.id)?.permission;
  const canEdit = isOwner || myPermission === 'WRITE';

  const saveTimerRef = useRef(null);
  const noteIdRef = useRef(id);

  // Load note
  useEffect(() => {
    if (!isNew) {
      notesApi.getNote(id)
        .then((res) => {
          const n = res.data.data;
          setNote(n);
          setTitle(n.title || 'Untitled Note');
          setContent(n.content || '');
          setLoading(false);
        })
        .catch(() => {
          toast.error('Note not found');
          navigate('/dashboard');
        });
    } else {
      setLoading(false);
    }
  }, [id, isNew, navigate]);

  // Open share modal if ?share=1
  useEffect(() => {
    if (searchParams.get('share') === '1' && note) {
      setShowShareModal(true);
    }
  }, [searchParams, note]);

  const saveNote = useCallback(async (titleVal, contentVal) => {
    setSaving(true);
    try {
      if (isNew || !noteIdRef.current || noteIdRef.current === 'new') {
        const res = await notesApi.createNote({ title: titleVal, content: contentVal });
        const newNote = res.data.data;
        noteIdRef.current = newNote.id;
        setNote(newNote);
        navigate(`/notes/${newNote.id}`, { replace: true });
      } else {
        const res = await notesApi.updateNote(noteIdRef.current, { title: titleVal, content: contentVal });
        setNote(res.data.data);
      }
      setSaved(true);
      refreshNotes();
    } catch (e) {
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  }, [isNew, navigate, refreshNotes]);

  // Debounced auto-save
  const scheduleAutoSave = useCallback((newTitle, newContent) => {
    setSaved(false);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveNote(newTitle, newContent);
    }, 2000);
  }, [saveNote]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    scheduleAutoSave(e.target.value, content);
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    scheduleAutoSave(title, newContent);
  };

  const handleManualSave = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveNote(title, content);
  };

  const handleTogglePin = async () => {
    if (!note) return;
    try {
      const res = await notesApi.togglePin(note.id);
      setNote(res.data.data);
      toast.success(note.isPinned ? 'Unpinned' : 'Pinned');
    } catch { toast.error('Failed to update'); }
  };

  const handleToggleFavourite = async () => {
    if (!note) return;
    try {
      const res = await notesApi.toggleFavourite(note.id);
      setNote(res.data.data);
      toast.success(note.isFavourite ? 'Removed from favourites' : 'Added to favourites');
    } catch { toast.error('Failed to update'); }
  };

  const handleLock = async () => {
    if (!note) return;
    try {
      if (note.isLocked) {
        await notesApi.unlockNote(note.id, { password: lockPassword });
        setNote({ ...note, isLocked: false });
        toast.success('Note unlocked');
      } else {
        await notesApi.lockNote(note.id, { password: lockPassword });
        setNote({ ...note, isLocked: true });
        toast.success('Note locked');
      }
      setShowLockModal(false);
      setLockPassword('');
    } catch { toast.error('Failed to update lock'); }
  };

  const handleShare = async () => {
    if (!note) return;
    try {
      const res = await notesApi.shareNote(note.id, { permission: 'VIEW' });
      const data = res.data.data;
      if (data?.shareUrl) {
        setShareUrl(data.shareUrl);
      } else if (data?.token) {
        setShareUrl(`${window.location.origin}/share/${data.token}`);
      }
      setShowShareModal(true);
    } catch { toast.error('Failed to share note'); }
  };

  const handleDelete = async () => {
    if (!note) return;
    if (!window.confirm('Move this note to trash?')) return;
    try {
      await notesApi.deleteNote(note.id);
      toast.success('Note moved to trash');
      navigate('/dashboard');
      refreshNotes();
    } catch { toast.error('Failed to delete note'); }
  };

  const handleAIApply = (result) => {
    setContent(result);
    scheduleAutoSave(title, result);
  };

  const wordCount = countWords(content?.replace(/<[^>]+>/g, ' ') || '');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      {/* Main editor area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border bg-dark-surface flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              <FiArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {saving ? (
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : saved ? (
                <span className="flex items-center gap-1.5 text-green-400">
                  <FiCheck size={13} />
                  Saved
                </span>
              ) : (
                <span className="text-yellow-400">Unsaved changes</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleManualSave}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              <FiSave size={14} />
              Save
            </button>

            {note && (
              <>
                <button
                  onClick={handleTogglePin}
                  className={`p-2 rounded-lg transition-colors ${note.isPinned ? 'text-primary-400 bg-primary-500 bg-opacity-20' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                  title={note.isPinned ? 'Unpin' : 'Pin'}
                >
                  <FiMapPin size={16} />
                </button>

                <button
                  onClick={handleToggleFavourite}
                  className={`p-2 rounded-lg transition-colors ${note.isFavourite ? 'text-red-400 bg-red-500 bg-opacity-20' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                  title={note.isFavourite ? 'Unfavourite' : 'Favourite'}
                >
                  <FiHeart size={16} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                  title="Share"
                >
                  <FiShare2 size={16} />
                </button>

                <TagSelector
                  noteTags={note.tags || []}
                  allTags={tags}
                  onUpdate={async (newTagIds) => {
                    try {
                      const res = await notesApi.updateNote(note.id, {
                        title: note.title,
                        content: note.content,
                        folderId: note.folderId,
                        isPinned: note.isPinned,
                        isFavourite: note.isFavourite,
                        tags: newTagIds,
                      });
                      setNote(res.data.data);
                    } catch { toast.error('Failed to update tags'); }
                  }}
                  onTagsRefresh={refreshTags}
                />

                <button
                  onClick={() => setShowCollaborateModal(true)}
                  className={`p-2 rounded-lg transition-colors ${
                    note?.collaborators?.length > 0
                      ? 'text-primary-400 bg-primary-500 bg-opacity-20'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                  title="Collaborate"
                >
                  <FiUsers size={16} />
                </button>

                <button
                  onClick={() => setShowLockModal(true)}
                  className={`p-2 rounded-lg transition-colors ${note.isLocked ? 'text-yellow-400 bg-yellow-500 bg-opacity-20' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                  title={note.isLocked ? 'Unlock' : 'Lock'}
                >
                  {note.isLocked ? <FiUnlock size={16} /> : <FiLock size={16} />}
                </button>

                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <FiTrash2 size={16} />
                </button>
              </>
            )}

            <button
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium
                ${aiPanelOpen ? 'bg-primary-500 text-white' : 'bg-dark-surface border border-dark-border text-gray-300 hover:bg-gray-700'}`}
              title="AI Assistant"
            >
              <FiCpu size={16} />
              <span className="hidden sm:inline">AI</span>
            </button>
          </div>
        </div>

        {/* Editor content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Title */}
            <div className="px-6 pt-6 pb-2 flex-shrink-0">
              <input
                value={title}
                onChange={handleTitleChange}
                placeholder="Note title..."
                className="w-full text-3xl font-heading font-bold text-dark-text bg-transparent border-none outline-none placeholder-gray-600"
              />
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                {note && <span>Updated {formatDate(note.updatedAt)}</span>}
                <span>{wordCount} words</span>
                {note?.folder && <span className="flex items-center gap-1"><FiFolder size={11} />{note.folder.name}</span>}
              </div>
              {note?.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {note.tags.map((tagId) => {
                    const tag = tags.find(t => t.id === tagId);
                    return tag ? <TagPill key={tagId} tag={tag} size="xs" /> : null;
                  })}
                </div>
              )}
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden">
              {!canEdit && (
                <div className="mx-6 mb-2 px-3 py-2 rounded-lg bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 text-blue-400 text-xs">
                  You have read-only access to this note.
                </div>
              )}
              <NoteEditor
                content={content}
                onChange={handleContentChange}
                editable={canEdit && !note?.isLocked}
                placeholder="Start writing your note here..."
              />
            </div>
          </div>

          {/* Right: AI panel */}
          <AIPanel
            content={content}
            onApply={handleAIApply}
            isOpen={aiPanelOpen}
            onClose={() => setAiPanelOpen(false)}
          />
        </div>
      </div>

      {/* Lock Modal */}
      <Modal
        isOpen={showLockModal}
        onClose={() => { setShowLockModal(false); setLockPassword(''); }}
        title={note?.isLocked ? 'Unlock Note' : 'Lock Note'}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            {note?.isLocked
              ? 'Enter the password to unlock this note.'
              : 'Set a password to lock this note. You will need it to access it later.'}
          </p>
          <input
            type="password"
            value={lockPassword}
            onChange={(e) => setLockPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLock()}
            placeholder="Enter password"
            autoFocus
            className="input-field"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => { setShowLockModal(false); setLockPassword(''); }}>
              Cancel
            </Button>
            <Button onClick={handleLock} variant={note?.isLocked ? 'secondary' : 'primary'}>
              {note?.isLocked ? 'Unlock' : 'Lock'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Note"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">Share this note with anyone using the link below:</p>
          {shareUrl ? (
            <div className="flex gap-2">
              <input
                value={shareUrl}
                readOnly
                className="input-field flex-1 text-sm"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  toast.success('Link copied!');
                }}
                size="sm"
              >
                Copy
              </Button>
            </div>
          ) : (
            <Button onClick={handleShare} fullWidth>Generate Share Link</Button>
          )}
        </div>
      </Modal>

      {/* Collaborate Modal */}
      <CollaborateModal
        isOpen={showCollaborateModal}
        onClose={() => setShowCollaborateModal(false)}
        noteId={note?.id}
        isOwner={isOwner}
      />
    </div>
  );
};

export default NoteEditorPage;
