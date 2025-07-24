import React, { useState } from 'react';
import { Plus, CheckCircle, Clock, AlertCircle, Calendar, User } from 'lucide-react';
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
import { format, isAfter, isBefore, addDays } from 'date-fns';

interface FollowUp {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date: string;
  priority: string;
  status: string;
  completed_at?: string;
  completed_by?: string;
  created_by: string;
  related_note_id?: string;
  related_interaction_id?: string;
  created_at: string;
  updated_at: string;
}

interface FollowUpManagerProps {
  clientId: string;
}

const FollowUpManager: React.FC<FollowUpManagerProps> = ({ clientId }) => {
  const [isAddFollowUpOpen, setIsAddFollowUpOpen] = useState(false);
  const queryClient = useQueryClient();

  // Form state
  const [followUpForm, setFollowUpForm] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'normal'
  });

  // Fetch follow-ups
  const { data: followUps = [], isLoading } = useQuery({
    queryKey: ['follow-ups', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .eq('user_id', clientId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as FollowUp[];
    }
  });

  // Add follow-up mutation
  const addFollowUpMutation = useMutation({
    mutationFn: async (followUpData: any) => {
      const { data, error } = await supabase
        .from('follow_ups')
        .insert({
          user_id: clientId,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          ...followUpData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-ups', clientId] });
      setIsAddFollowUpOpen(false);
      setFollowUpForm({
        title: '',
        description: '',
        due_date: '',
        priority: 'normal'
      });
      toast.success('Follow-up created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create follow-up');
      console.error('Error creating follow-up:', error);
    }
  });

  // Complete follow-up mutation
  const completeFollowUpMutation = useMutation({
    mutationFn: async (followUpId: string) => {
      const { data, error } = await supabase
        .from('follow_ups')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', followUpId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-ups', clientId] });
      toast.success('Follow-up completed');
    },
    onError: (error) => {
      toast.error('Failed to complete follow-up');
      console.error('Error completing follow-up:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFollowUpMutation.mutate(followUpForm);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusIcon = (followUp: FollowUp) => {
    if (followUp.status === 'completed') {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    
    const dueDate = new Date(followUp.due_date);
    const today = new Date();
    
    if (isBefore(dueDate, today)) {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    } else if (isBefore(dueDate, addDays(today, 3))) {
      return <Clock className="h-4 w-4 text-yellow-600" />;
    }
    
    return <Calendar className="h-4 w-4 text-blue-600" />;
  };

  const getStatusText = (followUp: FollowUp) => {
    if (followUp.status === 'completed') {
      return 'Completed';
    }
    
    const dueDate = new Date(followUp.due_date);
    const today = new Date();
    
    if (isBefore(dueDate, today)) {
      return 'Overdue';
    } else if (isBefore(dueDate, addDays(today, 3))) {
      return 'Due Soon';
    }
    
    return 'Scheduled';
  };

  const getStatusColor = (followUp: FollowUp) => {
    if (followUp.status === 'completed') {
      return 'bg-green-100 text-green-800';
    }
    
    const dueDate = new Date(followUp.due_date);
    const today = new Date();
    
    if (isBefore(dueDate, today)) {
      return 'bg-red-100 text-red-800';
    } else if (isBefore(dueDate, addDays(today, 3))) {
      return 'bg-yellow-100 text-yellow-800';
    }
    
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Follow-Up Tasks</CardTitle>
            <CardDescription>Manage scheduled follow-ups and reminders</CardDescription>
          </div>
          <Dialog open={isAddFollowUpOpen} onOpenChange={setIsAddFollowUpOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Follow-Up
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Follow-Up Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={followUpForm.title}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, title: e.target.value })}
                    placeholder="Follow-up task title"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={followUpForm.description}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, description: e.target.value })}
                    placeholder="Details about what needs to be done"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Due Date</label>
                    <Input
                      type="date"
                      value={followUpForm.due_date}
                      onChange={(e) => setFollowUpForm({ ...followUpForm, due_date: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={followUpForm.priority} onValueChange={(value) => setFollowUpForm({ ...followUpForm, priority: value })}>
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

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddFollowUpOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addFollowUpMutation.isPending}>
                    Create Follow-Up
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading follow-ups...</p>
        ) : followUps.length === 0 ? (
          <p className="text-muted-foreground">No follow-ups scheduled. Create your first follow-up task.</p>
        ) : (
          <div className="space-y-3">
            {followUps.map((followUp) => (
              <div 
                key={followUp.id} 
                className={`border rounded-lg p-4 space-y-3 ${
                  followUp.status === 'completed' ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(followUp)}
                    <h4 className={`font-medium ${followUp.status === 'completed' ? 'line-through' : ''}`}>
                      {followUp.title}
                    </h4>
                    <Badge className={getPriorityColor(followUp.priority)}>
                      {followUp.priority}
                    </Badge>
                    <Badge className={getStatusColor(followUp)}>
                      {getStatusText(followUp)}
                    </Badge>
                  </div>
                  {followUp.status !== 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => completeFollowUpMutation.mutate(followUp.id)}
                      disabled={completeFollowUpMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  )}
                </div>
                
                {followUp.description && (
                  <p className="text-sm text-muted-foreground">{followUp.description}</p>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due: {format(new Date(followUp.due_date), 'MMM dd, yyyy')}
                  </div>
                  {followUp.completed_at && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Completed: {format(new Date(followUp.completed_at), 'MMM dd, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FollowUpManager;