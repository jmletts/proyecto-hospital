import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  meta: any;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // Si el controlador ya devuelve una estructura con metadata (ej. paginación)
        const hasMeta = data && typeof data === 'object' && 'meta' in data && 'data' in data;
        const meta = hasMeta ? data.meta : { timestamp: new Date().toISOString() };
        const responseData = hasMeta ? data.data : data;

        return {
          success: true,
          data: responseData,
          meta,
        };
      }),
    );
  }
}
