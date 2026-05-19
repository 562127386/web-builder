import { NgModule } from '@angular/core';
import { PageComponent } from './page/page.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { pageContentFactory } from '@core/factory/factory';
import { PAGE_CONTENT } from '@core/token/token-providers';
import { ShareModule } from '@share/share.module';
import { WidgetsModule } from '@uiux/widgets/widgets.module';
import { BuilderModule } from '../builder/builder.module';
import { BrandingModule } from '@core/branding/branding.module';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarModule } from '@ngx-loading-bar/core';

@NgModule({
  declarations: [PageComponent],
  imports: [
    ShareModule,
    WidgetsModule,
    MatSidenavModule,
    BuilderModule,  //后面要去掉减少体积 但是token里貌似引用需要处理
    BrandingModule,
    LoadingBarHttpClientModule,
    LoadingBarModule,
  ],
  providers: [
    {
      provide: PAGE_CONTENT,
      useFactory: pageContentFactory,
    },
  ],
  exports: [PageComponent],
})
export class PageModule {}
