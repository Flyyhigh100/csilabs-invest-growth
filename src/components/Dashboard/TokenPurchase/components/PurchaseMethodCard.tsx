
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
  disabled = false,
  badgeText,
  badgeVariant = 'default',
  highlight = false,
  className,
  children
}) => {
  // Special case for direct charitable contribution
  const finalButtonLabel = title === "Direct Charitable Contribution" 
    ? "Choose Contribution Amount" 
    : buttonLabel;

  return (
    <Card className={cn(
      "transition-all", 
      highlight && "border-cbis-blue shadow-md",
      className
    )}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${highlight ? 'bg-cbis-blue text-white' : 'bg-blue-50 text-cbis-blue'}`}>
            {icon}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg">{title}</h3>
              {badgeText && (
                <Badge variant={badgeVariant} className="ml-2">
                  {badgeText}
                </Badge>
              )}
            </div>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        
        {children && <div className="mt-2">{children}</div>}
        
        <Button 
          onClick={onClick} 
          disabled={disabled} 
          className={cn(
            "w-full", 
            highlight && "bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90 text-white"
          )}
          variant={highlight ? "default" : "outline"}
        >
          {finalButtonLabel}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PurchaseMethodCard;
