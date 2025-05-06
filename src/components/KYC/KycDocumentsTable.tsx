
import React from 'react';
import { FileText, Download, Eye, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getKycDocumentUrl } from '@/utils/admin/kyc/documents';
import { formatDate } from '@/utils/date';

interface KycDocumentsTableProps {
  documentUrls: {
    id_front_url: string | null;
    id_back_url: string | null;
    selfie_url: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

const KycDocumentsTable: React.FC<KycDocumentsTableProps> = ({ 
  documentUrls, 
  createdAt, 
  updatedAt 
}) => {
  const documents = [
    {
      id: 'id-front',
      name: 'ID Document (Front)',
      type: 'Image',
      url: documentUrls.id_front_url,
      date: updatedAt
    },
    {
      id: 'id-back',
      name: 'ID Document (Back)',
      type: 'Image',
      url: documentUrls.id_back_url,
      date: updatedAt
    },
    {
      id: 'selfie',
      name: 'Selfie with ID',
      type: 'Image',
      url: documentUrls.selfie_url,
      date: updatedAt
    }
  ];

  const handleViewDocument = async (url: string | null) => {
    if (!url) return;
    
    try {
      const publicUrl = await getKycDocumentUrl(url);
      if (publicUrl) {
        window.open(publicUrl, '_blank');
      }
    } catch (error) {
      console.error('Error opening document:', error);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Your Verification Documents</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date Submitted</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Document</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>{formatDate(doc.date)}</TableCell>
              <TableCell>{doc.type}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                  {doc.name}
                </div>
              </TableCell>
              <TableCell>
                {doc.url ? (
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewDocument(doc.url)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDocument(doc.url)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-400">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Not Submitted
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default KycDocumentsTable;
