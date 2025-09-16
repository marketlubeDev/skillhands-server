import helmet from "helmet";

export const applySecurity = (app) => {
  app.use(helmet());
};
