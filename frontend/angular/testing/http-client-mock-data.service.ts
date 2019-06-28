import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { ConfigService } from 'lsg-ext';
import { HttpBackend, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { TestRequest } from '@angular/common/http/testing';
import { Observer ,  Observable } from 'rxjs';

declare var require: any;

interface MockData {[path: string]: any};
export const AdditionalMockData: InjectionToken<MockData> = new InjectionToken('additional mock data for http testing');

@Injectable()
export class HttpClientMockDataService {

  /** mock-data loaded from mock-data.json */
  public mockData: {[requestUrl: string]: any} = require('./mock-data/mock-data.json');

  public mockDataAdmin: {[requestUrl: string]: any} = require('./mock-data/mock-data-admin.json');

  public mockDataFrontendOnly: {[requestUrl: string]: any} = require('./mock-data/mock-data-frontend-only.json');

  public mockDataDynamic: {[requestUrl: string]: any} = require('./mock-data/mock-data-dynamic.json');

  public mockDataPlanningAssumptions: {[requestUrl: string]: any} = require('./mock-data/mock-data-planning-assumptions.json');

  constructor(private connectionBackend: HttpBackend,
              private configService: ConfigService,
              @Optional() @Inject(AdditionalMockData) private additionalMockData: MockData) {
    for (let i in this.mockDataFrontendOnly) {
      if (this.mockDataFrontendOnly.hasOwnProperty(i)) {
        this.mockData[i] = this.mockDataFrontendOnly[i];
      }
    }
    for (let i in this.mockDataAdmin) {
      if (this.mockDataAdmin.hasOwnProperty(i)) {
        this.mockData[i] = this.mockDataAdmin[i];
      }
    }
    for (let i in this.mockDataDynamic) {
      if (this.mockDataDynamic.hasOwnProperty(i)) {
        this.mockData[i] = this.mockDataDynamic[i];
      }
    }
    for (let i in this.mockDataPlanningAssumptions) {
      if (this.mockDataPlanningAssumptions.hasOwnProperty(i)) {
        this.mockData[i] = this.mockDataPlanningAssumptions[i];
      }
    }
    if (this.additionalMockData) {
      for (let i in this.additionalMockData) {
        if (this.additionalMockData.hasOwnProperty(i)) {
          this.mockData[i] = this.additionalMockData[i];
        }
      }
    }
  }

  /**
   * Handles a request from the HttpClientMockDataInterceptor
   * @param {HttpRequest<any>} request
   * @returns {Observable<HttpEvent<any>>}
   */
  public handleRequest(request: HttpRequest<any>): Observable<HttpEvent<any>> {
    return new Observable((observer: Observer<any>) => {
      const testReq = new TestRequest(request, observer);
      observer.next({ type: HttpEventType.Sent } as HttpEvent<any>);
      this.handleTestRequest(testReq);
      return () => { };
    });
  }

  /**
   * Handles the test request and responds with mock data, if any
   * @param {TestRequest} testRequest
   */
  private handleTestRequest(testRequest: TestRequest): void {
    const requestUrl = testRequest.request.urlWithParams;
    const apiBaseUrl = this.configService.getConfiguration().apiBaseUrl;

    if (requestUrl.indexOf(apiBaseUrl) === 0 && this.mockData[requestUrl.substring(apiBaseUrl.length)]) {
      const mockData = this.mockData[requestUrl.substring(apiBaseUrl.length)];
      if (typeof mockData === 'string' && mockData.indexOf('/') === 0) {
        if (this.mockData[mockData]) {
          this.mockResponse(testRequest, this.mockData[mockData]);
          return;
        }
      } else {
        this.mockResponse(testRequest, this.mockData[requestUrl.substring(apiBaseUrl.length)]);
        return;
      }
    }

    this.logRequestWithoutMockData(requestUrl, testRequest);
  }

  /**
   * Send mock data to the test request
   * @param {TestRequest} request
   * @param data
   */
  private mockResponse(request: TestRequest, data: any) {
    request.flush(data);
  }

  /**
   * Logs a request that does not match with any mock data
   * @param {string} url
   * @param {TestRequest} request
   */
  private logRequestWithoutMockData(url: string, request: TestRequest) {
    console.warn('Request without mock-data: ' + request.request.method + ' ' + url);
  }

}
