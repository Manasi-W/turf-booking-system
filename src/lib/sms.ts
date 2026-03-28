import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_FROM_PHONE;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function sendSMS(to: string, message: string) {
  if (!client || !fromPhone) {
    console.warn("WARNING: Twilio credentials not fully set. SMS will not be sent.");
    console.log(`MOCK SMS to ${to}: ${message}`);
    return;
  }

  try {
    await client.messages.create({
      body: message,
      from: fromPhone,
      to,
    });
  } catch (error) {
    console.error("Twilio SMS Error:", error);
  }
}

export async function sendBookingReminderSMS(phone: string, details: {
  turfName: string;
  time: string;
}) {
  const message = `Reminder: Your game at ${details.turfName} starts at ${details.time}. Don't be late!`;
  await sendSMS(phone, message);
}
