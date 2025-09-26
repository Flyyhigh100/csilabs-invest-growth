import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, MoreHorizontal, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { useProfileNotes } from '@/hooks/useProfileNotes';

interface Message {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  note_type: string;
}

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  currentUserId,
  onEdit,
  onDelete 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { updateNote, deleteNote } = useProfileNotes();

  const isClientMessage = message.note_type === 'client_message';
  const isAdminMessage = message.note_type === 'admin_response' || message.note_type === 'communication';
  const isCurrentUserMessage = message.created_by === currentUserId;

  const handleSaveEdit = async () => {
    if (editContent.trim() === message.content) {
      setIsEditing(false);
      return;
    }

    try {
      await updateNote.mutateAsync({
        noteId: message.id,
        content: editContent.trim()
      });
      setIsEditing(false);
      onEdit?.();
    } catch (error) {
      console.error('Failed to update message:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      await deleteNote.mutateAsync({ noteId: message.id });
      setShowDeleteDialog(false);
      onDelete?.();
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  return (
    <>
      <div
        className={`flex ${isClientMessage ? 'justify-start' : 'justify-end'}`}
      >
        <div
          className={`max-w-[80%] p-3 rounded-lg group relative ${
            isClientMessage
              ? 'bg-gray-100 text-gray-900'
              : 'bg-primary text-primary-foreground'
          }`}
        >
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px] bg-background text-foreground"
                autoFocus
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={updateNote.isPending || !editContent.trim()}
                >
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={updateNote.isPending}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm">{message.content}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs opacity-70">
                  {format(new Date(message.created_at), 'MMM d, HH:mm')} •{' '}
                  {isClientMessage ? 'Client' : 'Admin'}
                  {message.created_at !== message.updated_at && ' • edited'}
                </p>
                
                {/* Actions menu for admin messages only */}
                {isAdminMessage && isCurrentUserMessage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit className="h-3 w-3 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MessageBubble;