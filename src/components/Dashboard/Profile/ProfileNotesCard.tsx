import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useProfileNotes } from '@/hooks/useProfileNotes';
import { useAdminVerification } from '@/hooks/useAdminVerification';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Send, User, Shield, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface ProfileNotesCardProps {
  targetUserId?: string;
}

const ProfileNotesCard: React.FC<ProfileNotesCardProps> = ({ targetUserId }) => {
  const { user } = useAuth();
  const { isAdmin } = useAdminVerification();
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
        noteType: 'communication'
      });
      setNewNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMessageAuthorInfo = (note: any) => {
    const isCurrentUser = note.created_by === user?.id;
    const isAdminNote = note.created_by !== (targetUserId || user?.id);
    
    return {
      isCurrentUser,
      isAdminNote,
      label: isAdminNote ? 'Admin' : (isCurrentUser ? 'You' : 'Client'),
      icon: isAdminNote ? Shield : User
    };
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Communication
        </CardTitle>
        <CardDescription>
          {isAdmin && targetUserId ? 
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
            notes.map((note) => {
              const authorInfo = getMessageAuthorInfo(note);
              const IconComponent = authorInfo.icon;
              
              return (
                <div
                  key={note.id}
                  className={`p-3 rounded-lg ${
                    authorInfo.isCurrentUser
                      ? 'bg-primary/10 border-primary/20 ml-8'
                      : authorInfo.isAdminNote
                      ? 'bg-amber-50 border-amber-200 mr-8'
                      : 'bg-muted mr-8'
                  } border`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <Badge 
                        variant={authorInfo.isAdminNote ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {authorInfo.label}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(note.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                </div>
              );
            })
          )}
        </div>

        {/* New Message Form */}
        <div className="border-t pt-4 mt-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="bg-muted/30 p-3 rounded-lg border">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={isAdmin && targetUserId ? 
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

export default ProfileNotesCard;