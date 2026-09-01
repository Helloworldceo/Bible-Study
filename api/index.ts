// Vercel serverless function entry point -- routes every /api/* request
// here (see vercel.json) and hands it to the Express app in server.ts.
//
// The .js extension below is deliberate, not a typo: Vercel's Node runtime
// resolves this under strict ESM rules, which require the exact extension
// in relative import specifiers -- omitting it (or writing .ts) produces
// ERR_MODULE_NOT_FOUND at runtime even though the file compiles fine.
// TypeScript's "bundler" moduleResolution (tsconfig.json) is what makes
// writing .js here while the real file is server.ts resolve correctly.
export { default } from '../server.js';
