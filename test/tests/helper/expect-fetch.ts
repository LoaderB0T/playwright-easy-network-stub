import { expect, Page } from '@playwright/test';
import { HttpMethod } from 'easy-network-stub';
import { getError } from './expected-error';

export type FetchType = {
  url: string;
  method?: HttpMethod;
  body?: any;
};

export const expectFetch = async (page: Page, cfg: FetchType, expectedData: any) => {
  const fetchedData = await doFetch(page, cfg);
  expect(fetchedData).toEqual(expectedData);
};

export const doFetch = async (page: Page, cfg: FetchType) => {
  const fetchedData = await page.evaluate(
    async ([fetchUrl, fetchMethod, fetchBody]) => {
      const res = await window.fetch(fetchUrl, { method: fetchMethod, body: fetchBody });
      const data = await res.json();
      return data;
    },
    [cfg.url, cfg.method ?? 'GET', cfg.body]
  );
  return fetchedData;
};

export const expectFailFetch = async (
  page: Page,
  baseUrl: string,
  url: string,
  method: HttpMethod,
  getLastError: () => string
) => {
  await doFetch(page, { url, method }).catch(() => {});
  expect(getLastError()).toBe(getError(baseUrl + url, method));
};
