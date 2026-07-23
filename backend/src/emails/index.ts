/**
 * Email Dispatcher Infrastructure Service Placeholder
 */
export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  // Production SMTP / SES integration placeholder
  return true;
};
