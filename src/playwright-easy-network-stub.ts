import { BrowserContext } from '@playwright/test';
import { headers, preflightHeaders } from './consts/headers';
import { ErrorResponse } from './models/error-response';
import { HttpMethod } from './models/http-method';
import { ParameterType, ParamMatcher, ParamType } from './models/parameter-type';
import { RouteParam } from './models/route-param';
import { RouteParams } from './models/route-params';
import { RouteResponseCallback } from './models/route-response-callback';
import { Stub } from './models/stub';

export class PlaywrightEasyNetworkStub {
  private readonly _stubs: Stub<any>[] = [];
  private readonly _urlMatch: string | RegExp;
  private readonly _parameterTypes: ParameterType[] = [];

  /**
   * A class to intercept and stub all calls to a certain api path.
   * @param urlMatch The match for all request urls that should be intercepted.
   * All non-stubbed calls that match this interceptor will throw an error
   */
  constructor(urlMatch: string | RegExp) {
    this._urlMatch = urlMatch;

    this.addParameterType('string', '(\\w+)', 'route');
    this.addParameterType('number', '(\\d+)', 'route', a => Number.parseInt(a, 10));
    this.addParameterType('boolean', '(true|false)', 'route', a => a === 'true');

    this.addParameterType('string', '([\\w%]+)', 'query');
    this.addParameterType('number', '(\\d+)', 'query', a => Number.parseInt(a, 10));
    this.addParameterType('boolean', '(true|false)', 'query', a => a === 'true');
  }

  /**
   * Call this in your beforeEach hook to start using the stub.
   * @returns The cypress chainable to chain to and to have it include itself into an existing chain.
   */
  public async init(context: BrowserContext) {
    return await context.route(this._urlMatch, async route => {
      const requestUrl = route.request().url().toLowerCase();

      if (route.request().method().toUpperCase() === 'OPTIONS') {
        return route.fulfill({ status: 200, body: undefined, headers: preflightHeaders });
      }

      const stub = this._stubs.find(x => requestUrl.match(x.regx) && x.method === route.request().method());

      if (!stub) {
        console.error('Route not mocked');
        console.groupCollapsed('Mocking info');
        console.groupCollapsed('Request');
        console.log(route.request());
        console.groupEnd();
        console.groupCollapsed('Mocks');
        console.log(this._stubs);
        console.groupEnd();
        console.groupEnd();
        route.abort();
        throw new Error('Route not mocked: ' + requestUrl);
        // context.il(true, 'Route not mocked: ' + requestUrl);
        return;
      }
      const res = requestUrl.match(stub.regx);

      if (!res) {
        throw new Error('The provided matcher did not match the current request');
      }

      const paramMap: RouteParams = {};
      for (let i = 0; i < stub.params.length; i++) {
        const param = stub.params[i];
        let paramValue: any;

        const knownParameter = this._parameterTypes.find(x => x.name === param.type);
        if (knownParameter) {
          paramValue = knownParameter.parser(res[i + 1]);
        } else {
          paramValue = res[i + 1];
        }

        paramMap[stub.params[i].name] = paramValue;
      }

      let parsedBody: any;

      try {
        parsedBody = JSON.parse(route.request().postData()!);
      } catch {
        if (route.request().postData() === 'true') {
          parsedBody = true;
        } else if (route.request().postData() === 'false') {
          parsedBody = false;
        } else if (/^\d+$/.test(route.request().postData()!)) {
          parsedBody = Number.parseInt(route.request().postData()!, 10);
        } else if (/^\d*.\d*$/.test(route.request().postData()!)) {
          parsedBody = Number.parseFloat(route.request().postData()!);
        } else {
          parsedBody = route.request().postData();
        }
      }
      let response: any;
      try {
        response = await stub.response(parsedBody, paramMap);
      } catch (e: any) {
        const error = e as ErrorResponse<any>;
        const errorContent = typeof error.content !== 'object' ? JSON.stringify(error) : error.content;
        let errorHeaders = { ...headers };
        if (error.headers) {
          errorHeaders = { ...errorHeaders, ...error.headers };
        }
        if (error.statusCode) {
          return route.fulfill({ status: error.statusCode, body: errorContent, headers: errorHeaders });
        } else {
          return route.fulfill({ status: 500, body: JSON.stringify(errorContent ?? 'unknown error in mocked response') });
        }
      }

      if (typeof response !== 'object') {
        // Because strings or other primitive types also get parsed with JSON.parse, we need to strigify them here first
        response = JSON.stringify(response);
      }

      console.groupCollapsed('[stub]' + stub.method + ' - ' + stub.regx.source);
      console.groupCollapsed('request');
      console.log('url: ' + requestUrl);
      console.groupCollapsed('headers');
      console.log(route.request().headers);
      console.groupEnd();
      console.groupCollapsed('body');
      console.log(route.request().postData());
      console.groupEnd();
      console.groupCollapsed('parsedBody');
      console.log(parsedBody);
      console.groupEnd();
      console.groupEnd();
      console.groupCollapsed('response');
      console.groupCollapsed('body');
      console.log(response);
      console.groupEnd();
      console.groupCollapsed('headers');
      console.log(headers);
      console.groupEnd();
      console.groupEnd();
      console.groupEnd();

      return route.fulfill({ status: 200, body: JSON.stringify(response), headers });
    });
  }

  /**
   * Add a new parameter type that can be used in the stub method route property.
   * @param name The name of the new parameter (To use it as {name} later in the route property)
   * @param matcher The regex matching group that matches the parameter. Eg: "([a-z]\d+)"
   * @param parser The optional function that parses the string found by the matcher into any type you want.
   */
  public addParameterType(name: string, matcher: ParamMatcher, type: ParamType, parser: (v: string) => any = s => s) {
    this._parameterTypes.push({ name, matcher, parser, type });
  }

  /**
   * Add a single api stub to your intercepted routes.
   * @param method The http method that should be stubbed
   * @param route The route that should be stubbed. Supports parameters in the form of {name:type}.
   * @param response The callback in which you can process the request and reply with the stub. When a Promise is returned, the stub response will be delayed until it is resolved.
   */
  public stub<Route extends string>(method: HttpMethod, route: Route, response: RouteResponseCallback<Route>): void {
    const segments = route.split(/(?=[\/?&])/);
    const params: RouteParam[] = [];
    const rgxString =
      segments
        .map(segment => {
          let prefix = segment.charAt(0);
          if (prefix === '/' || prefix === '&' || prefix === '?') {
            segment = segment.substring(1);
          } else {
            prefix = '';
          }
          const paramType: ParamType = prefix === '/' || prefix === '' ? 'route' : 'query';
          if (prefix === '?') {
            prefix = `\\${prefix}`;
          }
          const paramMatch = segment.match(/{(\w+)([:]\w+)?}/);
          if (paramMatch) {
            const paramName = paramMatch[1];
            if (paramName) {
              const paramValueType = paramMatch[2]?.substring(1) ?? 'string';
              params.push({ name: paramName, type: paramValueType });
              const knownParameter = this._parameterTypes.find(x => x.name === paramValueType && x.type === paramType);
              if (knownParameter) {
                return (
                  prefix + (paramType === 'route' ? knownParameter.matcher : `${paramName}(?:=(?:${knownParameter.matcher})?)?`)
                );
              }
            }
            return prefix + (paramType === 'route' ? '(\\w+)' : '\\w+=(\\w+)');
          } else {
            return prefix + segment;
          }
        })
        .join('') + '/?$';

    const regx = new RegExp(rgxString, 'i');

    this._stubs.push({
      regx,
      response,
      params,
      method
    });
  }
}
