import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Tag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ClientNote {
  id: string;
  title: string;
  content: string;
  note_type: string;
  priority: string;
  follow_up_date?: string;
  status: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

interface ClientNotesSectionProps {
  clientId: string;
}

const ClientNotesSection: React.FC<ClientNotesSectionProps> = ({ clientId }) => {
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ClientNote | null>(null);
  const queryClient = useQueryClient();

  // Form state
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    note_type: 'general',
    priority: 'normal',
    follow_up_date: '',
    tags: ''
  });

  // Fetch client notes
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['client-notes', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_notes')
        .select('*')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ClientNote[];
    }
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (noteData: any) => {
      const { data, error } = await supabase
        .from('client_notes')
        .insert({
          user_id: clientId,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          ...noteData,
          tags: noteData.tags ? noteData.tags.split(',').map((t: string) => t.trim()) : []
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-notes', clientId] });
      setIsAddNoteOpen(false);
      setNoteForm({
        title: '',
        content: '',
        note_type: 'general',
        priority: 'normal',
        follow_up_date: '',
        tags: ''
      });
      toast.success('Note added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add note');
      console.error('Error adding note:', error);
    }
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ noteId, updates }: { noteId: string; updates: any }) => {
      const { data, error } = await supabase
        .from('client_notes')
        .update({
          ...updates,
          tags: updates.tags ? updates.tags.split(',').map((t: string) => t.trim()) : []
        })
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-notes', clientId] });
      setEditingNote(null);
      toast.success('Note updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update note');
      console.error('Error updating note:', error);
    }
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('client_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-notes', clientId] });
      toast.success('Note deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete note');
      console.error('Error deleting note:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNote) {
      updateNoteMutation.mutate({ noteId: editingNote.id, updates: noteForm });
    } else {
      addNoteMutation.mutate(noteForm);
    }
  };

  const startEdit = (note: ClientNote) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      note_type: note.note_type,
      priority: note.priority,
      follow_up_date: note.follow_up_date ? format(new Date(note.follow_up_date), 'yyyy-MM-dd') : '',
      tags: note.tags?.join(', ') || ''
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-800';
      case 'follow_up': return 'bg-green-100 text-green-800';
      case 'issue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Client Notes</CardTitle>
            <CardDescription>Track important information and follow-ups</CardDescription>
          </div>
          <Dialog open={isAddNoteOpen || !!editingNote} onOpenChange={(open) => {
            setIsAddNoteOpen(open);
            if (!open) setEditingNote(null);
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={noteForm.title}
                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                    placeholder="Note title"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select value={noteForm.note_type} onValueChange={(value) => setNoteForm({ ...noteForm, note_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="call">Call Note</SelectItem>
                        <SelectItem value="follow_up">Follow Up</SelectItem>
                        <SelectItem value="issue">Issue</SelectItem>
                        <SelectItem value="opportunity">Opportunity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={noteForm.priority} onValueChange={(value) => setNoteForm({ ...noteForm, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    value={noteForm.content}
                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                    placeholder="Note content"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Follow-up Date (optional)</label>
                  <Input
                    type="date"
                    value={noteForm.follow_up_date}
                    onChange={(e) => setNoteForm({ ...noteForm, follow_up_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Tags (comma-separated)</label>
                  <Input
                    value={noteForm.tags}
                    onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
                    placeholder="important, follow-up, investment"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsAddNoteOpen(false);
                    setEditingNote(null);
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addNoteMutation.isPending || updateNoteMutation.isPending}>
                    {editingNote ? 'Update' : 'Add'} Note
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="text-muted-foreground">No notes yet. Add your first note to get started.</p>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{note.title}</h4>
                    <Badge className={getTypeColor(note.note_type)}>{note.note_type}</Badge>
                    <Badge className={getPriorityColor(note.priority)}>{note.priority}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(note)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteNoteMutation.mutate(note.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">{note.content}</p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{format(new Date(note.created_at), 'MMM dd, yyyy HH:mm')}</span>
                  {note.follow_up_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Follow up: {format(new Date(note.follow_up_date), 'MMM dd, yyyy')}
                    </div>
                  )}
                </div>
                
                {note.tags && note.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <Tag className="h-3 w-3" />
                    {note.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientNotesSection;