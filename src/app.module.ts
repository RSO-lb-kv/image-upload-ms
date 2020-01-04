import { BootModule } from '@nestcloud/boot';
import { NEST_BOOT, NEST_CONSUL } from '@nestcloud/common';
import { ConfigModule } from '@nestcloud/config';
import { ConsulModule } from '@nestcloud/consul';
import { ServiceModule } from '@nestcloud/service';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { resolve } from 'path';

import { HealthModule } from './health/health.module';
import { TerminusService } from './health/terminus.service';
import { LoggingInterceptor } from './interceptors/loging.interceptor';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    UploadModule,

    BootModule.register(resolve(), process.env.DEVELOPMENT === 'true' ? 'consul-dev.yml' : 'consul.yml'),

    ConsulModule.register({ dependencies: [NEST_BOOT] }),

    ConfigModule.register({ dependencies: [NEST_BOOT, NEST_CONSUL] }),

    ServiceModule.register({
      dependencies: [NEST_CONSUL],
      service: {
        id: 'image-upload-ms',
        name: 'image-upload-ms',
        port: +process.env.PORT,
      },
      healthCheck: {
        timeout: '1s',
        interval: '10s',
        deregistercriticalserviceafter: '30s',
        route: '/health/ready',
      } as any,
      maxRetry: 5,
      retryInterval: 5000,
    }),

    TerminusModule.forRootAsync({
      imports: [HealthModule],
      useClass: TerminusService,
    }),
  ],

  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor
    }
  ]
})
export class AppModule { }
