
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  linkTo: string;
  linkText: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  linkTo, 
  linkText 
}) => {
  const navigate = useNavigate();

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">
            {value}
          </div>
          <div className="h-8 w-8">
            {icon}
          </div>
        </div>
        <Button 
          variant="link" 
          className="p-0 h-auto text-sm mt-2"
          onClick={() => navigate(linkTo)}
        >
          {linkText} <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default StatCard;
