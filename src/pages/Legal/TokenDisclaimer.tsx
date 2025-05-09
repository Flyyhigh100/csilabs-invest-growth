
import React from 'react';
import LegalPageLayout from '@/components/Legal/LegalPageLayout';

const TokenDisclaimer: React.FC = () => {
  return (
    <LegalPageLayout title="Token Disclaimer">
      <div className="prose prose-slate max-w-none">
        <p className="mb-4" id="disclaimer-intro">
          Please be aware that participation in this token sale carries a risk of financial loss. 
          Cryptocurrencies are highly volatile and can fluctuate significantly in value. Buyers 
          should conduct their own thorough research and consult with financial professionals to 
          assess the risks involved before purchasing digital assets.
        </p>
        <p className="mb-4" id="disclaimer-advice">
          We advise prudence and caution when participating in the cryptocurrency market. CBIS coin is a meme coin 
          sold as a fun way to support cancer research and makes no promises of return on investment, profit share, 
          or other guarantees of money making potential.
        </p>
      </div>
    </LegalPageLayout>
  );
};

export default TokenDisclaimer;
