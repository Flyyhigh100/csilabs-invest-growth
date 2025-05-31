
import React, { ReactNode } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { Sparkles } from 'lucide-react';

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
      "transition-all duration-300 h-full group", 
      highlight && "border-cbis-blue shadow-md hover:shadow-xl hover:scale-[1.02]",
      className
    )}>
      <CardContent className="p-5 space-y-4 flex flex-col h-full">
        {/* Enhanced Animated Badge */}
        {badgeText && (
          <div className="flex justify-center -mt-1">
            <div className={cn(
              "relative overflow-hidden rounded-full",
              highlight && "animate-pulse-subtle"
            )}>
              <Badge 
                className={cn(
                  "text-xs text-center font-bold px-4 py-2 border-0 relative",
                  "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500",
                  "text-white shadow-lg",
                  highlight && [
                    "animate-pulse-glow",
                    "group-hover:scale-105 transition-transform duration-300",
                    "before:absolute before:inset-0 before:bg-gradient-to-r",
                    "before:from-transparent before:via-white/30 before:to-transparent",
                    "before:animate-shimmer before:bg-[length:200%_100%]"
                  ]
                )}
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  <span className="relative z-10">{badgeText}</span>
                  <Sparkles className="h-3 w-3 animate-pulse" />
                </div>
              </Badge>
            </div>
          </div>
        )}
        
        <div className={cn(
          "flex items-start gap-4",
          isMobile && "flex-col"
        )}>
          <div className={`p-3 rounded-full flex-shrink-0 transition-all duration-300 ${
            highlight 
              ? 'bg-cbis-blue text-white group-hover:bg-cbis-teal group-hover:scale-110' 
              : 'bg-blue-50 text-cbis-blue'
          }`}>
            {icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-medium text-lg transition-colors duration-300",
              highlight && "group-hover:text-cbis-blue"
            )}>
              {title}
            </h3>
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
                "w-full mt-auto transition-all duration-300", 
                highlight && [
                  "bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90 text-white",
                  "hover:shadow-lg hover:scale-[1.02]"
                ]
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
