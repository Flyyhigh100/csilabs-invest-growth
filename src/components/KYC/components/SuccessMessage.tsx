
import React from 'react';

interface SuccessMessageProps {
  show: boolean;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ show }) => {
  if (!show) return null;
  
  return (
    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
      <p className="text-green-800 text-sm">
        Your verification has been submitted successfully and is now pending review.
        You will be redirected to the status page shortly.
      </p>
    </div>
  );
};

export default SuccessMessage;
