export interface JobPayload {
  id: string;
  type: "EMAIL" | "NOTIFICATION" | "REPORT_GENERATION";
  data: Record<string, any>;
  attempts: number;
}

export class QueueService {
  private queue: JobPayload[] = [];

  public async enqueue(type: JobPayload["type"], data: Record<string, any>): Promise<string> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const job: JobPayload = { id, type, data, attempts: 0 };
    this.queue.push(job);
    return id;
  }

  public getQueueLength(): number {
    return this.queue.length;
  }
}
