import "https://deno.land/std@0.147.0/dotenv/load.ts";
import { Client } from "https://deno.land/x/postgres@v0.16.1/mod.ts";
import { TestContext } from '../types/index.ts'

async function runner(name: string, f: (context: TestContext) => void) {
  console.log(`Running: ${name}`)

  const client = new Client();

  await client.connect();

  const context = new TestContext()

  f(context)

  let { rows }: { rows: string[][] | string[] } = await client.queryArray<
    string[]
  >(`BEGIN;SELECT plan(${context.results.length});${context.results.join("\n")
    }SELECT * FROM finish();ROLLBACK;`);


  if (rows.length < 1) {
    await client.end();
    return;
  }

  rows = rows.flat();
  rows.shift();
  rows.pop();

  const res = rows.map<{
    status: "Failure" | "Success";
    description: string;
    errorMsg: string;
  }>((r) => {
    const results = r.split(" - ");
    const failure = results[0].includes("not ok ");

    return {
      status: failure ? "Failure" : "Success",
      description: results[1].split("\n#")[0],
      errorMsg: failure ? results[1].split("\n#").slice(1).join("\n#") : "",
    };
  });

  res.forEach((r) => {
    if (r.status === "Failure") {
      console.log(`[ERROR] ${r.description}`);
      console.log(r.errorMsg);
    } else {
      console.log(r.description);
    }
  });

  await client.end();
}

export default runner