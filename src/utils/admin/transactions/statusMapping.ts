
export const mapStatusToBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'confirmed':
      return 'default'; // Green
    case 'pending':
      return 'secondary'; // Gray
    case 'failed':
    case 'cancelled':
    case 'expired':
      return 'destructive'; // Red
    case 'processing':
      return 'outline'; // Blue outline
    default:
      return 'secondary';
  }
};

export const getStatusDisplayName = (status: string) => {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'Confirmed';
    case 'completed':
      return 'Completed';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
    case 'expired':
      return 'Expired';
    case 'processing':
      return 'Processing';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};
