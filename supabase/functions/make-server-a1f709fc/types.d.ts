/// <reference lib="deno.ns" />

declare module 'npm:hono@4.6.14' {
  export class Hono {
    use(...args: any[]): this;
    get(path: string, handler: any): this;
    post(path: string, handler: any): this;
    put(path: string, handler: any): this;
    delete(path: string, handler: any): this;
    fetch: any;
  }
}

declare module 'npm:hono@4.6.14/cors' {
  export function cors(options?: any): any;
}

declare module 'npm:hono@4.6.14/logger' {
  export function logger(fn: any): any;
}

declare module 'jsr:@supabase/supabase-js@2' {
  export function createClient(url: string, key: string, options?: any): any;
}

declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
  };
  export function serve(handler: any, options?: any): void;
}

