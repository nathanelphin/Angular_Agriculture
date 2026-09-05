/**
 * gen-one.ts — single-image generator child process (Task 2-b).
 *
 * Called by generate-images.ts orchestrator: `bun run scripts/gen-one.ts <jobIndex>`
 * Reads scripts/.jobs.json, generates ONE image with z-ai-web-dev-sdk,
 * encodes to JPEG with sharp, saves to public/images/<name>.jpg.
 *
 * Isolated in its own process so a native crash (sharp/bun) or hang only
 * loses one image — the orchestrator survives and retries.
 * Exit codes: 0 = ok, 1 = generation/encode failure, 3 = fatal unexpected.
 */
import ZAI from 'z-ai-web-dev-sdk';
import sharp from 'sharp';
import { readFileSync, statSync } from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images';
const MIN_BYTES = 10 * 1024;
const TIMEOUT_MS = 200_000;

const idx = Number(process.argv[2]);
if (!Number.isInteger(idx)) {
  console.error('usage: bun run scripts/gen-one.ts <jobIndex>');
  process.exit(3);
}

// Keep the child alive just long enough to report, then exit non-zero.
process.on('uncaughtException', (e) => {
  console.error('UNCAUGHT:', e?.message || e);
  process.exit(3);
});
process.on('unhandledRejection', (e: any) => {
  console.error('UNHANDLED_REJECTION:', e?.message || e);
  process.exit(3);
});

type Job = { name: string; size: string; prompt: string };

const jobs: Job[] = JSON.parse(readFileSync('/home/z/my-project/scripts/.jobs.json', 'utf8'));
const job = jobs[idx];
if (!job) {
  console.error(`job index ${idx} not found`);
  process.exit(3);
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`timeout after ${ms}ms`)), ms)),
  ]);
}

try {
  const zai = await ZAI.create();
  const res = await withTimeout(
    zai.images.generations.create({ prompt: job.prompt, size: job.size as any }),
    TIMEOUT_MS
  );
  const b64 = res?.data?.[0]?.base64;
  if (!b64 || typeof b64 !== 'string' || b64.length < 1000) throw new Error('empty/invalid base64 in response');
  const buf = Buffer.from(b64, 'base64');
  if (buf.length < MIN_BYTES) throw new Error(`raw response too small (${buf.length}B)`);
  const outPath = path.join(OUT_DIR, `${job.name}.jpg`);
  await sharp(buf).jpeg({ quality: 82 }).toFile(outPath);
  const bytes = statSync(outPath).size;
  if (bytes < MIN_BYTES) throw new Error(`jpeg too small (${bytes}B)`);
  console.log(`CHILD_OK ${job.name} ${Math.round(bytes / 1024)}KB`);
  process.exit(0);
} catch (e: any) {
  console.error(`CHILD_FAIL ${job.name}: ${e?.message || e}`);
  process.exit(1);
}
