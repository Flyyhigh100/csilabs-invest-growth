
import { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps extends ButtonProps {
  value: string;
}

export const CopyButton = ({
  value,
  className,
  variant = "default",
  size = "default",
  ...props
}: CopyButtonProps) => {
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(value);
    setHasCopied(true);
    
    // Reset copy status after 2 seconds
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={copyToClipboard}
      {...props}
    >
      {hasCopied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
};
