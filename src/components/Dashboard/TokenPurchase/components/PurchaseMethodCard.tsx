
import React, { ReactNode } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PurchaseMethodCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
  buttonLabel: string;
  buttonSuffix?: string;
  disabled?: boolean;
  badgeText?: string;
  badgeVariant?: 'default' | 'outline' | 'secondary' | 'destructive';
  highlight?: boolean;
  className?: string;
  children?: ReactNode;
}

const PurchaseMethodCard: React.FC<PurchaseMethodCardProps> = ({
  title,
  description,
  icon,
  onClick,
  buttonLabel,
  buttonSuffix,
  disabled = false,
  badgeText,
  badgeVariant = 'default',
  highlight = false,
  className,
  children
}) => {
  return (
    <Card className={cn(
      "transition-all h-full", 
      highlight && "border-cbis-blue shadow-md",
      className
    )}>
      <CardContent className="p-5 space-y-4 flex flex-col h-full">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full flex-shrink-0 ${highlight ? 'bg-cbis-blue text-white' : 'bg-blue-50 text-cbis-blue'}`}>
            {icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <h3 className="font-medium text-lg">{title}</h3>
              {badgeText && (
                <Badge variant={badgeVariant} className="ml-auto whitespace-nowrap">
                  {badgeText}
                </Badge>
              )}
            </div>
            <p className="text-gray-600 mt-1 break-words">{description}</p>
          </div>
        </div>
        
        {children && <div className="mt-2">{children}</div>}
        
        <div className="mt-auto pt-2">
          <Button 
            onClick={onClick} 
            disabled={disabled} 
            className={cn(
              "w-full mt-auto", 
              highlight && "bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90 text-white"
            )}
            variant={highlight ? "default" : "outline"}
          >
            <span className="truncate">{buttonLabel}</span>
            {buttonSuffix && <span className="ml-1 whitespace-nowrap">{buttonSuffix}</span>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseMethodCard;
