import { Controller, Get, Logger } from "@nestjs/common";
import { Cron, Interval, Timeout } from "@nestjs/schedule";
import { VenueHubBatchService as BatchService } from "./batch.service";
import {
  BATCH_ROLLBACK,
  BATCH_TOP_AGENTS,
  BATCH_TOP_PROPERTIES,
} from "./lib/config";

@Controller()
export class BatchController {
  private logger: Logger = new Logger("Batch Controller");
  constructor(private readonly batchService: BatchService) {}

  @Timeout(1000)
  handleInterval() {
    this.logger.debug(`BATCH SERVER READY!`);
  }
  /**
    @Interval(1000)
	handleInterval() {
		this.logger.debug(`INTERVAL TEST`);
	}

  
  **/

  @Cron("00 00 01 * * *", { name: BATCH_ROLLBACK })
  public async batchRollback() {
    try {
      this.logger["context"] = BATCH_ROLLBACK;
      this.logger.debug(`EXECUTED!`);
      await this.batchService.batchRollback();
    } catch (err) {
      this.logger.error(err);
    }
  }

  @Cron("20 00 01 * * *", { name: BATCH_TOP_PROPERTIES })
  public async batchTopProperties() {
    try {
      this.logger["context"] = BATCH_TOP_PROPERTIES;
      this.logger.debug(`EXECUTED!`);
      await this.batchService.batchProperties();
    } catch (err) {
      this.logger.error(err);
    }
  }

  @Cron("40 00 01 * * *", { name: BATCH_TOP_AGENTS })
  public async batchTopAgents() {
    try {
      this.logger["context"] = BATCH_TOP_AGENTS;
      this.logger.debug(`EXECUTED!`);
      await this.batchService.batchAgents();
    } catch (err) {
      this.logger.error(err);
    }
  }

  @Get()
  getHello(): string {
    return this.batchService.getHello();
  }
}
