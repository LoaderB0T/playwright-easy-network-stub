import { BrowserContext } from '@playwright/test';
import { PlaywrightEasyNetworkStub } from '../src/playwright-easy-network-stub';

export class Test {
  init() {
    const posts = [0, 1, 2, 3, 4, 5].map(x => ({ postId: x, text: `test${x}` }));

    const blogStub = new PlaywrightEasyNetworkStub('/MyServer/api/Blog');

    blogStub.init({} as BrowserContext);

    blogStub.stub('GET', 'posts', (body, params) => {
      return posts;
    });

    blogStub.stub('GET', 'posts/{id:number}', (body, params) => {
      return posts.find(x => x.postId === params.id);
    });

    blogStub.stub('POST', 'posts', (body, params) => {
      posts.push({ postId: body.postId, text: body.text });
    });

    blogStub.stub('DELETE', 'posts/{id:number}/{id2}/{id3:number}', (body, params) => {
      const idx = posts.findIndex(x => x.postId === params.id);
      posts.splice(idx, 1);
    });
    blogStub.stub('DELETE', 'posts/{id:number}?{id2}&{id3:number}', (body, params) => {
      const idx = posts.findIndex(x => x.postId === params.id);
      posts.splice(idx, 1);
    });

    blogStub.stub('GET', 'test/{id:number}/{test}?{bla:number}', (body, params) => {
      console.log(params);
    });
  }
}
