import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
    {
        path: 'jobs',
        renderMode: RenderMode.Prerender
    },
    {
        path: '**',
        renderMode: RenderMode.Prerender
    }
];
