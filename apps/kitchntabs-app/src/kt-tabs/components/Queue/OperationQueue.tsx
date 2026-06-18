/**
 * Queue system for managing sequential API operations with controlled timing
 */
 export interface IOperationQueue {
    queue: Array<() => Promise<any>>;
    processing: boolean;
    delayMs: number;
    onQueueChange?: (queueSize: number) => void;
    add(operation: () => Promise<any>): Promise<any>;
    size(): number;
}


export class OperationQueue implements IOperationQueue {
  public queue: Array<() => Promise<any>> = [];
  public processing: boolean = false;
  public delayMs: number;
  public onQueueChange?: (queueSize: number) => void;

  /**
   * @param delayMs Delay in milliseconds between operations
   * @param onQueueChange Optional callback that fires when queue size changes
   */
  constructor(delayMs: number = 1000, onQueueChange?: (queueSize: number) => void) {
    this.delayMs = delayMs;
    this.onQueueChange = onQueueChange;
  }

  /**
   * Add an operation to the queue
   * @param operation Function that returns a promise
   * @returns Promise that resolves when the operation completes
   */
  public add(operation: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      // Wrap the operation to capture its result
      const wrappedOperation = async () => {
        try {
          const result = await operation();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      };

      this.queue.push(wrappedOperation);
      
      // Notify about queue change if callback exists
      if (this.onQueueChange) {
        this.onQueueChange(this.queue.length);
      }
      
      // Start processing if not already in progress
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  /**
   * Get current queue size
   */
  public size(): number {
    return this.queue.length;
  }

  /**
   * Process the queue sequentially with delays
   */
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const operation = this.queue.shift();
    
    // Notify about queue change if callback exists
    if (this.onQueueChange) {
      this.onQueueChange(this.queue.length);
    }
    
    try {
      await operation();
    } catch (error) {
      console.error("Operation failed:", error);
      // Continue processing the queue even if an operation fails
    }

    // Wait before processing the next item
    await new Promise(resolve => setTimeout(resolve, this.delayMs));
    this.processQueue();
  }
}

export default OperationQueue;