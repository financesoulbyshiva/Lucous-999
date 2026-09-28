// Ambient declarations allowing backend TypeScript compilation before npm install

declare class Buffer extends Uint8Array {
  static from(str: string | Uint8Array | ArrayBuffer | any, encoding?: string): Buffer;
  static isBuffer(obj: any): obj is Buffer;
  toString(encoding?: string): string;
  length: number;
}

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
  interface Process {
    env: ProcessEnv;
  }
}

declare const process: NodeJS.Process;

declare module "crypto" {
  export interface Hmac {
    update(data: string | Buffer): Hmac;
    digest(encoding?: string): any;
  }
  export function createHmac(algorithm: string, key: string | Buffer): Hmac;
  export function timingSafeEqual(a: Buffer, b: Buffer): boolean;
  export function randomBytes(size: number): Buffer;

  interface CryptoModule {
    createHmac: typeof createHmac;
    timingSafeEqual: typeof timingSafeEqual;
    randomBytes: typeof randomBytes;
  }

  const crypto: CryptoModule;
  export default crypto;
}

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
  export type RequestHandler = (req: Request, res: Response, next: NextFunction) => any;
  export type ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => any;

  export interface IRouter {
    use(...handlers: any[]): this;
    get(path: string, ...handlers: any[]): this;
    post(path: string, ...handlers: any[]): this;
    put(path: string, ...handlers: any[]): this;
    delete(path: string, ...handlers: any[]): this;
    patch(path: string, ...handlers: any[]): this;
    all(path: string, ...handlers: any[]): this;
    [key: string]: any;
  }

  export interface Application extends IRouter {
    listen(port: number | string, cb?: () => void): any;
  }

  export function Router(options?: any): IRouter;
  export function json(options?: any): any;

  function express(): Application;
  namespace express {
    export { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler, IRouter, Application };
    export function Router(options?: any): IRouter;
    export function json(options?: any): any;
  }
  export default express;
}

declare module "cors" {
  export default function cors(options?: any): any;
}

declare module "bcryptjs" {
  export function hash(s: string, salt: number | string): Promise<string>;
  export function compare(s: string, hash: string): Promise<boolean>;
  const bcrypt: { hash: typeof hash; compare: typeof compare };
  export default bcrypt;
}
