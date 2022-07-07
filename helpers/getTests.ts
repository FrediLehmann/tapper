/**
 * Get all tests from a directory
 * @param directory root directory to start gathering tests
 * @returns all test files
 */
export default async function getTests(directory = ".") {
  let tests: string[] = [];

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

  return tests;
}
