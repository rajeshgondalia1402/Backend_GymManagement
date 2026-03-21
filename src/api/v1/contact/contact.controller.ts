import { Request, Response } from 'express';
import { z } from 'zod';
import { sendEmail } from '../../../common/services/email.service';
import logger from '../../../common/utils/logger.util';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  contactNumber: z.string().min(1, 'Contact number is required').max(20),
  description: z.string().min(1, 'Description is required').max(2000),
});

export const handleContactForm = async (req: Request, res: Response) => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { name, contactNumber, description } = parsed.data;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Contact Form Submission</h2>
        <hr style="border: 1px solid #e5e7eb;" />
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 140px;">Name:</td>
            <td style="padding: 8px 0; color: #1f2937;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Contact Number:</td>
            <td style="padding: 8px 0; color: #1f2937;">${contactNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151; vertical-align: top;">Message:</td>
            <td style="padding: 8px 0; color: #1f2937;">${description}</td>
          </tr>
        </table>
        <hr style="border: 1px solid #e5e7eb; margin-top: 24px;" />
        <p style="color: #9ca3af; font-size: 12px; margin-top: 12px;">
          Sent from logikshub.tech contact form
        </p>
      </div>
    `;

    const result = await sendEmail({
      to: 'logikshubsolution@gmail.com',
      subject: `New Contact Inquiry from ${name}`,
      html,
      replyTo: undefined,
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Your message has been sent successfully.',
      });
    }

    logger.error('Contact form email failed', { error: result.error });
    return res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
    });
  } catch (error: any) {
    logger.error('Contact form error', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred.',
    });
  }
};
