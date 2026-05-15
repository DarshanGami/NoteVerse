import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiZap, FiCheckSquare, FiTag, FiX, FiCopy, FiCheck, FiChevronDown } from 'react-icons/fi';
import { aiApi } from '../../api/ai';
import { stripHtml } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AIPanel = ({ content, onApply, isOpen, onClose }) => {
  const [loading, setLoading] = useState(null);
  const [result, setResult] = useState(null);
  const [resultType, setResultType] = useState(null);
  const [rewriteInstruction, setRewriteInstruction] = useState('');
  const [copied, setCopied] = useState(false);
  const [showRewriteInput, setShowRewriteInput] = useState(false);

  const plainText = stripHtml(content || '');

  const runAI = async (type) => {
    if (!plainText.trim()) {
      toast.error('Note is empty. Write something first!');
      return;
    }
    setLoading(type);
    setResult(null);
    setResultType(type);
    try {
      let res;
      if (type === 'summarize') res = await aiApi.summarize(plainText);
      else if (type === 'grammar') res = await aiApi.grammar(plainText);
      else if (type === 'rewrite') res = await aiApi.rewrite(plainText, rewriteInstruction);
      else if (type === 'tags') res = await aiApi.suggestTags(plainText);

      const data = res.data.data;
      setResult(typeof data === 'string' ? data : JSON.stringify(data));
    } catch (e) {
      toast.error('AI request failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard');
    }
  };

  const handleApply = () => {
    if (result && onApply) {
      onApply(result);
      toast.success('Applied to note');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'tween', duration: 0.2 }}
          className="flex-shrink-0 border-l border-dark-border bg-dark-surface overflow-hidden"
        >
          <div className="flex flex-col h-full w-80">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
              <div className="flex items-center gap-2">
                <FiCpu className="text-primary-400" size={18} />
                <span className="font-heading font-semibold text-dark-text">AI Assistant</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Actions */}
            <div className="p-4 space-y-2">
              <p className="text-xs text-gray-500 mb-3">Select an AI action to apply to your note content:</p>

              <AIButton
                onClick={() => runAI('summarize')}
                loading={loading === 'summarize'}
                icon={FiZap}
                label="Summarize"
                desc="Get a concise summary of your note"
                color="text-blue-400"
              />

              <AIButton
                onClick={() => runAI('grammar')}
                loading={loading === 'grammar'}
                icon={FiCheckSquare}
                label="Fix Grammar"
                desc="Correct grammar and spelling errors"
                color="text-green-400"
              />

              <div>
                <AIButton
                  onClick={() => setShowRewriteInput(!showRewriteInput)}
                  loading={loading === 'rewrite'}
                  icon={FiCpu}
                  label="Rewrite"
                  desc="Rewrite with custom instruction"
                  color="text-purple-400"
                  chevron
                  active={showRewriteInput}
                />
                <AnimatePresence>
                  {showRewriteInput && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-2"
                    >
                      <div className="flex gap-2">
                        <input
                          value={rewriteInstruction}
                          onChange={(e) => setRewriteInstruction(e.target.value)}
                          placeholder="e.g. Make it more formal..."
                          className="flex-1 text-sm bg-dark-bg border border-dark-border rounded-lg px-3 py-1.5 text-dark-text placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          onKeyDown={(e) => e.key === 'Enter' && runAI('rewrite')}
                        />
                        <button
                          onClick={() => runAI('rewrite')}
                          className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs rounded-lg transition-colors"
                        >
                          Go
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AIButton
                onClick={() => runAI('tags')}
                loading={loading === 'tags'}
                icon={FiTag}
                label="Suggest Tags"
                desc="Auto-generate relevant tags"
                color="text-yellow-400"
              />
            </div>

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mx-4 mb-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400 capitalize">{resultType} result:</span>
                    <div className="flex gap-1">
                      <button
                        onClick={handleCopy}
                        className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                        title="Copy"
                      >
                        {copied ? <FiCheck size={13} className="text-green-400" /> : <FiCopy size={13} />}
                      </button>
                      <button
                        onClick={() => setResult(null)}
                        className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                      >
                        <FiX size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="bg-dark-bg border border-dark-border rounded-lg p-3 text-sm text-gray-300 leading-relaxed max-h-48 overflow-y-auto">
                    {result}
                  </div>
                  {(resultType === 'summarize' || resultType === 'grammar' || resultType === 'rewrite') && (
                    <button
                      onClick={handleApply}
                      className="w-full py-1.5 text-xs bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                    >
                      Apply to Note
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AIButton = ({ onClick, loading, icon: Icon, label, desc, color, chevron, active }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left
      ${active
        ? 'border-primary-500 border-opacity-50 bg-primary-500 bg-opacity-10'
        : 'border-dark-border hover:border-gray-600 hover:bg-gray-800'
      }
      disabled:opacity-60 disabled:cursor-not-allowed`}
  >
    <div className={`flex-shrink-0 ${color}`}>
      {loading
        ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        : <Icon size={16} />
      }
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-dark-text">{label}</p>
      <p className="text-xs text-gray-500 truncate">{desc}</p>
    </div>
    {chevron && (
      <FiChevronDown
        size={14}
        className={`text-gray-400 transition-transform ${active ? 'rotate-180' : ''}`}
      />
    )}
  </button>
);

export default AIPanel;
