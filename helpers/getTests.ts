import { ProgressLogger } from "../types/index.ts";

/**
 * Get all tests from a directory
 * @param directory root directory to start gathering tests
 * @returns all test files
 */
export default async function getTests(directory = ".") {
  let tests: string[] = [];
  const logger = new ProgressLogger(['⏳ Load tests..', '⏳ Load tests.·.', '⏳ Load tests..·'])
  logger.start()

  try {
    for await (const entry of Deno.readDir(directory)) {
      if (entry.isSymlink) continue

      if (entry.isDirectory) {
        tests = [...tests, ...(await getTests(`./${entry.name}`))];
        continue;
      }

      if (entry.isFile && /(\.tapper\.)(js|ts)/.test(entry.name)) tests.push(`${directory}/${entry.name}`);
    }
  }
  catch (e) {
    console.error(e)
  }
  finally {
    logger.stop()
  }

  return tests;
}
