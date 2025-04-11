
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { IPNLog } from './types';
import IPNLogTable from './IPNLogTable';
import IPNLogEmptyState from './IPNLogEmptyState';
import IPNLogDetailsSheet from './IPNLogDetailsSheet';
import IPNLogLoadingState from './IPNLogLoadingState';
import IPNLogErrorState from './IPNLogErrorState';
import IPNLogHeader from './IPNLogHeader';

const IPNLogViewer: React.FC = () => {
  const [selectedLog, setSelectedLog] = useState<IPNLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { data: logs, isLoading, error, refetch } = useQuery({
    queryKey: ['ipn-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ipn_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as IPNLog[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  const handleViewDetails = (log: IPNLog) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  if (isLoading) {
    return <IPNLogLoadingState />;
  }

  if (error) {
    return <IPNLogErrorState error={error as Error} />;
  }

  return (
    <div>
      <IPNLogHeader onRefresh={() => refetch()} />
      
      {logs && logs.length === 0 ? (
        <IPNLogEmptyState />
      ) : (
        <IPNLogTable logs={logs || []} onViewDetails={handleViewDetails} />
      )}
      
      <IPNLogDetailsSheet 
        log={selectedLog}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
};

export default IPNLogViewer;
