// SMS Service Integration (Twilio)
// Install: npm install twilio

const TWILIO_CONFIG = {
  accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || '',
  authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN || '',
  fromNumber: import.meta.env.VITE_TWILIO_PHONE_NUMBER || '',
};

// Initialize Twilio client in backend (Node.js):
// const twilio = require('twilio');
// const client = twilio(TWILIO_CONFIG.accountSid, TWILIO_CONFIG.authToken);

/**
 * Send notification to emergency contact
 * @param patientName - Name of patient
 * @param phoneNumber - Emergency contact phone number
 * @param message - Message to send
 */
export const sendEmergencyNotification = async (
  patientName: string,
  phoneNumber: string,
  message: string,
) => {
  try {
    const response = await fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phoneNumber,
        body: message,
        patientName,
      }),
    });

    let data: any = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.message || `Failed to send SMS: ${response.status}`);
    }

    console.log('SMS sent successfully:', data.sid);
    return data;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

/**
 * Send discharge notification
 */
export const sendDischargeNotification = async (patientName: string, phoneNumber: string) => {
  const message = `Good news! ${patientName} has been discharged from the rehabilitation center. Please ensure proper follow-up care. For more details, contact the center.`;
  return sendEmergencyNotification(patientName, phoneNumber, message);
};

/**
 * Send appointment reminder
 */
export const sendAppointmentReminder = async (
  patientName: string,
  phoneNumber: string,
  appointmentDate: string,
) => {
  const message = `Reminder: ${patientName}, you have an appointment on ${appointmentDate}. Please arrive 15 minutes early.`;
  return sendEmergencyNotification(patientName, phoneNumber, message);
};

/**
 * Send treatment update notification
 */
export const sendTreatmentUpdate = async (patientName: string, phoneNumber: string, update: string) => {
  const message = `Treatment Update for ${patientName}: ${update}`;
  return sendEmergencyNotification(patientName, phoneNumber, message);
};

/**
 * Send staff attendance reminder
 */
export const sendAttendanceReminder = async (staffName: string, phoneNumber: string) => {
  const message = `Hi ${staffName}, this is your attendance reminder for today. Please mark your attendance before end of shift.`;
  return sendEmergencyNotification(staffName, phoneNumber, message);
};

// Backend endpoint example (Node.js/Express):
/*
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.post('/api/sms/send', async (req, res) => {
  try {
    const { to, body } = req.body;
    
    const message = await client.messages.create({
      body: body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });

    res.json({ success: true, sid: message.sid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
*/
