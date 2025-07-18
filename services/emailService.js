import nodemailer from "nodemailer";

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const createEmailTemplate = (data) => {
  const {
    service,
    description,
    preferredDate,
    preferredTime,
    name,
    phone,
    email,
    address,
    city,
    zip,
    fileData,
  } = data;

  // Function to show attachment info in email body
  const showAttachmentInfo = (fileData) => {
    if (!fileData || !fileData.buffer) return "";

    const fileName = fileData.originalname;
    const mimeType = fileData.mimetype;

    if (mimeType.startsWith("image/")) {
      return `
        <div class="field">
            <div class="field-label">Attached Image:</div>
            <div class="field-value">
                📷 ${fileName} (Image file - see attachment below)
            </div>
        </div>
      `;
    } else {
      return `
        <div class="field">
            <div class="field-label">Attached File:</div>
            <div class="field-value">
                📎 ${fileName}
            </div>
        </div>
      `;
    }
  };

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Service Request</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #2d3748;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 20px;
                min-height: 100vh;
            }

            .email-container {
                max-width: 650px;
                margin: 0 auto;
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }

            .header {
                background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
                position: relative;
            }

            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                opacity: 0.3;
            }

            .header h1 {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
                position: relative;
                z-index: 1;
            }

            .header p {
                font-size: 16px;
                opacity: 0.9;
                position: relative;
                z-index: 1;
            }

            .content {
                padding: 40px 30px;
                background: #fafbfc;
            }

            .section {
                background: white;
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 20px;
                border: 1px solid #e2e8f0;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }

            .section-title {
                font-size: 18px;
                font-weight: 600;
                color: #1a202c;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .service-badge {
                display: inline-block;
                background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                color: white;
                padding: 8px 16px;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
            }

            .field {
                margin-bottom: 20px;
            }

            .field-label {
                font-weight: 600;
                color: #4a5568;
                margin-bottom: 8px;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .field-value {
                background: #f7fafc;
                padding: 12px 16px;
                border-radius: 8px;
                border-left: 4px solid #4f46e5;
                font-size: 15px;
                color: #2d3748;
            }

            .customer-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }

            .info-item {
                background: #f7fafc;
                padding: 12px 16px;
                border-radius: 8px;
                border-left: 4px solid #38b2ac;
            }

            .info-label {
                font-size: 12px;
                font-weight: 600;
                color: #718096;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
            }

            .info-value {
                font-size: 15px;
                font-weight: 500;
                color: #2d3748;
            }

            .priority {
                background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
                color: white;
                padding: 15px 20px;
                border-radius: 12px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 10px;
                margin-top: 20px;
                box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }

            .footer {
                background: #2d3748;
                color: #a0aec0;
                padding: 25px 30px;
                text-align: center;
                font-size: 13px;
                line-height: 1.5;
            }

            .footer a {
                color: #63b3ed;
                text-decoration: none;
            }

            .attachment-info {
                background: #edf2f7;
                border: 1px solid #cbd5e0;
                border-radius: 8px;
                padding: 12px 16px;
                margin-top: 10px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .attachment-icon {
                font-size: 18px;
            }

            .service-details {
                display: grid;
                grid-template-columns: 1fr 2fr;
                gap: 20px;
                align-items: start;
            }

            .service-type {
                flex-shrink: 0;
            }

            .service-description {
                flex: 1;
            }

            @media (max-width: 768px) {
                .service-details {
                    grid-template-columns: 1fr;
                    gap: 15px;
                }

                .customer-info {
                    grid-template-columns: 1fr;
                }

                .header, .content {
                    padding: 25px 20px;
                }

                .section {
                    padding: 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>🚨 New Service Request</h1>
                <p>Quick Pro Booking - Professional Service Request</p>
            </div>

            <div class="content">
                <div class="section">
                    <div class="section-title">
                        <span>🔧</span>
                        Service Information
                    </div>
                    <div class="service-details">
                        <div class="service-type">
                            <div class="field-label">Service Type</div>
                            <div class="field-value">
                                <span class="service-badge">${service}</span>
                            </div>
                        </div>
                        <div class="service-description">
                            <div class="field-label">Description</div>
                            <div class="field-value">
                                ${description || "No description provided"}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">
                        <span>👤</span>
                        Customer Details
                    </div>
                    <div class="customer-info">
                        <div class="info-item">
                            <div class="info-label">Name</div>
                            <div class="info-value">${name}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Phone</div>
                            <div class="info-value">${phone}</div>
                        </div>
                        ${
                          email
                            ? `
                        <div class="info-item">
                            <div class="info-label">Email</div>
                            <div class="info-value">${email}</div>
                        </div>
                        `
                            : ""
                        }
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">
                        <span>📍</span>
                        Service Location
                    </div>
                    <div class="field">
                        <div class="field-value">
                            ${address}<br>
                            ${city}, MD ${zip}
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">
                        <span>📅</span>
                        Preferred Schedule
                    </div>
                    <div class="customer-info">
                        <div class="info-item">
                            <div class="info-label">Date</div>
                            <div class="info-value">${
                              preferredDate || "Not specified"
                            }</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Time</div>
                            <div class="info-value">${
                              preferredTime || "Not specified"
                            }</div>
                        </div>
                    </div>
                </div>

                ${
                  fileData && fileData.buffer
                    ? `
                <div class="section">
                    <div class="section-title">
                        <span>📎</span>
                        Attachments
                    </div>
                    <div class="attachment-info">
                        <span class="attachment-icon">${
                          fileData.mimetype.startsWith("image/") ? "📷" : "📎"
                        }</span>
                        <span>${fileData.originalname}</span>
                    </div>
                </div>
                `
                    : ""
                }

                ${
                  preferredTime === "Emergency (ASAP)"
                    ? '<div class="priority">⚠️ EMERGENCY REQUEST - URGENT ATTENTION REQUIRED</div>'
                    : ""
                }
            </div>

            <div class="footer">
                <p>This request was submitted through the SkillHands website.</p>
                <p><strong>Please respond to the customer within 2 hours.</strong></p>
                <p style="margin-top: 15px;">
                    <a href="mailto:${
                      email || "customer@example.com"
                    }">Reply to Customer</a> |
                    <a href="tel:${phone}">Call Customer</a>
                </p>
            </div>
        </div>
    </body>
    </html>
  `;

  const textTemplate = `
NEW SERVICE REQUEST - Quick Pro Booking

Service Type: ${service}
Customer: ${name}
Phone: ${phone}
${email ? `Email: ${email}` : ""}

Address: ${address}, ${city}, MD ${zip}

Preferred Date: ${preferredDate || "Not specified"}
Preferred Time: ${preferredTime || "Not specified"}

Description: ${description || "No description provided"}

${fileData ? `Attached File: ${fileData.originalname}` : ""}

${
  preferredTime === "Emergency (ASAP)"
    ? "⚠️ EMERGENCY REQUEST - URGENT ATTENTION REQUIRED"
    : ""
}

---
This request was submitted through the Quick Pro Booking website.
Please respond to the customer within 2 hours.
  `;

  return { html: htmlTemplate, text: textTemplate };
};

// Send email function
export const sendEmail = async (data) => {
  try {
    const transporter = createTransporter();
    const { html, text } = createEmailTemplate(data);

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: `New Service Request: ${data.service} - ${data.name}`,
      html: html,
      text: text,
    };

    // Add attachment if file data is provided
    if (data.fileData && data.fileData.buffer) {
      mailOptions.attachments = [
        {
          filename: data.fileData.originalname,
          content: data.fileData.buffer,
          contentType: data.fileData.mimetype,
        },
      ];
    }

    const result = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", result.messageId);

    return {
      messageId: result.messageId,
      success: true,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Email configuration is valid");
    return true;
  } catch (error) {
    console.error("Email configuration error:", error);
    return false;
  }
};
