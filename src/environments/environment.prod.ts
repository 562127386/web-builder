import { IEnvironment } from '../app/core/interface/IEnvironment';

export const environment: IEnvironment = {
  apiUrl: 'http://web.lightcomm.com:8087',
  production: false,
  port: 4200,
  cache: true,
  multiLang: true,
  langs: [
    {
      label: '中文',
      langCode: 'zh-hans',
      prefix: '/',
      default: true,
    },
    {
      label: 'EN',
      langCode: 'en',
      prefix: '/en',
    },
  ],
  oauth: {
    clientId: 'xxx',
    tokenUrl: '/oauth/token',
    scope: '',
  },
  abpApi: {
    url: 'http://newapi.lightcomm.com',
  },
};
