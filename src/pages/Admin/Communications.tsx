import React, { useState } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Send, 
  Clock, 
  User, 
  Star,
  AlertCircle,
  CheckCircle,
  Bell,
  ArrowRight
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunicationRealtime } from '@/hooks/communication/useCommunicationRealtime';

interface CommunicationThread {
  user_id: string;
  user_name: string;
  user_email: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  priority: string;
  status: string;
  messages: Array<{
    id: string;
    content: string;
    created_at: string;
    created_by: string;
    note_type: string;
  }>;
}

const AdminCommunications: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedThread, setSelectedThread] = useState<CommunicationThread | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  // Set up real-time updates for communications
  useCommunicationRealtime();

  // Fetch communication threads
  const { data: threads, isLoading, refetch } = useQuery({
    queryKey: ['communication-threads', searchQuery, statusFilter, priorityFilter],
    queryFn: async () => {
      console.log('Fetching communication threads...');
      
      // Fetch all notes first
      const { data: notes, error } = await supabase
        .from('client_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notes:', error);
        throw error;
      }

      // Get unique user IDs
      const userIds = [...new Set(notes?.map(note => note.user_id) || [])];
      
      // Fetch profiles for these users
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        throw profileError;
      }

      // Create a map of profiles by ID
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      console.log('Raw notes data:', notes);

      // Group notes by user and create thread structure
      const threadMap = new Map<string, CommunicationThread>();
      
      notes?.forEach((note) => {
        const userId = note.user_id;
        const profile = profileMap.get(userId);
        
        if (!threadMap.has(userId)) {
          threadMap.set(userId, {
            user_id: userId,
            user_name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Unknown User',
            user_email: profile?.email || '',
            last_message: note.content,
            last_message_time: note.created_at,
            unread_count: note.created_by !== user?.id ? 1 : 0,
            priority: note.priority || 'normal',
            status: note.status || 'active',
            messages: []
          });
        }
        
        const thread = threadMap.get(userId)!;
        thread.messages.push({
          id: note.id,
          content: note.content,
          created_at: note.created_at,
          created_by: note.created_by,
          note_type: note.note_type
        });
        
        // Update last message if this one is newer
        if (new Date(note.created_at) > new Date(thread.last_message_time)) {
          thread.last_message = note.content;
          thread.last_message_time = note.created_at;
        }
      });

      // Convert to array and apply filters
      let threadsArray = Array.from(threadMap.values());
      
      // Apply search filter
      if (searchQuery) {
        threadsArray = threadsArray.filter(thread => 
          thread.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          thread.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          thread.last_message.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Apply status filter
      if (statusFilter !== 'all') {
        threadsArray = threadsArray.filter(thread => thread.status === statusFilter);
      }
      
      // Apply priority filter
      if (priorityFilter !== 'all') {
        threadsArray = threadsArray.filter(thread => thread.priority === priorityFilter);
      }
      
      // Sort by last message time
      threadsArray.sort((a, b) => 
        new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
      );

      console.log('Processed threads:', threadsArray);
      return threadsArray;
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  // Send reply mutation
  const sendReplyMutation = useMutation({
    mutationFn: async ({ userId, message }: { userId: string; message: string }) => {
      const { data, error } = await supabase
        .from('client_notes')
        .insert({
          user_id: userId,
          content: message,
          created_by: user?.id,
          note_type: 'admin_response',
          title: 'Admin Response',
          priority: 'normal'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Reply sent successfully');
      setReplyMessage('');
      queryClient.invalidateQueries({ queryKey: ['communication-threads'] });
      refetch();
    },
    onError: (error) => {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  });

  const handleSendReply = () => {
    if (!selectedThread || !replyMessage.trim()) return;
    
    sendReplyMutation.mutate({
      userId: selectedThread.user_id,
      message: replyMessage.trim()
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'active': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const totalUnreadCount = threads?.reduce((sum, thread) => sum + thread.unread_count, 0) || 0;

  return (
    <AdminLayout title="Communications">
      <div className="space-y-6">
        {/* Header with statistics */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Communications</h1>
            </div>
            {totalUnreadCount > 0 && (
              <Badge variant="destructive" className="flex items-center space-x-1">
                <Bell className="h-3 w-3" />
                <span>{totalUnreadCount} unread</span>
              </Badge>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversations List */}
          <Card>
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>
                {isLoading ? 'Loading...' : `${threads?.length || 0} total conversations`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading conversations...
                  </div>
                ) : threads?.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No conversations found
                  </div>
                ) : (
                  threads?.map((thread) => (
                    <div
                      key={thread.user_id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedThread?.user_id === thread.user_id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedThread(thread)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium truncate">{thread.user_name}</span>
                            {thread.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {thread.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {thread.last_message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {format(new Date(thread.last_message_time), 'MMM d, HH:mm')}
                            </span>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(thread.status)}
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(thread.priority)}`} />
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 ml-2" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Conversation Detail */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedThread ? `Conversation with ${selectedThread.user_name}` : 'Select a Conversation'}
              </CardTitle>
              {selectedThread && (
                <CardDescription>
                  {selectedThread.user_email} • {selectedThread.messages.length} messages
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {selectedThread ? (
                <div className="flex flex-col h-[600px]">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedThread.messages
                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.created_by === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.created_by === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {format(new Date(message.created_at), 'MMM d, HH:mm')} •{' '}
                              {message.created_by === user?.id ? 'You' : 'Client'}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>

                  <Separator />

                  {/* Reply Input */}
                  <div className="p-4">
                    <div className="flex space-x-2">
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        className="flex-1 min-h-[80px]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            handleSendReply();
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyMessage.trim() || sendReplyMutation.isPending}
                        className="self-end"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Press Ctrl+Enter to send
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a conversation to view messages</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCommunications;