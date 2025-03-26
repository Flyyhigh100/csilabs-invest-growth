
import React from 'react';
import FadeInSection from './FadeInSection';
import FeatureCard from './FeatureCard';
import { Flask, BrainCircuit, Building2, TrendingUp } from 'lucide-react';

const ResearchHighlights: React.FC = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <FadeInSection>
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider uppercase rounded-full text-cbis-blue bg-blue-50 border border-blue-100">
              Harvard-Validated Research
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-cbis-dark">
              Pioneering Cancer Treatments Through Innovation
            </h2>
            <p className="text-gray-600">
              Our research focuses on developing cannabinoid-based drugs for cancer treatment, with validation from Harvard Medical School researchers and ongoing laboratory acquisitions.
            </p>
          </div>
        </FadeInSection>

        <div className="grid md:grid-cols-2 gap-8">
          <FadeInSection delay={100} direction="left">
            <FeatureCard
              title="Harvard-Validated Research"
              description="Our research has been validated by Harvard Medical School researchers, providing scientific credibility to our cannabinoid-based cancer treatment approaches."
              icon={<BrainCircuit className="h-8 w-8" />}
            />
          </FadeInSection>

          <FadeInSection delay={200} direction="right">
            <FeatureCard
              title="Laboratory Acquisitions"
              description="We are actively negotiating the purchase of research laboratories in Las Vegas and California to expand our capabilities and accelerate drug development."
              icon={<Building2 className="h-8 w-8" />}
            />
          </FadeInSection>

          <FadeInSection delay={300} direction="left">
            <FeatureCard
              title="Advanced Drug Development"
              description="Our focus is on developing cannabinoid-based pharmaceuticals targeting various cancer types, with an emphasis on efficacy and minimal side effects."
              icon={<Flask className="h-8 w-8" />}
            />
          </FadeInSection>

          <FadeInSection delay={400} direction="right">
            <FeatureCard
              title="FDA Approval Process"
              description="Funds raised through our token sale will directly support our FDA approval process, bringing our treatments closer to market and helping patients worldwide."
              icon={<TrendingUp className="h-8 w-8" />}
            />
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};

export default ResearchHighlights;
