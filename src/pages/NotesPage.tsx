import { useState } from 'react';
import { useNotes } from '../hooks/useNotes';
import { useToast } from '../components/common/Toast';
import { Button, Card, Modal } from '../components/common';
import type { Note } from '../types';

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const { showToast } = useToast();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deleteConfirmNote, setDeleteConfirmNote] = useState<Note | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleOpenNew = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsEditorOpen(true);
  };

  const handleClose = () => {
    setIsEditorOpen(false);
    setEditingNote(null);
    setTitle('');
    setContent('');
  };

  const handleSave = () => {
    if (!title.trim()) {
      showToast('Please enter a title', 'error');
      return;
    }

    if (editingNote) {
      updateNote(editingNote.id, { title: title.trim(), content: content.trim() });
      showToast('Note updated', 'success');
    } else {
      addNote({ title: title.trim(), content: content.trim() });
      showToast('Note created', 'success');
    }
    handleClose();
  };

  const handleDelete = () => {
    if (deleteConfirmNote) {
      deleteNote(deleteConfirmNote.id);
      showToast('Note deleted', 'success');
      setDeleteConfirmNote(null);
    }
  };

  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-500 mt-1">Your wardrobe thoughts, ideas, and style inspirations</p>
        </div>
        <Button onClick={handleOpenNew}>New Note</Button>
      </div>

      {sortedNotes.length === 0 ? (
        <Card className="text-center py-12">
          <svg
            className="w-12 h-12 text-gray-300 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <p className="text-gray-500 mb-4">No notes yet</p>
          <Button onClick={handleOpenNew}>Create Your First Note</Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedNotes.map((note) => (
            <Card
              key={note.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleOpenEdit(note)}
            >
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-medium text-gray-900 truncate flex-1">{note.title}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmNote(note);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-3 whitespace-pre-wrap">
                {note.content || 'No content'}
              </p>
              <p className="text-xs text-gray-400 mt-3">
                {new Date(note.updatedAt).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Note Editor Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={handleClose}
        title={editingNote ? 'Edit Note' : 'New Note'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts about your wardrobe, style ideas, outfit inspirations..."
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingNote ? 'Save Changes' : 'Create Note'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmNote}
        onClose={() => setDeleteConfirmNote(null)}
        title="Delete Note"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{deleteConfirmNote?.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirmNote(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
