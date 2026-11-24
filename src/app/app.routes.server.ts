import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'details/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'categoryDetails/:id',
    renderMode: RenderMode.Server ,
  },
  {
    path: 'brandDetails/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender, // أو RenderMode.Server حسب باقي صفحاتك
  },
];