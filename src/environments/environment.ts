export const environment = {
  apiUrl: 'http://localhost:4200',
  production: false,
  port: 4200,
  cache: false,
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
    url: 'https://localhost:44388',
   // url: 'http://newapi.lightcomm.com',
  },
};
