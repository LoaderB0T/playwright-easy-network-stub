import { PlaywrightEasyNetworkStub } from '../src/playwright-easy-network-stub';
const blogStub = new PlaywrightEasyNetworkStub('/MyServer/api/Blog');

blogStub.stub('DELETE', 'posts/{id:number}/{id2}/{id3:number}?{yee}&{bla:number}', (body, params) => {});
