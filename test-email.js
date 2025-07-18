import dotenv from "dotenv";
import { testEmailConfig } from "./services/emailService.js";

// Load environment variables
dotenv.config();

console.log("Testing email configuration...");
console.log("Email Host:", process.env.EMAIL_HOST);
console.log("Email Port:", process.env.EMAIL_PORT);
console.log("Email User:", process.env.EMAIL_USER);
console.log("Email From:", process.env.EMAIL_FROM);
console.log("Email To:", process.env.EMAIL_TO);

const testConfig = async () => {
  try {
    const isValid = await testEmailConfig();
    if (isValid) {
      console.log("✅ Email configuration is valid!");
      console.log("You can now start the server with: npm run dev");
    } else {
      console.log("❌ Email configuration is invalid!");
      console.log("Please check your .env file and email settings.");
    }
  } catch (error) {
    console.error("❌ Error testing email configuration:", error.message);
  }
};

testConfig();
