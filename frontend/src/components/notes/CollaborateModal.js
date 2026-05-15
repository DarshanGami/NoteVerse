import React, { useState, useEffect } from 'react';
import { FiUserPlus, FiTrash2, FiUsers } from 'react-icons/fi';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { collaborateApi } from '../../api/collaborate';
import toast from 'react-hot-toast';

const CollaborateModal = ({ isOpen, onClose, noteId, isOwner }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('READ');
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (isOpen && noteId && isOwner) {
      setLoading(true);
      collaborateApi.getCollaborators(noteId)
        .then((res) => setCollaborators(res.data.data || []))
        .catch(() => toast.error('Failed to load collaborators'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, noteId, isOwner]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setInviting(true);
    try {
      const res = await collaborateApi.invite(noteId, { email: email.trim(), permission });
      const updated = res.data.data;
      setCollaborators((prev) => {
        const idx = prev.findIndex((c) => c.userId === updated.userId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        }
        return [...prev, updated];
      });
      setEmail('');
      toast.success(`Invited ${updated.email} with ${updated.permission} access`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to invite collaborator';
      toast.error(msg);
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId, userEmail) => {
    if (!window.confirm(`Remove ${userEmail} from this note?`)) return;
    try {
      await collaborateApi.removeCollaborator(noteId, userId);
      setCollaborators((prev) => prev.filter((c) => c.userId !== userId));
      toast.success('Collaborator removed');
    } catch {
      toast.error('Failed to remove collaborator');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Collaborate" size="md">
      <div className="space-y-5">
        {isOwner && (
          <form onSubmit={handleInvite} className="space-y-3">
            <p className="text-sm text-gray-400">Invite someone by email to collaborate on this note.</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collaborator@email.com"
                className="input-field flex-1 text-sm"
                required
              />
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="input-field text-sm w-28"
              >
                <option value="READ">Read</option>
                <option value="WRITE">Write</option>
              </select>
              <Button type="submit" size="sm" disabled={inviting}>
                {inviting ? '...' : <FiUserPlus size={15} />}
              </Button>
            </div>
          </form>
        )}

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <FiUsers size={12} /> Collaborators {collaborators.length > 0 && `(${collaborators.length})`}
          </h4>

          {loading ? (
            <p className="text-sm text-gray-500 py-2">Loading...</p>
          ) : collaborators.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">No collaborators yet.</p>
          ) : (
            <ul className="space-y-2">
              {collaborators.map((c) => (
                <li
                  key={c.userId}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-dark-bg border border-dark-border"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-dark-text truncate">{c.name || c.email}</p>
                    {c.name && <p className="text-xs text-gray-500 truncate">{c.email}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      c.permission === 'WRITE'
                        ? 'bg-green-500 bg-opacity-20 text-green-400'
                        : 'bg-blue-500 bg-opacity-20 text-blue-400'
                    }`}>
                      {c.permission === 'WRITE' ? 'Write' : 'Read'}
                    </span>
                    {isOwner && (
                      <button
                        onClick={() => handleRemove(c.userId, c.email)}
                        className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                        title="Remove collaborator"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!isOwner && (
          <p className="text-xs text-gray-500">Only the note owner can manage collaborators.</p>
        )}
      </div>
    </Modal>
  );
};

export default CollaborateModal;
