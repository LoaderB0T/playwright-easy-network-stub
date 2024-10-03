import { type BrowserContext } from '@playwright/test';
import { EasyNetworkStub, HttpMethod } from 'easy-network-stub';
export class PlaywrightEasyNetworkStub extends EasyNetworkStub {
  /**
   * A class to intercept and stub all calls to a certain api path.
   * @param urlMatch The match for all request urls that should be intercepted.
   * All non-stubbed calls that match this interceptor will throw an error
   */
  constructor(urlMatch: string | RegExp) {
    super(urlMatch);
  }

  /**
   * Call this in your beforeEach hook to start using the stub.
   * @returns A promise that resolves when the stub is ready to use.
   */
  public async init(context: BrowserContext) {
    return this.initInternal({
      failer: error => {
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error(error);
        }
      },
      interceptor: (baseUrl, handler) => {
        return context.route(baseUrl, async route => {
          await handler({
            destroy: () => route.abort(),
            method: route.request().method() as HttpMethod,
            body: route.request().postData(),
            headers: await route.request().allHeaders(),
            url: route.request().url(),
            reply: r =>
              route.fulfill({
                status: r.statusCode,
                body: JSON.stringify(r.body),
                headers: r.headers,
              }),
          });
        });
      },
    });
  }
}
