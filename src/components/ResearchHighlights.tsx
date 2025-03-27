
import React from 'react';
import FadeInSection from './FadeInSection';
import FeatureCard from './FeatureCard';
import { BeakerIcon, BrainCircuit, FilePieChart, TrendingUp } from 'lucide-react';

const ResearchHighlights: React.FC = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <FadeInSection>
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider uppercase rounded-full text-cbis-blue bg-blue-50 border border-blue-100">
              Proven Cancer-Fighting Results
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-cbis-dark">
              Our Research Has Already Killed Cancer Cells
            </h2>
            <p className="text-gray-600">
              Our cannabinoid-based treatments have demonstrated remarkable efficacy in eliminating cancer cells across multiple studies. We're now advancing toward FDA-approved clinical trials.
            </p>
          </div>
        </FadeInSection>

        <div className="grid md:grid-cols-2 gap-8">
          <FadeInSection delay={100} direction="left">
            <FeatureCard
              title="Cancer Cell Elimination"
              description="Laboratory studies have confirmed our compounds successfully eliminate cancer cells, with particular efficacy against breast, prostate, and colon cancer cell lines."
              icon={<BeakerIcon className="h-8 w-8" />}
            />
          </FadeInSection>

          <FadeInSection delay={200} direction="right">
            <FeatureCard
              title="Harvard Research Validation"
              description="Our research methodologies and preliminary results have been validated by Harvard Medical School researchers, confirming the scientific rigor of our approach."
              icon={<BrainCircuit className="h-8 w-8" />}
            />
          </FadeInSection>

          <FadeInSection delay={300} direction="left">
            <FeatureCard
              title="FDA Clinical Trial Pathway"
              description="We've established a clear regulatory pathway with the FDA for our cancer treatments, with pre-IND meetings scheduled and clinical trial protocols in development."
              icon={<FilePieChart className="h-8 w-8" />}
            />
          </FadeInSection>

          <FadeInSection delay={400} direction="right">
            <FeatureCard
              title="Advancing to Human Trials"
              description="Funds raised through our token sale will directly support Phase I clinical trials, the critical next step in bringing our cancer-fighting treatments to patients worldwide."
              icon={<TrendingUp className="h-8 w-8" />}
            />
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};

export default ResearchHighlights;
