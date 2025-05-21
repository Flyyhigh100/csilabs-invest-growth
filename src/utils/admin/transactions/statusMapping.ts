
/**
 * Maps transaction status to badge variant
 */
export const mapStatusToBadgeVariant = (status: string): "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "info" => {
  const lowerStatus = status.toLowerCase();
  
  if (lowerStatus === 'completed' || lowerStatus === 'confirmed') {
    return 'success';
  }
  
  if (lowerStatus === 'pending' || lowerStatus === 'processing') {
    return 'warning';
  }
  
  if (lowerStatus === 'cancelled' || lowerStatus === 'failed' || lowerStatus === 'expired') {
    return 'destructive';
  }
  
  if (lowerStatus === 'initiated' || lowerStatus === 'created') {
    return 'info';
  }
  
  return 'default';
};
