import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.warn("WARNING: RESEND_API_KEY is not defined. Emails will not be sent.");
}

export const resend = apiKey ? new Resend(apiKey) : null;

export async function sendBookingConfirmationEmail(email: string, details: {
  turfName: string;
  date: string;
  time: string;
  amount: number;
}) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: "Turfivo <onboarding@resend.dev>", // Replace with your verified domain in production
      to: email,
      subject: `Booking Confirmed: ${details.turfName}`,
      html: `
        <h1>Booking Confirmation</h1>
        <p>Your booking at <strong>${details.turfName}</strong> is confirmed!</p>
        <ul>
          <li><strong>Date:</strong> ${details.date}</li>
          <li><strong>Time:</strong> ${details.time}</li>
          <li><strong>Amount Paid:</strong> ₹${details.amount}</li>
        </ul>
        <p>Thank you for playing with us!</p>
      `,
    });
  } catch (error) {
    console.error("Email Error (Confirmation):", error);
  }
}

export async function sendSplitInvitationEmail(email: string, details: {
  inviterName: string;
  turfName: string;
  date: string;
  time: string;
  amount: number;
}) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: "Turfivo <onboarding@resend.dev>",
      to: email,
      subject: `Invitation to play at ${details.turfName}`,
      html: `
        <h1>You're Invited!</h1>
        <p><strong>${details.inviterName}</strong> has invited you to play at <strong>${details.turfName}</strong>.</p>
        <p>Details:</p>
        <ul>
          <li><strong>Date:</strong> ${details.date}</li>
          <li><strong>Time:</strong> ${details.time}</li>
          <li><strong>Your Share:</strong> ₹${details.amount}</li>
        </ul>
        <p>Please log in to your dashboard to accept and pay your share.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/customer/notifications">View Invitation</a>
      `,
    });
  } catch (error) {
    console.error("Email Error (Invitation):", error);
  }
}
