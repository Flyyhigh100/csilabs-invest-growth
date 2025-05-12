
import { FC } from 'react';
import { BeakerIcon } from 'lucide-react';

export const TestIcon: FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <BeakerIcon className="h-full w-full" />
  </div>
);

// Export a Lucide-compatible version of the icon
export const TestIconLucide = BeakerIcon;

export default TestIcon;
