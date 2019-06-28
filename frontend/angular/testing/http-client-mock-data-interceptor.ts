import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { HttpClientMockDataService } from './http-client-mock-data.service';


@Injectable()
export class HttpClientMockDataInterceptor implements HttpInterceptor {
  constructor(private mockDataService: HttpClientMockDataService) {

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.mockDataService.handleRequest(req);
  }
}
