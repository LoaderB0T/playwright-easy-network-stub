import test, { expect } from '@playwright/test';
import {EasyWsStub} from 'easy-network-stub/ws';

let wsStub: EasyWsStub;

test.beforeEach(async ({ page, context }, use) => {
  wsStub = new EasyWsStub(5000, 'ws');
  await wsStub.init();
});

test.afterEach(async ({ page, context }, use) => {
  wsStub.close();
});

test('Websocket Test', async ({ page }) => {
  await page.goto('websocket-test.html');
  await wsStub.waitForConnection();
  const expectMsgPromise = wsStub.waitForMessage('Wazzup?');
  await page.click('button');
  await expectMsgPromise;
  wsStub.send('Next Payload');
  expect(await page.locator('#msg').textContent()).toBe('Next Payload');
});
