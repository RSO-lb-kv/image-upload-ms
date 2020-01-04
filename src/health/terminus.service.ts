import { Injectable } from '@nestjs/common';
import { TerminusEndpoint, TerminusModuleOptions, TerminusOptionsFactory } from '@nestjs/terminus';

import { HealthService } from './health.service';

@Injectable()
export class TerminusService implements TerminusOptionsFactory {
  constructor(private healthService: HealthService) {}

  createTerminusOptions(): TerminusModuleOptions {
    const liveness: TerminusEndpoint = {
      url: '/health/live',
      healthIndicators: [async () => this.healthService.isHealthy()],
    };
    const readiness: TerminusEndpoint = {
      url: '/health/ready',
      healthIndicators: [async () => this.healthService.isHealthy()],
    };

    return { endpoints: [liveness, readiness] };
  }
}
