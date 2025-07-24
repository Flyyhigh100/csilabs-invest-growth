import React, { useState } from 'react';
import { Plus, Phone, Video, Mail, MessageSquare, Calendar, Clock } from 'lucide-react';
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

interface ClientInteraction {
  id: string;
  interaction_type: string;
  title: string;
  description?: string;
  duration_minutes?: number;
  outcome?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  status: string;
  created_at: string;
}

interface InteractionHistoryProps {
  clientId: string;
}

const InteractionHistory: React.FC<InteractionHistoryProps> = ({ clientId }) => {
  const [isAddInteractionOpen, setIsAddInteractionOpen] = useState(false);
  const queryClient = useQueryClient();

  // Form state
  const [interactionForm, setInteractionForm] = useState({
    interaction_type: 'call',
    title: '',
    description: '',
    duration_minutes: '',
    outcome: '',
    follow_up_required: false,
    follow_up_date: ''
  });

  // Fetch client interactions
  const { data: interactions = [], isLoading } = useQuery({
    queryKey: ['client-interactions', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_interactions')
        .select('*')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ClientInteraction[];
    }
  });

  // Add interaction mutation
  const addInteractionMutation = useMutation({
    mutationFn: async (interactionData: any) => {
      const { data, error } = await supabase
        .from('client_interactions')
        .insert({
          user_id: clientId,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          ...interactionData,
          duration_minutes: interactionData.duration_minutes ? parseInt(interactionData.duration_minutes) : null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-interactions', clientId] });
      setIsAddInteractionOpen(false);
      setInteractionForm({
        interaction_type: 'call',
        title: '',
        description: '',
        duration_minutes: '',
        outcome: '',
        follow_up_required: false,
        follow_up_date: ''
      });
      toast.success('Interaction logged successfully');
    },
    onError: (error) => {
      toast.error('Failed to log interaction');
      console.error('Error adding interaction:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInteractionMutation.mutate(interactionForm);
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'video_call': return <Video className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-800';
      case 'video_call': return 'bg-purple-100 text-purple-800';
      case 'email': return 'bg-green-100 text-green-800';
      case 'meeting': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const startQuickCall = () => {
    const callTitle = `Call with ${clientId}`;
    setInteractionForm({
      ...interactionForm,
      interaction_type: 'call',
      title: callTitle
    });
    setIsAddInteractionOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Interaction History</CardTitle>
            <CardDescription>Track all client communications and meetings</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={startQuickCall}>
              <Phone className="h-4 w-4 mr-1" />
              Quick Call
            </Button>
            <Dialog open={isAddInteractionOpen} onOpenChange={setIsAddInteractionOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Log Interaction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Log New Interaction</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Interaction Type</label>
                    <Select value={interactionForm.interaction_type} onValueChange={(value) => setInteractionForm({ ...interactionForm, interaction_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Phone Call</SelectItem>
                        <SelectItem value="video_call">Video Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="meeting">In-Person Meeting</SelectItem>
                        <SelectItem value="message">Message/Chat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={interactionForm.title}
                      onChange={(e) => setInteractionForm({ ...interactionForm, title: e.target.value })}
                      placeholder="Interaction title"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={interactionForm.description}
                      onChange={(e) => setInteractionForm({ ...interactionForm, description: e.target.value })}
                      placeholder="What was discussed?"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Duration (minutes)</label>
                      <Input
                        type="number"
                        value={interactionForm.duration_minutes}
                        onChange={(e) => setInteractionForm({ ...interactionForm, duration_minutes: e.target.value })}
                        placeholder="30"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Outcome</label>
                      <Select value={interactionForm.outcome} onValueChange={(value) => setInteractionForm({ ...interactionForm, outcome: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select outcome" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="positive">Positive</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="needs_follow_up">Needs Follow-up</SelectItem>
                          <SelectItem value="issue_resolved">Issue Resolved</SelectItem>
                          <SelectItem value="no_answer">No Answer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={interactionForm.follow_up_required}
                      onChange={(e) => setInteractionForm({ ...interactionForm, follow_up_required: e.target.checked })}
                      className="rounded"
                    />
                    <label className="text-sm">Follow-up required</label>
                  </div>

                  {interactionForm.follow_up_required && (
                    <div>
                      <label className="text-sm font-medium">Follow-up Date</label>
                      <Input
                        type="date"
                        value={interactionForm.follow_up_date}
                        onChange={(e) => setInteractionForm({ ...interactionForm, follow_up_date: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddInteractionOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addInteractionMutation.isPending}>
                      Log Interaction
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading interactions...</p>
        ) : interactions.length === 0 ? (
          <p className="text-muted-foreground">No interactions logged yet. Start by logging your first interaction.</p>
        ) : (
          <div className="space-y-4">
            {interactions.map((interaction) => (
              <div key={interaction.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getInteractionIcon(interaction.interaction_type)}
                    <h4 className="font-medium">{interaction.title}</h4>
                    <Badge className={getInteractionColor(interaction.interaction_type)}>
                      {interaction.interaction_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {interaction.duration_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {interaction.duration_minutes}m
                      </div>
                    )}
                    <span>{format(new Date(interaction.created_at), 'MMM dd, HH:mm')}</span>
                  </div>
                </div>
                
                {interaction.description && (
                  <p className="text-sm text-muted-foreground">{interaction.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  {interaction.outcome && (
                    <Badge variant="outline" className="text-xs">
                      {interaction.outcome.replace('_', ' ')}
                    </Badge>
                  )}
                  {interaction.follow_up_required && interaction.follow_up_date && (
                    <div className="flex items-center gap-1 text-xs text-orange-600">
                      <Calendar className="h-3 w-3" />
                      Follow up: {format(new Date(interaction.follow_up_date), 'MMM dd, yyyy')}
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

export default InteractionHistory;