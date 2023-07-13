
export class Timer
{
    private time = 0;
    private lastTime = 0;
    private running = false;
    private paused = false;

    public reset()
    {
        this.running = false;
        this.time = 0;
    }

    public start()
    {
        this.paused = false;
        this.running = true;
        this.lastTime = performance.now();
    }

    public stop()
    {
        this.running = false;
        this.paused = false;
    }

    public update()
    {
        if (!this.running) return;
        const now = performance.now();
        const elapsed = now - this.lastTime;

        this.lastTime = now;
        if (this.paused) return;
        this.time += elapsed;
    }

    public isRunning()
    {
        return this.running;
    }

    public getTime()
    {
        return this.time;
    }

    public pause()
    {
        this.paused = true;
    }

    public resume()
    {
        this.paused = false;
    }
}