// Ambient declarations allowing backend TypeScript compilation before npm install

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
  interface Process {
    env: ProcessEnv;
  }
}

declare const process: NodeJS.Process;

declare module "dotenv" {
  export function config(options?: unknown): { error?: Error; parsed?: Record<string, string> };
  const dotenv: { config: typeof config };
  export default dotenv;
}

declare module "jsonwebtoken" {
  export function verify(
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: unknown
  ): unknown;
  export function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: string | Buffer,
    options?: unknown
  ): string;
  const jwt: { verify: typeof verify; sign: typeof sign };
  export default jwt;
}

declare module "@prisma/client" {
  export class PrismaClient {
    [key: string]: any;
    $runCommandRaw(command: Record<string, unknown>): Promise<unknown>;
  }
}

declare module "express" {
  export interface Request {
    headers: Record<string, string | string[] | undefined>;
    body: any;
    query: Record<string, string | string[] | undefined>;
    params: Record<string, string>;
    rawBody?: Buffer;
    [key: string]: any;
  }
  export interface Response {
    status(code: number): this;
    json(data: any): this;
    send(data?: any): this;
    headersSent: boolean;
    [key: string]: any;
  }
  export type NextFunction = (err?: any) => void;
  export interface Application {
    use(...args: any[]): any;
    get(...args: any[]): any;
    post(...args: any[]): any;
    options(...args: any[]): any;
    listen(port: number, cb?: () => void): any;
  }
  function express(): Application;
  namespace express {
    export function json(options?: any): any;
  }
  export default express;
}
