import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit3, FiLock, FiCalendar, FiUser } from 'react-icons/fi';
import { notesApi } from '../api/notes';
import TagPill from '../components/common/TagPill';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/helpers';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TiptapLink from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import CodeBlock from '@tiptap/extension-code-block';

const ReadOnlyEditor = ({ content }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      TiptapLink,
      Image,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      CodeBlock,
    ],
    content: content || '',
    editable: false,
  });

  return (
    <EditorContent
      editor={editor}
      className="text-dark-text text-base leading-relaxed"
    />
  );
};

const SharedNotePage = () => {
  const { token } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    notesApi.getSharedNote(token)
      .then((res) => {
        setNote(res.data.data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.response?.data?.message || 'Note not found or access expired');
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-500 bg-opacity-10 flex items-center justify-center mx-auto mb-4">
            <FiLock className="text-red-400" size={36} />
          </div>
          <h2 className="text-2xl font-heading font-bold text-dark-text mb-2">Note Not Available</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link to="/">
            <button className="btn-primary px-6 py-2.5 rounded-xl">Go to NoteVerse</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="border-b border-dark-border bg-dark-surface">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <FiEdit3 className="text-white text-sm" />
            </div>
            <span className="font-heading font-bold text-primary-500">NoteVerse</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 bg-dark-bg border border-dark-border px-3 py-1 rounded-full">
              Read-only view
            </span>
            <Link to="/register" className="btn-primary text-sm px-4 py-1.5 rounded-lg">
              Sign Up Free
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Note meta */}
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-dark-text mb-4 leading-tight">
              {note?.title || 'Untitled Note'}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              {note?.author && (
                <span className="flex items-center gap-1.5">
                  <FiUser size={13} />
                  {note.author.name}
                </span>
              )}
              {note?.updatedAt && (
                <span className="flex items-center gap-1.5">
                  <FiCalendar size={13} />
                  {formatDate(note.updatedAt)}
                </span>
              )}
            </div>

            {note?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {note.tags.map((tag) => (
                  <TagPill key={tag.id} tag={tag} size="sm" />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-dark-border mb-8" />

          {/* Note content */}
          <div className="prose-content">
            <ReadOnlyEditor content={note?.content} />
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-dark-border text-center">
            <p className="text-sm text-gray-400 mb-3">Want to create your own notes?</p>
            <Link to="/register">
              <button className="btn-primary px-6 py-2.5 rounded-xl">
                Get Started with NoteVerse — It's Free
              </button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SharedNotePage;
