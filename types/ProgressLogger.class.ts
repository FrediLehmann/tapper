export default class ProgressLogger {
  private current: number;
  private texts: Uint8Array[];
  private interval: number;

  constructor(progressTexts: string[]) {
    this.current = 0
    this.interval = NaN

    this.texts = progressTexts.map(t => new TextEncoder().encode(t))
  }

  private log = async () => {
    console.clear()
    await Deno.stdout.write(this.texts[this.current])

    this.current === this.texts.length - 1 ? this.current = 0 : this.current++
  }

  public start = () => {
    this.interval = setInterval(this.log, 200)
  }

  public stop = () => {
    this.interval && clearInterval(this.interval)
    console.clear()
  }
}