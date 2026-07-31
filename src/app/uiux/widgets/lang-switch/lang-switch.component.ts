import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import type { ICoreConfig } from '@core/interface/IAppConfig';
import type { ILanguage } from '@core/interface/IEnvironment';
import { CORE_CONFIG, LANG } from '@core/token/token-providers';
import { environment } from 'src/environments/environment';
import { ContentService } from '@core/service/content.service';
import { PlatformLocation } from '@angular/common';

@Component({
    selector: 'app-lang-switch',
    templateUrl: './lang-switch.component.html',
    styleUrls: ['./lang-switch.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class LangSwitchComponent implements OnInit {
  coreConfig = inject<ICoreConfig>(CORE_CONFIG);
  lang = inject<ILanguage>(LANG);
  private router = inject(Router);
  private translateService = inject(TranslateService);
  private contentService = inject(ContentService);
  private cd = inject(ChangeDetectorRef);
  private platformLocation = inject(PlatformLocation);

  currentLang = signal<ILanguage>({
    label: '中文',
    langCode: 'zh-hans',
    prefix: '/',
    default: true
  });
  langs = environment?.langs;
  multiLang = environment?.multiLang;

  ngOnInit(): void {
    const langFromUrl = this.getLangFromUrl();
    if (langFromUrl) {
      this.currentLang.set(langFromUrl);
    } else {
      this.currentLang.set(this.lang);
    }
    this.translateService.use(this.currentLang()?.langCode || 'zh-hans');
  }

  getLangFromUrl(): ILanguage | null {
    const pathname = this.platformLocation.pathname;
    const langCode = pathname.split('/')[1];
    return this.langs?.find(l => l.langCode === langCode) || null;
  }

  onSwitchLanguage(lang: ILanguage): void {
    this.currentLang.set(lang);
    this.translateService.use(lang.langCode);
    this.contentService.reloadBranding(lang.langCode);
    this.cd.markForCheck();
    const pathname = this.platformLocation.pathname;
    const search = this.platformLocation.search;
    const url = this.removeLangPrefix(pathname);
    const langPrefix = lang.prefix === '/' ? '' : lang.prefix;
    const queryParams = search ? `${search}` : '';
    this.router.navigateByUrl(`${langPrefix}${url}${queryParams}`);
  }

  removeLangPrefix(urlPath: string): string {
    const pathParts = urlPath.split('/');
    // check if the path is like /en/some/path
    const isLangPage = this.langs?.find(lang => urlPath.startsWith(`/${lang.langCode}`));

    if (isLangPage) {
      const remainingPath = pathParts.slice(2).join('/');
      return remainingPath;
    } else {
      return urlPath;
    }
  }
}
