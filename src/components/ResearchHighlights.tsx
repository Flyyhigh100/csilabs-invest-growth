
import React from 'react';
import FadeInSection from './FadeInSection';
import FeatureCard from './FeatureCard';
import { BeakerIcon, BrainCircuit, FilePieChart, TrendingUp, DollarSign, ShieldCheck } from 'lucide-react';

const ResearchHighlights: React.FC = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <FadeInSection>
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider uppercase rounded-full text-cbis-blue bg-blue-50 border border-blue-100">
              Affordable Cancer Treatment
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-cbis-dark">
              Making Cancer Treatment Affordable For Millions
            </h2>
            <p className="text-gray-600">
              Our treatments are designed to be accessible to the millions of cancer patients who cannot afford today's high-cost drugs, providing effective cancer cell elimination without the harsh side effects of chemical therapies.
            </p>
          </div>
        </FadeInSection>

        <div className="grid md:grid-cols-2 gap-8">
          <FadeInSection delay={100} direction="left">
            <FeatureCard
              title="Affordable Treatment"
              description="Unlike traditional cancer drugs that cost patients thousands per month, our treatments are designed to be affordable and accessible to millions of patients worldwide."
              icon={<DollarSign className="h-8 w-8" />}
            />
          </FadeInSection>

          <FadeInSection delay={200} direction="right">
            <FeatureCard
              title="No Harsh Side Effects"
              description="Our cannabinoid-based treatments work without the debilitating side effects commonly associated with chemical cancer therapies, improving patient quality of life."
              icon={<ShieldCheck className="h-8 w-8" />}
            />
          </FadeInSection>

          <FadeInSection delay={300} direction="left">
            <FeatureCard
              title="FDA Clinical Trial Pathway"
              description="We've established a clear regulatory pathway with the FDA for our affordable cancer treatments, with pre-IND meetings scheduled and clinical trial protocols in development."
              icon={<FilePieChart className="h-8 w-8" />}
            />
          </FadeInSection>

          <FadeInSection delay={400} direction="right">
            <FeatureCard
              title="Proven Cancer Cell Elimination"
              description="Laboratory studies have confirmed our compounds successfully eliminate cancer cells, with results validated by Harvard Medical School researchers."
              icon={<BeakerIcon className="h-8 w-8" />}
            />
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};

export default ResearchHighlights;
