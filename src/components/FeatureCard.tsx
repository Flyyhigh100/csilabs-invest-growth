
import React from 'react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
  accentColor?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  className,
  accentColor = 'bg-gradient-to-r from-cbis-blue to-cbis-teal'
}) => {
  return (
    <div className={cn(
      "glass-card relative overflow-hidden p-6 rounded-xl transition-all duration-300 hover:shadow-elevation",
      className
    )}>
      <div className={cn(
        "absolute top-0 left-0 h-1 w-full",
        accentColor
      )} />
      
      {icon && (
        <div className="mb-4 text-cbis-blue">
          {icon}
        </div>
      )}
      
      <h3 className="text-xl font-semibold mb-2 text-cbis-dark">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;
