import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { serverRoutes } from './app.routes.server';
import { routes } from './app.routes';
import { provideServerRouting } from '@angular/ssr';

export const appConfig: ApplicationConfig = {
    providers: [provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideServerRouting(serverRoutes),
    provideClientHydration(withEventReplay())]
};
