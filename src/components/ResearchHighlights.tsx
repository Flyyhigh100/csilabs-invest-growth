
import React from 'react';
import { Link } from 'react-router-dom';
import FadeInSection from './FadeInSection';
import FeatureCard from './FeatureCard';
import { BeakerIcon, BrainCircuit, FilePieChart, TrendingUp, DollarSign, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';

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
              Your Support will help make Cancer Treatments Affordable For Millions
            </h2>
            <p className="text-gray-600">Our treatments are designed to be accessible to the millions of cancer patients who cannot afford today's high-cost drugs, providing effective cancer cell elimination without the harsh side effects of chemical therapies. Our next Steps are academic, our Award Winning pre-clinical and clinical work at Harvard and other institutions will make up our pharmacokinetics, clinical translation, and protocols. All of this work will be infused into our FDA IND# application seeking approvals begin formal human clinical trials.</p>
            
            <FadeInSection delay={150}>
              <div className="mt-8">
                <Button
                  asChild
                  size="lg"
                  className="px-6 py-3 font-medium text-white bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90 transition-all"
                >
                  <Link to="/auth/register">Support Killing Cancers Contribute Now</Link>
                </Button>
              </div>
            </FadeInSection>
          </div>
        </FadeInSection>

        <div className="grid md:grid-cols-2 gap-8">
          <FadeInSection delay={100} direction="left">
            <FeatureCard title="Affordable Treatment" description="Unlike traditional cancer drugs that cost patients thousands per month, our treatments are designed to be affordable and accessible to millions of patients worldwide." icon={<DollarSign className="h-8 w-8" />} />
          </FadeInSection>

          <FadeInSection delay={200} direction="right">
            <FeatureCard title="No Harsh Side Effects" description="Our cannabinoid-based treatments work without the debilitating side effects commonly associated with chemical cancer therapies, improving patient quality of life." icon={<ShieldCheck className="h-8 w-8" />} />
          </FadeInSection>

          <FadeInSection delay={300} direction="left">
            <FeatureCard title="FDA Clinical Trials Pathway" description="We've established a clear regulatory pathway with the FDA to bring our affordable cancer killing treatments to market. This will allow Doctors Nationwide to write prescriptions for our groundbreaking low-cost cancer killing drugs approved through the FDA clinicals." icon={<FilePieChart className="h-8 w-8" />} />
          </FadeInSection>

          <FadeInSection delay={400} direction="right">
            <FeatureCard title="Proven Cancer Cell Elimination" description="Laboratory studies have confirmed our compounds successfully eliminate cancer cells, with results validated by Harvard Medical School researchers." icon={<BeakerIcon className="h-8 w-8" />} />
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};

export default ResearchHighlights;
