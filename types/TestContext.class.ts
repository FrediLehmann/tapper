export default class TestContext {
  public results: string[];

  constructor() {
    this.results = [];
  }

  public ok = (description: string, operation: string) =>
    this.results.push(`SELECT ok(${operation}, '${description}');`);

  public is = (description: string, have: string, want: string) =>
    this.results.push(`SELECT is(${have}, ${want}, '${description}');`);
}