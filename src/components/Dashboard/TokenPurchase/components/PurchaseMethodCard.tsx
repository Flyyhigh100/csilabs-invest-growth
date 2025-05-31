
import React, { ReactNode } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { Star } from 'lucide-react';

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
  
  // Check if this is the promotional banner
  const isPromoBanner = badgeText?.toLowerCase().includes('limited time');
  
  return (
    <Card className={cn(
      "transition-all h-full", 
      highlight && "border-cbis-blue shadow-md",
      className
    )}>
      <CardContent className="p-5 space-y-4 flex flex-col h-full">
        {/* Badge positioned at the top when present */}
        {badgeText && (
          <div className="flex justify-center">
            {isPromoBanner ? (
              <div className={cn(
                "relative px-4 py-2 rounded-full text-center font-bold text-lg",
                "bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400",
                "text-black border-2 border-yellow-600 shadow-lg",
                "animate-pulse transform hover:scale-105 transition-all duration-300",
                "flex items-center gap-2"
              )}>
                <Star className="h-5 w-5 fill-current animate-spin" style={{ animationDuration: '3s' }} />
                <span className="font-extrabold tracking-wide">
                  {badgeText.toUpperCase()}
                </span>
                <Star className="h-5 w-5 fill-current animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
                
                {/* Glowing effect */}
                <div className="absolute inset-0 rounded-full bg-yellow-300 opacity-30 blur-sm animate-pulse"></div>
              </div>
            ) : (
              <Badge 
                variant={badgeVariant} 
                className={cn(
                  "text-xs text-center",
                  badgeVariant === 'secondary' && highlight && "bg-cbis-teal/20 text-cbis-teal border-cbis-teal/30"
                )}
              >
                {badgeText}
              </Badge>
            )}
          </div>
        )}
        
        <div className={cn(
          "flex items-start gap-4",
          isMobile && "flex-col"
        )}>
          <div className={`p-3 rounded-full flex-shrink-0 ${highlight ? 'bg-cbis-blue text-white' : 'bg-blue-50 text-cbis-blue'}`}>
            {icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-lg">{title}</h3>
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
