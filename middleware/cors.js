import cors from "cors";

// Configurable CORS with sensible defaults
export const applyCors = (app) => {
  const rawOrigins = process.env.CORS_ORIGINS;
  const allowedOrigins = rawOrigins
    ? rawOrigins
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean)
    : [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:8081",

        "*",
      ];

  // Include Vercel deployment URL if available
  if (process.env.VERCEL_URL) {
    const vercelOrigin = `https://${process.env.VERCEL_URL}`;
    if (!allowedOrigins.includes(vercelOrigin)) {
      allowedOrigins.push(vercelOrigin);
    }
  }

  const isWildcard = allowedOrigins.includes("*");

  const corsOptions = {
    origin: (origin, callback) => {
      // Allow non-browser requests or same-origin with no Origin header
      if (!origin) return callback(null, true);
      if (isWildcard) return callback(null, true);
      const isAllowed = allowedOrigins.some((o) => o === origin);
      // Do not throw on disallowed origins; disable CORS instead of 500 error
      return callback(null, isAllowed);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-Length"],
    optionsSuccessStatus: 204,
  };

  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
};
