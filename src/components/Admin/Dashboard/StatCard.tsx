
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  linkTo: string;
  linkText: string;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  linkTo, 
  linkText,
  highlight = false
}) => {
  const cardClasses = highlight 
    ? "border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100 transition-all hover:shadow-md hover:border-amber-400" 
    : "transition-all hover:shadow-md hover:border-gray-300";

  return (
    <Link to={linkTo} className="block">
      <Card className={cardClasses}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              {icon}
            </div>
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
          </div>
          <div className="mt-3">
            <h4 className="text-lg font-bold">{value}</h4>
            <div className="flex items-center text-xs mt-1 text-muted-foreground">
              <span className={highlight ? "text-amber-700" : ""}>{linkText}</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default StatCard;
