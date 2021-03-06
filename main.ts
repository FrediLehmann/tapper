import "https://deno.land/std@0.147.0/dotenv/load.ts";
import { Client } from "https://deno.land/x/postgres@v0.16.1/mod.ts";
import { getTests } from "./helpers/index.ts";
import { ProgressLogger } from "./types/index.ts";

let logger = new ProgressLogger(['⏳ Checking pgTap·..', '⏳ Checking pgTap.·.', '⏳ Checking pgTap..·'])

// Check if pgTap is installed
try {
  logger.start()
  const client = new Client()

  await client.connect();

  const isTapEnabled = (await client.queryObject<{ tap_enabled: boolean }>`
    SELECT count(*) = 1 AS tap_enabled
    FROM pg_extension
    WHERE extname='pgtap';
  `).rows[0].tap_enabled;

  await client.end();

  if (!isTapEnabled) {
    throw new Error('pgTap is not enabled on your PostgreSQL installation')
  }
}
catch (_e) {
  console.error(_e)
  Deno.exit(1)
}
finally {
  logger.stop()
}

// Run tests
try {
  const tests = await getTests();

  for (const test of tests) {
    const testLogger = new ProgressLogger(['🏃 Running tests·..', '🏃 Running tests.·.', '🏃 Running tests..·'])
    testLogger.start()
    const process = Deno.run({
      cmd: [
        'deno',
        'run',
        '--allow-read',
        '--allow-net',
        '--allow-env',
        test
      ],
      stdout: "piped",
      stderr: "piped",
    })

    const { code } = await process.status();

    testLogger.stop()

    if (code !== 0) {
      const msg = new TextDecoder().decode(await process.stderrOutput())
      throw new Error(msg)
    }

    console.log(new TextDecoder().decode(await process.output()))
  }
} catch (e) {
  console.error(e);
  Deno.exit(1);
}

Deno.exit(0);