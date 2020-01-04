import { ConsulConfig, InjectConfig } from '@nestcloud/config';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { post } from 'request';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logitApiKey: string;
  constructor(@InjectConfig() private config: ConsulConfig) {
    this.config.watch('logitApiKey', key => {
      this.logitApiKey = key;
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getClass().name === 'PromController') {
      // ignore metric calls
      return next.handle();
    } else {
      const methodName = context.getHandler().name;
      const date = new Date();

      this.sendLog({
        methodName,
        type: 'ENTRY',
      });

      return next.handle().pipe(
        tap(() => {
          this.sendLog({
            methodName,
            type: 'EXIT',
            time: `${new Date().getTime() - date.getTime()}ms`,
          });
        }),
      );
    }
  }

  private sendLog(data: any) {
    post('https://api.logit.io/v2', {
      headers: {
        ApiKey: this.logitApiKey,
        LogType: 'json',
      },
      json: true,
      body: {
        service: 'music-catalog-ms',
        timestamp: new Date(),
        ...data,
      },
    });
  }
}