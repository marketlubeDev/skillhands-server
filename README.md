# SkillHands Backend API

A Node.js Express server for handling service booking requests with email notifications.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=recipient@example.com

# Server Configuration
PORT=5000
NODE_ENV=development
```

3. For Gmail, you'll need to:
   - Enable 2-factor authentication
   - Generate an App Password
   - Use the App Password as EMAIL_PASS

## Development

Run the development server:

```bash
npm run dev
```

## Production (Vercel)

The application is configured for Vercel deployment. Make sure to:

1. Set all environment variables in your Vercel project settings
2. Deploy using `vercel` command or connect your GitHub repository

## API Endpoints

- `GET /` - Health check
- `GET /api/health` - Server status
- `POST /api/contact` - Submit service request with file upload

## File Upload

The API accepts image and video files up to 10MB. Files are stored in memory and attached to the email.

## Error Handling

The application includes comprehensive error handling and validation for all endpoints.
