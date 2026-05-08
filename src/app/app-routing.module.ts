import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { PreviewComponent } from '@modules/builder/preview/preview.component';
import { PageComponent } from '@modules/page/page/page.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: PageComponent,
  },
  {
    path: 'news',
    component: PageComponent,
  },
  {
    path: 'news/:slug',
    component: PageComponent,
  },
  {
    path: 'products',
    component: PageComponent,
  },
  {
    path: 'productLists/:id',
    component: PageComponent,
  },
  {
    path: 'about',
    component: PageComponent,
  },
  {
    path: 'careers',
    component: PageComponent,
  },
  {
    path: 'contact',
    component: PageComponent,
  },
  {
    path: 'me',
    loadChildren: () => import('./modules/user/user.module').then(m => m.UserModule),
  },
  {
    path: 'preview',
    component: PreviewComponent,
  },
  {
    path: 'builder',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/builder/builder.module').then(m => m.BuilderModule),
  },
  {
    path: 'en/builder',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/builder/builder.module').then(m => m.BuilderModule),
  },
  {
    path: '**',
    component: PageComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      preloadingStrategy: PreloadAllModules,
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
