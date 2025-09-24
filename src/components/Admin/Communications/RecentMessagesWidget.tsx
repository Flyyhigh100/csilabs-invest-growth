import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User, ArrowRight, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const RecentMessagesWidget: React.FC = () => {
  const { user } = useAuth();

  const { data: recentMessages, isLoading } = useQuery({
    queryKey: ['recent-messages-widget'],
    queryFn: async () => {
      console.log('Fetching recent messages for widget...');
      
      // Get recent messages
      const { data: notes, error } = await supabase
        .from('client_notes')
        .select('*')
        .neq('created_by', user?.id) // Only messages not from admin
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent messages:', error);
        throw error;
      }

      if (!notes || notes.length === 0) {
        return [];
      }

      // Get profiles for these users
      const userIds = [...new Set(notes.map(note => note.user_id))];
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        throw profileError;
      }

      // Create profile map
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return notes.map(note => {
        const profile = profileMap.get(note.user_id);
        return {
          id: note.id,
          content: note.content,
          created_at: note.created_at,
          user_id: note.user_id,
          user_name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Unknown User',
          user_email: profile?.email || '',
          priority: note.priority || 'normal'
        };
      });
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Recent Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            Loading messages...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Recent Messages
          </div>
          {recentMessages && recentMessages.length > 0 && (
            <Badge variant="secondary">
              {recentMessages.length} new
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Latest client communications requiring attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!recentMessages || recentMessages.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent messages</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentMessages.map((message) => (
              <div
                key={message.id}
                className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <User className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm truncate">
                      {message.user_name}
                    </span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(message.created_at), 'MMM d, HH:mm')}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {message.content}
                  </p>
                  {message.priority !== 'normal' && (
                    <Badge
                      variant={message.priority === 'urgent' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {message.priority}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            <div className="pt-3 border-t">
              <Button asChild variant="outline" className="w-full">
                <Link to="/admin/communications">
                  View All Conversations
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentMessagesWidget;