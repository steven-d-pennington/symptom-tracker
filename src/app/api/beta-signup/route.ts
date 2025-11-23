/**
 * API Route: /api/beta-signup
 * - Accepts beta signup email submissions
 * - Sends welcome email with mock verification code
 * - Sends copy to admin
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Error response interface
interface ErrorResponse {
  error: string;
  code: string;
  message: string;
  timestamp: string;
}

// Signup request interface
interface SignupRequest {
  email: string;
}

// Signup response interface
interface SignupResponse {
  success: true;
  message: string;
  verificationCode: string;
}

// Initialize Resend
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Helper: Create structured error response
 */
function createErrorResponse(
  error: string,
  code: string,
  message: string,
  status: number
): NextResponse<ErrorResponse> {
  const errorResponse: ErrorResponse = {
    error,
    code,
    message,
    timestamp: new Date().toISOString(),
  };

  // Log error (without sensitive data)
  console.error(
    JSON.stringify({
      timestamp: errorResponse.timestamp,
      operation: "beta-signup",
      error: code,
      message,
      status,
    })
  );

  return NextResponse.json(errorResponse, { status });
}

/**
 * Helper: Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Helper: Generate mock verification code
 */
function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

/**
 * Helper: Structured operation logging
 */
function logOperation(data: {
  operation: string;
  email: string;
  success: boolean;
  duration: number;
  error?: string;
}) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      ...data,
    })
  );
}

/**
 * POST /api/beta-signup
 * Handle beta signup submissions
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Check if Resend is configured
    if (!resend || !process.env.RESEND_API_KEY) {
      return createErrorResponse(
        "EMAIL_NOT_CONFIGURED",
        "EMAIL_NOT_CONFIGURED",
        "Email service is not configured. Please contact support.",
        503
      );
    }

    // Parse request body
    let body: SignupRequest;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse(
        "INVALID_REQUEST",
        "INVALID_REQUEST",
        "Invalid JSON in request body",
        400
      );
    }

    const { email } = body;

    // Validate required fields
    if (!email) {
      return createErrorResponse(
        "MISSING_EMAIL",
        "INVALID_REQUEST",
        "Email address is required",
        400
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return createErrorResponse(
        "INVALID_EMAIL",
        "INVALID_REQUEST",
        "Please provide a valid email address",
        400
      );
    }

    // Generate mock verification code
    const verificationCode = generateVerificationCode();

    try {
      // Send welcome email to beta user
      await resend.emails.send({
        from: "Pocket Symptom Tracker <beta@invitations.monkeylovestack.com>",
        to: email,
        subject: "Welcome to Pocket Symptom Tracker Beta! 🎉",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Beta</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to the Beta!</h1>
  </div>

  <div style="background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi there! 👋</p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Thank you for signing up for early access to <strong>Pocket Symptom Tracker</strong>!
      We're thrilled to have you join our beta community.
    </p>

    <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
      <p style="margin: 0; font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 3px; font-family: 'Courier New', monospace;">${verificationCode}</p>
    </div>

    <p style="font-size: 16px; margin-bottom: 20px;">
      We'll be sending you updates as we prepare for launch. In the meantime, here's what you can expect:
    </p>

    <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px;">
      <li style="margin-bottom: 10px;">Early access to new features</li>
      <li style="margin-bottom: 10px;">Direct input on product development</li>
      <li style="margin-bottom: 10px;">Exclusive beta user perks</li>
    </ul>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Have questions or feedback? We'd love to hear from you!
    </p>

    <p style="font-size: 16px; margin-top: 30px;">
      Best regards,<br>
      <strong>The Pocket Symptom Tracker Team</strong>
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
    <p style="margin: 0;">This is a beta invitation email. Please keep your verification code safe.</p>
  </div>
</body>
</html>
        `,
      });

      // Send copy to admin
      await resend.emails.send({
        from: "Beta Signup Notifications <beta@invitations.monkeylovestack.com>",
        to: "steven@monkeylovestack.com",
        subject: `New Beta Signup: ${email}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Beta Signup</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #1f2937; padding: 20px; border-radius: 8px 8px 0 0;">
    <h2 style="color: white; margin: 0; font-size: 20px;">New Beta Signup</h2>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 180px;">Email:</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${email}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Verification Code:</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-family: 'Courier New', monospace; font-weight: bold; color: #667eea;">${verificationCode}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Timestamp:</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${new Date().toISOString()}</td>
      </tr>
    </table>
  </div>
</body>
</html>
        `,
      });

      // Log successful operation
      const duration = Date.now() - startTime;
      logOperation({
        operation: "beta-signup",
        email,
        success: true,
        duration,
      });

      // Return success response
      const response: SignupResponse = {
        success: true,
        message: "Successfully signed up for beta access!",
        verificationCode,
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      // Email sending failed
      const duration = Date.now() - startTime;
      logOperation({
        operation: "beta-signup",
        email,
        success: false,
        duration,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return createErrorResponse(
        "EMAIL_SEND_FAILED",
        "EMAIL_SEND_FAILED",
        "Failed to send confirmation email. Please try again.",
        503
      );
    }
  } catch (error) {
    // Unexpected error
    const duration = Date.now() - startTime;
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        operation: "beta-signup",
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
        duration,
      })
    );

    return createErrorResponse(
      "INTERNAL_ERROR",
      "INTERNAL_ERROR",
      "An unexpected error occurred. Please try again.",
      500
    );
  }
}
