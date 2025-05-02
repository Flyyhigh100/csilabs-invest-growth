
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Coins } from 'lucide-react';

interface CoinPaymentsSetupButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const CoinPaymentsSetupButton: React.FC<CoinPaymentsSetupButtonProps> = ({ 
  className, 
  variant = 'default',
  size = 'default'
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/coinpayments-setup');
  };
  
  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={className}
    >
      <Coins className="mr-2 h-4 w-4" />
      Setup CoinPayments
    </Button>
  );
};

export default CoinPaymentsSetupButton;
