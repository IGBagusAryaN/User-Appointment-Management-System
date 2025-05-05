// types/express.d.ts (buat file terpisah atau letakkan di tempat yang di-include TypeScript)
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        id: string;
        username: string;
      };
    }
  }
}
