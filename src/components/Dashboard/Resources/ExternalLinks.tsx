
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, BookOpen, Video, FileText, Globe, Users } from 'lucide-react';

const ExternalLinks: React.FC = () => {
  const linkCategories = [
    {
      title: "Wallet Documentation",
      icon: <BookOpen className="h-5 w-5" />,
      description: "Official guides and documentation",
      links: [
        {
          name: "MetaMask User Guide",
          url: "https://metamask.io/faqs/",
          description: "Complete MetaMask setup and usage guide",
          type: "Guide"
        },
        {
          name: "Phantom Wallet Help",
          url: "https://help.phantom.app/",
          description: "Phantom wallet setup and troubleshooting",
          type: "Help Center"
        },
        {
          name: "Add Polygon to MetaMask",
          url: "https://polygon.technology/wallet",
          description: "Step-by-step network configuration",
          type: "Tutorial"
        }
      ]
    },
    {
      title: "Educational Resources",
      icon: <Video className="h-5 w-5" />,
      description: "Learn about cryptocurrency and blockchain",
      links: [
        {
          name: "Coinbase Learn",
          url: "https://www.coinbase.com/learn",
          description: "Comprehensive crypto education platform",
          type: "Course"
        },
        {
          name: "Binance Academy",
          url: "https://academy.binance.com/",
          description: "Free blockchain and crypto courses",
          type: "Academy"
        },
        {
          name: "CoinDesk Learn",
          url: "https://www.coindesk.com/learn/",
          description: "Beginner-friendly crypto guides",
          type: "Articles"
        }
      ]
    },
    {
      title: "Market Information",
      icon: <Globe className="h-5 w-5" />,
      description: "Track prices and market data",
      links: [
        {
          name: "CoinGecko",
          url: "https://www.coingecko.com/",
          description: "Comprehensive cryptocurrency market data",
          type: "Market Data"
        },
        {
          name: "CoinMarketCap",
          url: "https://coinmarketcap.com/",
          description: "Popular crypto price tracking platform",
          type: "Market Data"
        },
        {
          name: "DeFiPulse",
          url: "https://defipulse.com/",
          description: "DeFi ecosystem statistics and rankings",
          type: "Analytics"
        }
      ]
    },
    {
      title: "Network Status & Tools",
      icon: <FileText className="h-5 w-5" />,
      description: "Check network status and transaction fees",
      links: [
        {
          name: "Polygon Gas Tracker",
          url: "https://polygonscan.com/gastracker",
          description: "Monitor Polygon network fees",
          type: "Tool"
        },
        {
          name: "Solana Beach",
          url: "https://solanabeach.io/",
          description: "Solana network explorer and statistics",
          type: "Explorer"
        },
        {
          name: "Ethereum Gas Station",
          url: "https://ethgasstation.info/",
          description: "Ethereum network fee estimation",
          type: "Tool"
        }
      ]
    },
    {
      title: "Security Resources",
      icon: <Users className="h-5 w-5" />,
      description: "Learn about crypto security best practices",
      links: [
        {
          name: "MetaMask Security Tips",
          url: "https://metamask.io/faqs/#anchor-staying-safe",
          description: "Official security recommendations",
          type: "Security"
        },
        {
          name: "Crypto Security Guide",
          url: "https://blog.coinbase.com/the-keys-to-keeping-your-crypto-safe-96d497cce6cf",
          description: "Comprehensive security best practices",
          type: "Guide"
        },
        {
          name: "Common Scams to Avoid",
          url: "https://support.coinbase.com/customer/portal/articles/2992985",
          description: "Learn to identify and avoid crypto scams",
          type: "Education"
        }
      ]
    },
    {
      title: "Community & Support",
      icon: <Users className="h-5 w-5" />,
      description: "Join communities and get support",
      links: [
        {
          name: "Reddit Cryptocurrency",
          url: "https://www.reddit.com/r/CryptoCurrency/",
          description: "Large crypto community for discussions",
          type: "Community"
        },
        {
          name: "Discord Communities",
          url: "https://discord.gg/ethereum",
          description: "Real-time chat with other crypto users",
          type: "Chat"
        },
        {
          name: "Stack Exchange Crypto",
          url: "https://bitcoin.stackexchange.com/",
          description: "Technical Q&A for crypto enthusiasts",
          type: "Q&A"
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">External Resources</h2>
        <p className="text-gray-600">
          Curated links to helpful external resources for cryptocurrency and wallet management
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {linkCategories.map((category, categoryIndex) => (
          <Card key={categoryIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {category.icon}
                {category.title}
              </CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {category.links.map((link, linkIndex) => (
                <div key={linkIndex} className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{link.name}</h4>
                      <Badge variant="outline" className="text-xs">{link.type}</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{link.description}</p>
                    <Button variant="outline" size="sm" asChild>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        Visit
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Disclaimer */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">
            <strong>Disclaimer:</strong> External links are provided for convenience and educational purposes. 
            CSI Labs does not endorse or guarantee the accuracy, completeness, or reliability of external websites. 
            Always verify information and exercise caution when using third-party services.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExternalLinks;
