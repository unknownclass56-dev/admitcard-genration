import { createServerFn } from "@tanstack/react-start";
import nodemailer from "nodemailer";

interface EmailData {
  to: string;
  cc?: string;
  studentName: string;
  rollNo: string;
  pdfBase64: string;
  fileName: string;
  testName: string;
}

export const sendAdmitCardEmail = createServerFn({ method: "POST" })
  .inputValidator((data: EmailData) => data)
  .handler(async ({ data }) => {
    try {
      console.log(`Sending email to ${data.to} (CC: ${data.cc || "None"}) for student ${data.studentName}`);

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "attandancenotification@gmail.com",
          pass: "msew oyth ptze bbon",
        },
      });

      const mailOptions = {
        from: '"Aspect Vision" <attandancenotification@gmail.com>',
        to: data.to,
        cc: data.cc || undefined,
        subject: `${data.testName} - Admit Card for ${data.studentName} (Roll No: ${data.rollNo})`,
        text: `Dear ${data.studentName},\n\nPlease find attached your Admit Card for the upcoming ${data.testName}.\n\nRoll Number: ${data.rollNo}\n\nBest regards,\nAspect Vision`,
        html: `
          <div style="font-family: sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 8px;">
            <div style="text-align: center; border-bottom: 2px solid #0a2540; padding-bottom: 12px; margin-bottom: 20px;">
              <h2 style="color: #0a2540; margin: 0; font-family: serif;">ASPECT VISION</h2>
              <p style="color: #c0392b; font-size: 12px; font-weight: bold; letter-spacing: 2px; margin: 4px 0 0 0; text-transform: uppercase;">Excellence in Education</p>
            </div>
            <p>Dear <strong>${data.studentName}</strong>,</p>
            <p>Please find attached your Admit Card for the upcoming <strong>${data.testName}</strong>.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #0a2540; width: 120px;">Roll Number</td>
                <td style="padding: 8px 0;">: ${data.rollNo}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #0a2540;">Student Name</td>
                <td style="padding: 8px 0;">: ${data.studentName}</td>
              </tr>
            </table>
            <p style="font-size: 13px; color: #4a5568; background-color: #f7fafc; padding: 12px; border-left: 4px solid #f4a300; border-radius: 4px;">
              <strong>Note:</strong> Please download the attached PDF, print it out, and bring it to the examination centre.
            </p>
            <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #718096; text-align: center;">
              This is an automated notification from Aspect Vision Admit Card Portal. Please do not reply directly to this email.
            </div>
          </div>
        `,
        attachments: [
          {
            filename: data.fileName,
            path: `data:application/pdf;base64,${data.pdfBase64}`,
          },
        ],
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully: ", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error("Error sending email: ", error);
      throw new Error(error.message || "Failed to send email");
    }
  });
