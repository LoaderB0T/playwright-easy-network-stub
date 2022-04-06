import test, { expect } from '@playwright/test';
import { PlaywrightEasyNetworkStub } from 'playwright-easy-network-stub';
import { expectFailFetch, expectFetch } from './helper/expect-fetch';

let blogStub: PlaywrightEasyNetworkStub;
let lastError: string;
const baseUrl = 'https://example.com';

test.beforeEach(async ({ page, context }) => {
  await page.goto(baseUrl);
  // blogStub = new PlaywrightEasyNetworkStub('**/MyServer/api/Blog/**');
  // await blogStub.init(context);
  // blogStub['config'].failer = (error: string) => {
  //   lastError = error;
  // };
  // blogStub['config'].errorLogger = (error: string) => {
  //   // Do nothing
  // };
});

test.describe('PlaywrightEasyNetworkStub', async () => {
  test('bla', () => {
    expect(1).toBe(1);
  });
  //   test('Mock with static url', async ({ page }) => {
  //     blogStub.stub('GET', 'posts', () => {
  //       return [
  //         { id: 1, title: 'Hello' },
  //         { id: 2, title: 'World' }
  //       ];
  //     });

  //     await expectFetch(page, { url: '/MyServer/api/Blog/posts' }, [
  //       { id: 1, title: 'Hello' },
  //       { id: 2, title: 'World' }
  //     ]);
  //     // Trailing slash is matched as well
  //     await expectFetch(page, { url: '/MyServer/api/Blog/posts/' }, [
  //       { id: 1, title: 'Hello' },
  //       { id: 2, title: 'World' }
  //     ]);
  //   });

  //   test('Get error for not mocked paths', async ({ page }) => {
  //     blogStub.stub('GET', 'posts', () => {
  //       return [
  //         { id: 1, title: 'Hello' },
  //         { id: 2, title: 'World' }
  //       ];
  //     });
  //     await expectFailFetch(page, baseUrl, '/MyServer/api/Blog/posts2', 'GET', () => lastError);
  //     await expectFailFetch(page, baseUrl, '/MyServer/api/Blog/post', 'GET', () => lastError);
  //     await expectFailFetch(page, baseUrl, '/MyServer/api/Blog/posts/my', 'GET', () => lastError);
  //     await expectFailFetch(page, baseUrl, '/MyServer/api/Blog/', 'GET', () => lastError);
  //   });

  //   test('Get error for not mocked methods', async ({ page }) => {
  //     blogStub.stub('GET', 'posts', () => {
  //       return [
  //         { id: 1, title: 'Hello' },
  //         { id: 2, title: 'World' }
  //       ];
  //     });
  //     await expectFailFetch(page, baseUrl, '/MyServer/api/Blog/posts', 'POST', () => lastError);
  //     await expectFailFetch(page, baseUrl, '/MyServer/api/Blog/posts', 'DELETE', () => lastError);
  //     await expectFailFetch(page, baseUrl, '/MyServer/api/Blog/posts', 'PUT', () => lastError);
  //     await expectFailFetch(page, baseUrl, '/MyServer/api/Blog/posts', 'PATCH', () => lastError);
  //   });

  //   test('Mock with typed parameters', async ({ page }) => {
  //     blogStub.stub('GET', 'posts1/{id}', ({ params }) => {
  //       return { id: params.id, title: 'Hello' };
  //     });
  //     await expectFetch(page, { url: '/MyServer/api/Blog/posts1/1' }, { id: '1', title: 'Hello' });
  //     await expectFetch(page, { url: '/MyServer/api/Blog/posts1/2' }, { id: '2', title: 'Hello' });

  //     blogStub.stub('GET', 'posts2/{id:number}', ({ params }) => {
  //       return { id: params.id, title: 'Hello' };
  //     });
  //     await expectFetch(page, { url: '/MyServer/api/Blog/posts2/1' }, { id: 1, title: 'Hello' });
  //     await expectFetch(page, { url: '/MyServer/api/Blog/posts2/2' }, { id: 2, title: 'Hello' });

  //     blogStub.stub('GET', 'posts3/{read:boolean}', ({ params }) => {
  //       return [
  //         { id: 1, title: 'Hello', read: true },
  //         { id: 2, title: 'World', read: false },
  //         { id: 3, title: 'Hello2', read: true },
  //         { id: 4, title: 'World2', read: false }
  //       ].filter(x => x.read === params.read);
  //     });
  //     await expectFetch(page, { url: '/MyServer/api/Blog/posts3/true' }, [
  //       { id: 1, title: 'Hello', read: true },
  //       { id: 3, title: 'Hello2', read: true }
  //     ]);
  //     await expectFetch(page, { url: '/MyServer/api/Blog/posts3/false' }, [
  //       { id: 2, title: 'World', read: false },
  //       { id: 4, title: 'World2', read: false }
  //     ]);
  //   });

  //   test('Non-object return value', async ({ page }) => {
  //     blogStub.stub('GET', 'posts1/bool', () => {
  //       return true;
  //     });
  //     blogStub.stub('GET', 'posts1/number', () => {
  //       return 12;
  //     });
  //     blogStub.stub('GET', 'posts1/string', () => {
  //       return 'test string';
  //     });

  //     await expectFetch(page, { url: '/MyServer/api/Blog/posts1/bool' }, true);
  //     await expectFetch(page, { url: '/MyServer/api/Blog/posts1/number' }, 12);
  //     await expectFetch(page, { url: '/MyServer/api/Blog/posts1/string' }, 'test string');
  //   });
});
