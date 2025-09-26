import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useProfileNotes } from '@/hooks/useProfileNotes';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble';

interface CommunicationPanelProps {
  targetUserId?: string;
}

const CommunicationPanel: React.FC<CommunicationPanelProps> = ({ targetUserId }) => {
  const { user } = useAuth();
  const { notes, isLoading, addNote } = useProfileNotes(targetUserId);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      await addNote.mutateAsync({ 
        content: newNote.trim(),
        noteType: 'admin_response'
      });
      setNewNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Communication
        </CardTitle>
        <CardDescription>
          {targetUserId ? 
            'Exchange messages with this client' : 
            'Communicate with support team'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <MessageBubble
                  key={note.id}
                  message={{
                    id: note.id,
                    content: note.content,
                    created_at: note.created_at,
                    updated_at: note.updated_at,
                    created_by: note.created_by,
                    note_type: note.note_type
                  }}
                  currentUserId={user?.id || ''}
                />
              ))}
            </div>
          )}
        </div>

        {/* New Message Form */}
        <div className="border-t pt-4 mt-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="bg-muted/30 p-3 rounded-lg border">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={targetUserId ? 
                  "Type your message to the client..." : 
                  "Type your message or question..."
                }
                className="min-h-[80px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 placeholder:text-foreground/60 text-foreground"
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            <div className="flex justify-end">
              <Button 
                type="submit" 
                size="sm" 
                disabled={!newNote.trim() || isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Message
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunicationPanel;