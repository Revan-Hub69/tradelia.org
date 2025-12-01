'use client';

import { useState, useMemo } from 'react';
import { Search, FileText, Download, Trash2, Edit2, Save, X } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { authenticatedFetch } from '@/lib/api/fetch-client';
import { toast } from '@/components/ui/Toast';

interface LessonNote {
  id: string;
  lesson_id: string;
  lesson_title: string;
  notes: string;
  updated_at: string;
}

interface NotesSystemProps {
  courseId: string;
  courseSlug: string;
  notes: LessonNote[];
  onUpdate?: () => void;
}

/**
 * Notes System Component
 * Note personali per lezioni con search e export
 * Riferimento: Note-taking Best Practices, Knowledge Management
 */
export function NotesSystem({ courseId, courseSlug, notes, onUpdate }: NotesSystemProps) {
  const { t } = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  // Filter notes by search
  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.lesson_title.toLowerCase().includes(query) ||
        note.notes.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  const handleEdit = (note: LessonNote) => {
    setEditingNote(note.id);
    setEditContent(note.notes);
  };

  const handleSave = async (noteId: string, lessonId: string) => {
    setSaving(true);
    try {
      const response = await authenticatedFetch(
        `/api/courses/${courseSlug}/lessons/${lessonId}/notes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: editContent }),
        }
      );

      if (!response.ok) {
        throw new Error('Errore durante il salvataggio');
      }

      toast.success(t('notes.saved') || 'Note salvate con successo!');
      setEditingNote(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error(t('notes.saveError') || 'Errore durante il salvataggio delle note');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingNote(null);
    setEditContent('');
  };

  const handleDelete = async (noteId: string, lessonId: string) => {
    if (!confirm(t('notes.deleteConfirm') || 'Sei sicuro di voler eliminare queste note?'))) {
      return;
    }

    try {
      const response = await authenticatedFetch(
        `/api/courses/${courseSlug}/lessons/${lessonId}/notes`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Errore durante l\'eliminazione');
      }

      toast.success(t('notes.deleted') || 'Note eliminate con successo!');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error(t('notes.deleteError') || 'Errore durante l\'eliminazione delle note');
    }
  };

  const handleExport = () => {
    const content = notes
      .map((note) => `# ${note.lesson_title}\n\n${note.notes}\n\n---\n`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-corso-${courseSlug}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success(t('notes.exported') || 'Note esportate con successo!');
  };

  if (notes.length === 0) {
    return (
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-6 text-center">
        <FileText className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
        <p className="text-text-secondary">
          {t('notes.empty') || 'Nessuna nota disponibile. Aggiungi note durante le lezioni!'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <FileText className="w-5 h-5 text-accent" />
          {t('notes.title') || 'Le Mie Note'}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t('notes.export') || 'Esporta'}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('notes.search') || 'Cerca nelle note...'}
          className="w-full pl-10 pr-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
        />
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            {t('notes.noResults') || 'Nessuna nota trovata'}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-bg-surface border border-border-subtle rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-text-primary">{note.lesson_title}</h4>
                <div className="flex items-center gap-2">
                  {editingNote === note.id ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSave(note.id, note.lesson_id)}
                        disabled={saving}
                        className="flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        className="flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(note)}
                        className="flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(note.id, note.lesson_id)}
                        className="flex items-center gap-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {editingNote === note.id ? (
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  className="bg-bg-soft border-border-subtle text-text-primary"
                />
              ) : (
                <div className="text-text-secondary whitespace-pre-wrap text-sm">
                  {note.notes || <span className="text-text-tertiary italic">Nessuna nota</span>}
                </div>
              )}
              <p className="text-xs text-text-tertiary mt-2">
                {t('notes.updated') || 'Aggiornato'}: {new Date(note.updated_at).toLocaleString('it-IT')}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

