
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ResearchDocumentUploader from '@/components/Admin/ResearchDocumentUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ResearchPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Research Documents</h1>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => navigate('/admin')}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5 text-blue-600" />
              Research Documents
            </CardTitle>
            <CardDescription>
              Upload and manage research documents that are displayed on the website.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              The uploaded PDF will be available through the "View Research Data" button on the homepage.
              Only PDF files are supported. The most recent upload will replace any previous document.
            </p>
            
            <div className="mt-6">
              <ResearchDocumentUploader />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResearchPage;
