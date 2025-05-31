
import React, { ReactNode } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  return (
    <Card className={cn(
      "transition-all h-full", 
      highlight && "border-cbis-blue shadow-md",
      className
    )}>
      <CardContent className="p-5 space-y-4 flex flex-col h-full">
        <div className={cn(
          "flex items-start gap-4",
          isMobile && "flex-col"
        )}>
          <div className={`p-3 rounded-full flex-shrink-0 ${highlight ? 'bg-cbis-blue text-white' : 'bg-blue-50 text-cbis-blue'}`}>
            {icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-lg">{title}</h3>
              {badgeText && (
                <Badge 
                  variant={badgeVariant} 
                  className={cn(
                    "ml-auto whitespace-nowrap text-xs",
                    badgeVariant === 'secondary' && highlight && "bg-cbis-teal/20 text-cbis-teal border-cbis-teal/30"
                  )}
                >
                  {badgeText}
                </Badge>
              )}
            </div>
            <p className="text-gray-600 mt-1 break-normal hyphens-manual">
              {description}
            </p>
          </div>
        </div>
        
        {children && <div className="mt-2">{children}</div>}
        
        {buttonLabel && (
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
              <span className="inline-block">{buttonLabel}</span>
              {buttonSuffix && <span className="ml-1 inline-block">{buttonSuffix}</span>}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PurchaseMethodCard;
