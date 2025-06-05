
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, HelpCircle, Shield, Clock } from 'lucide-react';

const FAQSection: React.FC = () => {
  const faqs = [
    {
      category: "Wallet Setup",
      icon: <Shield className="h-4 w-4" />,
      questions: [
        {
          question: "Which wallet should I choose?",
          answer: "For CSI token purchases, we recommend MetaMask for Polygon network transactions or Phantom for Solana. MetaMask is more versatile and works with multiple networks, while Phantom is optimized specifically for Solana."
        },
        {
          question: "I lost my seed phrase, what should I do?",
          answer: "Unfortunately, if you lose your seed phrase and can't access your wallet, the funds are typically unrecoverable. This is why it's crucial to write down and securely store your seed phrase when creating a wallet. Always keep multiple secure backup copies."
        },
        {
          question: "How do I add the Polygon network to MetaMask?",
          answer: "Go to MetaMask settings > Networks > Add Network. Use these details: Network Name: Polygon Mainnet, RPC URL: https://polygon-rpc.com/, Chain ID: 137, Currency Symbol: MATIC, Block Explorer: https://polygonscan.com/"
        },
        {
          question: "Why can't I see my USDC balance?",
          answer: "You may need to manually add the USDC token to your wallet. In MetaMask, click 'Import tokens' and enter the USDC contract address for your network. For Polygon: 0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
        }
      ]
    },
    {
      category: "Buying Crypto",
      icon: <HelpCircle className="h-4 w-4" />,
      questions: [
        {
          question: "What's the easiest way to buy crypto for CSI tokens?",
          answer: "Use our Stripe integration in the 'Purchase Tokens' section. It allows you to buy crypto directly with your credit/debit card and sends it straight to your wallet. No exchange account needed."
        },
        {
          question: "Why do crypto purchases have fees?",
          answer: "Fees cover payment processing, blockchain transaction costs, and platform maintenance. Card purchases typically have 2-5% fees for convenience, while bank transfers have lower fees but take longer."
        },
        {
          question: "How long does it take to receive crypto?",
          answer: "With our Stripe integration, crypto is delivered instantly to your wallet. Exchange purchases may take 1-3 business days for bank transfers, but card purchases are usually instant."
        },
        {
          question: "What if my crypto purchase fails?",
          answer: "Failed purchases are usually due to card restrictions, insufficient funds, or wallet address errors. Check your payment method, ensure your wallet address is correct, and try again. Contact support if issues persist."
        }
      ]
    },
    {
      category: "CSI Token Purchase",
      icon: <Clock className="h-4 w-4" />,
      questions: [
        {
          question: "What crypto do I need to buy CSI tokens?",
          answer: "You can purchase CSI tokens with USDC on Polygon network or SOL/USDC on Solana network. USDC is recommended as it's a stable cryptocurrency that doesn't fluctuate in value."
        },
        {
          question: "How much crypto should I buy?",
          answer: "Buy slightly more than the token amount you want to purchase to cover transaction fees. For example, if buying $100 worth of tokens, consider purchasing $105-110 worth of crypto to ensure you have enough for fees."
        },
        {
          question: "Why do I need a wallet address?",
          answer: "Your wallet address is where we'll send your CSI tokens after purchase. It's like your crypto bank account number. Make sure to provide the correct address for the network you're using (Polygon or Solana)."
        },
        {
          question: "How long until I receive my CSI tokens?",
          answer: "Token distribution is handled manually by our team after payment verification. You'll typically receive your tokens within 24-48 hours and get an email notification when they're sent."
        }
      ]
    },
    {
      category: "Security & Troubleshooting",
      icon: <AlertTriangle className="h-4 w-4" />,
      questions: [
        {
          question: "How do I keep my wallet secure?",
          answer: "Never share your seed phrase or private keys. Use official wallet websites only. Enable two-factor authentication where available. Start with small amounts when testing. Always verify website URLs before entering wallet information."
        },
        {
          question: "What if I sent crypto to the wrong address?",
          answer: "Crypto transactions are irreversible. Double-check addresses before sending. If you sent to a wrong address, the funds are typically unrecoverable. Always test with small amounts first."
        },
        {
          question: "My transaction is stuck or taking too long",
          answer: "Blockchain networks can be congested. Check the network status and your transaction on a block explorer. You may need to increase the gas fee for faster processing, or simply wait for network congestion to clear."
        },
        {
          question: "I'm getting 'insufficient funds' errors",
          answer: "This usually means you don't have enough crypto to cover the transaction and fees. Ensure you have slightly more than the required amount in your wallet to account for network fees."
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Frequently Asked Questions</h2>
        <p className="text-gray-600">
          Find answers to common questions about wallet setup, crypto purchases, and CSI token buying
        </p>
      </div>

      {faqs.map((category, categoryIndex) => (
        <Card key={categoryIndex}>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              {category.icon}
              <h3 className="font-semibold text-lg">{category.category}</h3>
              <Badge variant="outline">{category.questions.length} questions</Badge>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {category.questions.map((faq, index) => (
                <AccordionItem key={index} value={`${categoryIndex}-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ))}

      {/* Still Need Help */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold text-blue-900 mb-2">Still Need Help?</h3>
          <p className="text-blue-700 mb-4">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/contact" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2">
              Contact Support
            </a>
            <a href="mailto:support@csilabs.co" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-blue-300 bg-white text-blue-700 hover:bg-blue-100 h-10 px-4 py-2">
              Email Us Directly
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQSection;
