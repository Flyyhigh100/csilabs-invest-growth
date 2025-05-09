
import React from 'react';
import LegalPageLayout from '@/components/Legal/LegalPageLayout';

const FoundationDisclosure: React.FC = () => {
  return (
    <LegalPageLayout title="Foundation Disclosure">
      <div className="prose prose-slate max-w-none">
        <p className="mb-4" id="foundation-status">
          1-Million Strong Killing Cancers Foundation ("Foundation") is a Wyoming not for profit 
          foundation with 501(c)3 status pending. As such the Foundation does not warrant or promise 
          any tax deductible status of any token purchase and merely represents that it's token offering 
          is a "meme coin" of it's own intrinsic value and that the offering of the same is a not for 
          profit venture of which a portion of the proceeds will be given to Cannabis Science to advance 
          it's extensive portfolio of cannabis based cancer treatment research. 
        </p>
        <p className="mb-4" id="tax-advice">
          Any token purchaser should consult their own tax professional that is familiar with their 
          specific situation as well as the above.
        </p>
      </div>
    </LegalPageLayout>
  );
};

export default FoundationDisclosure;
