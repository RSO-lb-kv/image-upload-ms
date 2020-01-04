import { Injectable } from '@nestjs/common';
import { HealthIndicator } from '@nestjs/terminus';

@Injectable()
export class HealthService extends HealthIndicator {
  async isHealthy() {
    return this.getStatus('comments-ms', true);
  }
}
