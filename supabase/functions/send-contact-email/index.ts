
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Contact email function invoked, method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.log("Method not allowed:", req.method);
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    console.log("Parsing request body...");
    const requestBody = await req.text();
    console.log("Raw request body:", requestBody);
    
    const { name, email, subject, message }: ContactEmailRequest = JSON.parse(requestBody);
    console.log("Parsed contact form data:", { name, email, subject, messageLength: message.length });

    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.log("Validation failed - missing required fields");
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Attempting to send support notification email...");
    
    // Send notification email to support team
    const supportEmailResponse = await resend.emails.send({
      from: "CSi Labs Contact Form <noreply@mail.1millionstrongfightclub.com>",
      to: ["support@1millionstrongfightclub.com"],
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #334155; margin-top: 0;">Contact Details</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="color: #334155; margin-top: 0;">Message</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
            <p>This message was sent via the CSi Labs contact form.</p>
            <p>Reply directly to this email to respond to ${name} at ${email}</p>
          </div>
        </div>
      `,
      replyTo: email,
    });

    console.log("Support email response:", JSON.stringify(supportEmailResponse, null, 2));

    if (supportEmailResponse.error) {
      console.error("Error sending support email:", supportEmailResponse.error);
      throw new Error(`Failed to send support email: ${supportEmailResponse.error.message}`);
    }

    console.log("Attempting to send confirmation email to user...");

    // Send confirmation email to user
    const confirmationEmailResponse = await resend.emails.send({
      from: "CSi Labs <noreply@mail.1millionstrongfightclub.com>",
      to: [email],
      subject: "Thank you for contacting CSi Labs",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
            Thank You for Contacting Us!
          </h2>
          
          <p style="font-size: 16px; line-height: 1.6;">Dear ${name},</p>
          
          <p style="line-height: 1.6;">
            Thank you for reaching out to CSi Labs. We have received your message regarding 
            "<strong>${subject}</strong>" and will get back to you within 24 hours.
          </p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af;">
            <h3 style="color: #1e40af; margin-top: 0;">What happens next?</h3>
            <ul style="color: #334155; line-height: 1.6;">
              <li>Our support team will review your message</li>
              <li>We'll respond within 24 hours during business days</li>
              <li>For urgent matters, you can reply directly to this email</li>
            </ul>
          </div>
          
          <p style="line-height: 1.6;">
            In the meantime, feel free to explore our research documents and learn more about 
            our mission to make cancer treatments affordable and accessible to millions.
          </p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="https://1millionstrongfightclub.com/research-documents" 
               style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Research Documents
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
            <p>Best regards,<br>The CSi Labs Team</p>
            <p>Revolutionizing cancer treatment through Harvard-validated cannabinoid research</p>
          </div>
        </div>
      `,
    });

    console.log("Confirmation email response:", JSON.stringify(confirmationEmailResponse, null, 2));

    if (confirmationEmailResponse.error) {
      console.error("Error sending confirmation email:", confirmationEmailResponse.error);
      // Don't throw here - support email was sent successfully
    }

    console.log("Contact form processing completed successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Emails sent successfully",
        supportEmail: supportEmailResponse,
        confirmationEmail: confirmationEmailResponse
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send email", 
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
