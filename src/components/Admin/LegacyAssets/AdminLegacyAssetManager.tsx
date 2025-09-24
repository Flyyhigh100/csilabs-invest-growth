import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AdminLegacyAssetContent } from './AdminLegacyAssetContent';

interface AdminLegacyAssetManagerProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

const AdminLegacyAssetManager: React.FC<AdminLegacyAssetManagerProps> = ({
  isOpen,
  onClose,
  user
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <AdminLegacyAssetContent user={user} />
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminLegacyAssetManager;