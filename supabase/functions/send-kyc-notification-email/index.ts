
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface KycNotificationRequest {
  userId: string;
  kycId: string;
  status: 'approved' | 'rejected' | 'needs_clarification';
  rejectionReason?: string;
  clarificationMessage?: string;
}

const getEmailTemplate = (
  userName: string, 
  status: string, 
  rejectionReason?: string, 
  clarificationMessage?: string
) => {
  const baseUrl = "https://1millionstrongfightclub.com";
  
  switch (status) {
    case 'approved':
      return {
        subject: "🎉 Your Identity Verification Has Been Approved - CSi Labs",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1e40af 0%, #0d9488 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">CSi Labs</h1>
              <p style="color: #e0f2fe; margin: 10px 0 0 0;">Cancer Research Innovation</p>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1e40af; margin-bottom: 20px;">🎉 Verification Approved!</h2>
              
              <p>Dear ${userName},</p>
              
              <p>Congratulations! Your identity verification has been successfully approved. You now have full access to the CSi Labs token platform.</p>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af;">
                <h3 style="color: #1e40af; margin-top: 0;">What's Next?</h3>
                <ul style="color: #374151; margin: 10px 0;">
                  <li>You can now purchase CSi tokens using cryptocurrency</li>
                  <li>Access to high-value transactions (over $10,000) is now enabled</li>
                  <li>View your complete transaction history</li>
                  <li>Participate in our cancer research token ecosystem</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/dashboard/payments" style="background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Start Contributing Now</a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Thank you for joining our mission to advance cancer research through blockchain technology.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                CSi Labs - Revolutionizing cancer treatment through Harvard-validated cannabinoid research<br>
                <a href="${baseUrl}" style="color: #1e40af;">Visit Platform</a> | 
                <a href="${baseUrl}/contact" style="color: #1e40af;">Contact Support</a>
              </p>
            </div>
          </div>
        `
      };
      
    case 'rejected':
      return {
        subject: "Identity Verification Update Required - CSi Labs",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1e40af 0%, #0d9488 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">CSi Labs</h1>
              <p style="color: #e0f2fe; margin: 10px 0 0 0;">Cancer Research Innovation</p>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
              <h2 style="color: #dc2626; margin-bottom: 20px;">Verification Update Required</h2>
              
              <p>Dear ${userName},</p>
              
              <p>We've reviewed your identity verification submission, but we need you to resubmit with updated information to comply with regulatory requirements.</p>
              
              ${rejectionReason ? `
                <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                  <h3 style="color: #dc2626; margin-top: 0;">Reason for Update Request:</h3>
                  <p style="color: #374151; margin: 10px 0;">${rejectionReason}</p>
                </div>
              ` : ''}
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af;">
                <h3 style="color: #1e40af; margin-top: 0;">Next Steps:</h3>
                <ul style="color: #374151; margin: 10px 0;">
                  <li>Review the feedback above carefully</li>
                  <li>Prepare new, clear photos of your identification documents</li>
                  <li>Ensure all information is clearly visible and matches your profile</li>
                  <li>Resubmit your verification through the platform</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/dashboard/kyc" style="background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Update Verification</a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                We appreciate your patience as we work to maintain the highest security standards for our platform.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                CSi Labs - Revolutionizing cancer treatment through Harvard-validated cannabinoid research<br>
                <a href="${baseUrl}" style="color: #1e40af;">Visit Platform</a> | 
                <a href="${baseUrl}/contact" style="color: #1e40af;">Contact Support</a>
              </p>
            </div>
          </div>
        `
      };
      
    case 'needs_clarification':
      return {
        subject: "Additional Information Needed - CSi Labs Verification",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1e40af 0%, #0d9488 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">CSi Labs</h1>
              <p style="color: #e0f2fe; margin: 10px 0 0 0;">Cancer Research Innovation</p>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
              <h2 style="color: #d97706; margin-bottom: 20px;">Additional Information Needed</h2>
              
              <p>Dear ${userName},</p>
              
              <p>We're in the process of reviewing your identity verification and need some additional information to complete the process.</p>
              
              ${clarificationMessage ? `
                <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
                  <h3 style="color: #d97706; margin-top: 0;">What We Need:</h3>
                  <p style="color: #374151; margin: 10px 0;">${clarificationMessage}</p>
                </div>
              ` : ''}
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af;">
                <h3 style="color: #1e40af; margin-top: 0;">How to Provide Additional Information:</h3>
                <ul style="color: #374151; margin: 10px 0;">
                  <li>Log into your CSi Labs account</li>
                  <li>Navigate to the KYC verification section</li>
                  <li>Review the specific requirements mentioned above</li>
                  <li>Upload any additional documents or information requested</li>
                  <li>Resubmit your verification for review</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/dashboard/kyc" style="background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Provide Information</a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Once we receive the additional information, we'll complete your verification promptly.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                CSi Labs - Revolutionizing cancer treatment through Harvard-validated cannabinoid research<br>
                <a href="${baseUrl}" style="color: #1e40af;">Visit Platform</a> | 
                <a href="${baseUrl}/contact" style="color: #1e40af;">Contact Support</a>
              </p>
            </div>
          </div>
        `
      };
      
    default:
      throw new Error(`Unknown status: ${status}`);
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, kycId, status, rejectionReason, clarificationMessage }: KycNotificationRequest = await req.json();

    console.log(`Sending KYC notification email for user ${userId}, status: ${status}`);

    // Create Supabase client to fetch user profile
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch user profile to get name and email
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    const userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
    const userEmail = profile.email;

    if (!userEmail) {
      throw new Error('User email not found');
    }

    // Generate email content based on status
    const emailTemplate = getEmailTemplate(userName, status, rejectionReason, clarificationMessage);

    // Send email using Resend with the verified domain
    const emailResponse = await resend.emails.send({
      from: "CSi Labs <team@mail.1millionstrongfightclub.com>",
      to: [userEmail],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    console.log("KYC notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      status,
      userId,
      kycId 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-kyc-notification-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
