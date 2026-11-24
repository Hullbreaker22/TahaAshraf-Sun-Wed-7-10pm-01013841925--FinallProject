import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { provideToastr } from 'ngx-toastr';
import { NgxSpinnerModule } from "ngx-spinner"
import { loadingInterceptor } from './core/interceptors/loading-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(CookieService , NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' })),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: false,
      newestOnTop: false,       
      maxOpened: 5,           
      autoDismiss: true,
      toastClass: 'ngx-toastr custom-base-toast',
    }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({scrollPositionRestoration:"top"}),withViewTransitions()), provideClientHydration(),
    provideHttpClient(withInterceptors([authInterceptor,loadingInterceptor])),
  ]
};
