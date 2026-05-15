import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiClock, FiX } from 'react-icons/fi';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import TagPill from '../components/common/TagPill';
import { notesApi } from '../api/notes';
import { useDebounce } from '../hooks/useDebounce';
import { formatRelative, stripHtml, truncate } from '../utils/helpers';

const highlightText = (text, query) => {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-primary-500 bg-opacity-20 text-primary-700 dark:text-primary-200 rounded px-0.5 not-italic">{part}</mark>
      : part
  );
};

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);

  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await notesApi.searchNotes(q);
      setResults(res.data.data?.content || res.data.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doSearch(debouncedQuery);
    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [debouncedQuery, doSearch, setSearchParams]);

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 lg:px-6 py-8">
            {/* Search input */}
            <div className="relative mb-8">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes, titles, content..."
                className="w-full pl-12 pr-12 py-4 text-lg rounded-2xl
                  bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border
                  text-gray-900 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiX size={18} />
                </button>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500" />
              </div>
            )}

            {/* Empty state */}
            {!loading && !searched && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-primary-500 bg-opacity-10 flex items-center justify-center mx-auto mb-4">
                  <FiSearch className="text-primary-400" size={28} />
                </div>
                <h3 className="text-lg font-heading font-semibold text-dark-text mb-2">Search your notes</h3>
                <p className="text-gray-400 text-sm">Type to search across all your notes by title or content.</p>
              </div>
            )}

            {/* No results */}
            {!loading && searched && results.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                  <FiSearch className="text-gray-400 dark:text-gray-400" size={28} />
                </div>
                <h3 className="text-lg font-heading font-semibold text-dark-text mb-2">No results found</h3>
                <p className="text-gray-400 text-sm">
                  No notes match "{query}". Try different keywords.
                </p>
              </div>
            )}

            {/* Results */}
            {!loading && results.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {results.length} result{results.length !== 1 ? 's' : ''} for "{debouncedQuery}"
                </p>
                <div className="space-y-3">
                  <AnimatePresence>
                    {results.map((note, i) => {
                      const preview = truncate(stripHtml(note.content || ''), 200);
                      return (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => navigate(`/notes/${note.id}`)}
                          className="p-5 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border
                            hover:border-primary-500 hover:border-opacity-60 hover:shadow-md cursor-pointer transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-heading font-semibold text-gray-900 dark:text-dark-text leading-tight">
                              {highlightText(note.title || 'Untitled', debouncedQuery)}
                            </h3>
                            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 flex items-center gap-1">
                              <FiClock size={11} />
                              {formatRelative(note.updatedAt)}
                            </span>
                          </div>
                          {preview && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed line-clamp-3">
                              {highlightText(preview, debouncedQuery)}
                            </p>
                          )}
                          {note.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {note.tags.map((tag) => (
                                <TagPill key={tag.id} tag={tag} size="xs" />
                              ))}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SearchPage;
