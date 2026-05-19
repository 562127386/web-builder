export interface IOAuth {
  clientId: string;
  tokenUrl: string;
  scope?: string;
}

export interface IEnvironment {
  apiUrl: string;
  production: boolean;
  port: number;
  cache: boolean;
  multiLang?: boolean;
  langs?: ILanguage[];
  oauth: IOAuth;
  abpApi: IAbpUrl;
}

export interface ILanguage {
  label: string;
  langCode: string;
  default?: boolean;
  prefix: string;
}


export interface IAbpUrl {
  url: string;
}
