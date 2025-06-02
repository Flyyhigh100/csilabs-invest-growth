
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TokenDistributionRequest {
  userEmail: string;
  firstName?: string;
  lastName?: string;
  tokenAmount: number;
  walletAddress: string;
  blockchainTxId: string;
  transactionAmount: number;
  tokenPrice?: number;
  isTestData?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== TOKEN DISTRIBUTION EMAIL FUNCTION CALLED ===");
    
    const requestBody = await req.json();
    console.log("Request body received:", JSON.stringify(requestBody, null, 2));
    
    const {
      userEmail,
      firstName,
      lastName,
      tokenAmount,
      walletAddress,
      blockchainTxId,
      transactionAmount,
      tokenPrice,
      isTestData = false
    }: TokenDistributionRequest = requestBody;

    // Enhanced validation with detailed logging
    if (!userEmail) {
      console.error("❌ CRITICAL ERROR: userEmail is missing or empty");
      console.error("Full request data:", JSON.stringify(requestBody, null, 2));
      return new Response(JSON.stringify({ 
        success: false, 
        error: "User email is required but was not provided",
        debug: { userEmail, requestBody }
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!walletAddress || !blockchainTxId) {
      console.error("❌ VALIDATION ERROR: Missing required fields");
      console.error("walletAddress:", walletAddress);
      console.error("blockchainTxId:", blockchainTxId);
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Missing required token distribution data",
        debug: { walletAddress, blockchainTxId }
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Updated validation to handle zero token amounts gracefully
    if (tokenAmount === undefined || tokenAmount === null) {
      console.error("❌ VALIDATION ERROR: Token amount is undefined or null");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Token amount is required",
        debug: { tokenAmount }
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`✅ Validation passed - sending token distribution email to: ${userEmail}`);
    console.log(`📧 Email details: ${tokenAmount} tokens to wallet ${walletAddress.slice(0, 8)}...`);

    // Format user name
    const userName = firstName && lastName 
      ? `${firstName} ${lastName}` 
      : firstName || lastName || 'Valued Customer';

    console.log(`👤 User name formatted as: ${userName}`);

    // Determine blockchain explorer link
    const isSolana = blockchainTxId.includes('solana') || 
                    blockchainTxId.toLowerCase().includes('sol');
    
    const explorerUrl = isSolana 
      ? `https://solscan.io/tx/${blockchainTxId}`
      : `https://polygonscan.com/tx/${blockchainTxId}`;
    
    const explorerName = isSolana ? 'Solscan' : 'PolygonScan';
    const networkName = isSolana ? 'Solana' : 'Polygon';

    console.log(`🔗 Blockchain details: ${networkName} network, explorer: ${explorerName}`);

    // Format token amount for display - handle zero amounts gracefully
    const formattedTokenAmount = tokenAmount > 0 
      ? tokenAmount.toLocaleString(undefined, { 
          maximumFractionDigits: 2,
          minimumFractionDigits: 2
        })
      : "TBD"; // To Be Determined for zero amounts

    // Format wallet address for display
    const shortWalletAddress = `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`;

    // Format transaction ID for display
    const shortTxId = blockchainTxId.length > 20 
      ? `${blockchainTxId.slice(0, 12)}...${blockchainTxId.slice(-8)}`
      : blockchainTxId;

    // Prepare email subject (add test prefix if needed)
    const emailSubject = isTestData 
      ? `[TEST] Your CSL Tokens Have Been Delivered! 🎉`
      : `Your CSL Tokens Have Been Delivered! 🎉`;

    console.log(`📬 Email subject: ${emailSubject}`);

    // Create email HTML content with improved token amount handling
    const tokenDisplayText = tokenAmount > 0 
      ? `${formattedTokenAmount} CSL tokens`
      : "Your CSL tokens";
    
    const tokenAmountRow = tokenAmount > 0 
      ? `<p style="margin: 8px 0; font-size: 16px;">
           <strong>Tokens Delivered:</strong> ${formattedTokenAmount} CSL
         </p>`
      : `<p style="margin: 8px 0; font-size: 16px;">
           <strong>Tokens Delivered:</strong> Your CSL tokens (amount calculated based on transaction)
         </p>`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CSL Token Delivery Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                🎉 Congratulations, ${userName}!
              </h1>
              <p style="color: #dcfce7; margin: 10px 0 0 0; font-size: 18px;">
                Your CSL tokens have been successfully delivered!
              </p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 20px;">
              
              <!-- Token Delivery Summary -->
              <div style="background-color: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h2 style="color: #166534; margin: 0 0 15px 0; font-size: 20px;">Token Delivery Summary</h2>
                <div style="color: #166534;">
                  ${tokenAmountRow}
                  <p style="margin: 8px 0; font-size: 16px;">
                    <strong>Delivered to Wallet:</strong> ${shortWalletAddress}
                  </p>
                  <p style="margin: 8px 0; font-size: 16px;">
                    <strong>Network:</strong> ${networkName}
                  </p>
                  <p style="margin: 8px 0; font-size: 16px;">
                    <strong>Purchase Amount:</strong> $${transactionAmount.toFixed(2)} USD
                  </p>
                  ${tokenPrice ? `
                  <p style="margin: 8px 0; font-size: 16px;">
                    <strong>Token Price:</strong> $${tokenPrice.toFixed(6)} per token
                  </p>
                  ` : ''}
                </div>
              </div>
              
              <!-- Blockchain Transaction Details -->
              <div style="background-color: #eff6ff; border: 2px solid #bfdbfe; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">Blockchain Transaction Details</h3>
                <p style="color: #1e40af; margin: 8px 0; font-size: 14px;">
                  <strong>Transaction ID:</strong> ${shortTxId}
                </p>
                <div style="margin-top: 15px;">
                  <a href="${explorerUrl}" 
                     target="_blank" 
                     style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    View on ${explorerName} →
                  </a>
                </div>
              </div>
              
              <!-- Next Steps -->
              <div style="background-color: #fefce8; border: 2px solid #fde047; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h3 style="color: #a16207; margin: 0 0 15px 0; font-size: 18px;">What's Next?</h3>
                <ul style="color: #a16207; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Check your wallet to confirm the tokens have arrived</li>
                  <li style="margin-bottom: 8px;">Visit our platform to track your transaction status</li>
                  <li style="margin-bottom: 8px;">Join our community to stay updated on CSL developments</li>
                  <li style="margin-bottom: 8px;">Keep your wallet secure and never share your private keys</li>
                </ul>
              </div>
              
              <!-- Support Information -->
              <div style="text-align: center; color: #6b7280; font-size: 14px;">
                <p style="margin: 0 0 10px 0;">
                  Questions about your token delivery? Our support team is here to help.
                </p>
                <p style="margin: 0;">
                  Contact us through our platform or reach out to our support team.
                </p>
              </div>
              
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">
                CSL - Innovation in Blockchain Technology
              </p>
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                This email confirms the successful delivery of your CSL tokens. 
                Please keep this email for your records.
              </p>
              ${isTestData ? `
              <div style="margin-top: 15px; padding: 10px; background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px;">
                <p style="color: #92400e; margin: 0; font-size: 12px; font-weight: bold;">
                  ⚠️ This is a test email - No actual tokens were distributed
                </p>
              </div>
              ` : ''}
            </div>
            
          </div>
        </body>
      </html>
    `;

    console.log("📧 Preparing to send email via Resend...");
    
    // Send the email with enhanced error handling
    try {
      const emailResponse = await resend.emails.send({
        from: "CSL <mail@mail.1millionstrongfightclub.com>",
        to: [userEmail],
        subject: emailSubject,
        html: emailHtml,
      });

      console.log("✅ EMAIL SENT SUCCESSFULLY!");
      console.log("Resend response:", JSON.stringify(emailResponse, null, 2));
      
      if (emailResponse.error) {
        console.error("❌ Resend returned an error:", emailResponse.error);
        throw new Error(`Resend API error: ${JSON.stringify(emailResponse.error)}`);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        messageId: emailResponse.data?.id,
        recipient: userEmail,
        debug: {
          tokenAmount: formattedTokenAmount,
          walletAddress: shortWalletAddress,
          network: networkName,
          isTestData
        }
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });

    } catch (emailError: any) {
      console.error("❌ CRITICAL: Failed to send email via Resend");
      console.error("Email error details:", emailError);
      console.error("Email error stack:", emailError.stack);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Failed to send email via Resend",
        details: emailError.message,
        debug: {
          userEmail,
          emailError: emailError.toString()
        }
      }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      });
    }

  } catch (error: any) {
    console.error("❌ FUNCTION ERROR: Unexpected error in token distribution email function");
    console.error("Error details:", error);
    console.error("Error stack:", error.stack);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Internal server error in email function",
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json", 
        ...corsHeaders 
      },
    });
  }
};

serve(handler);
