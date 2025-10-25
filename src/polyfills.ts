// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import 'zone.js';

// Polyfills for face-api.js and WebGL
(window as any).global = window;
(window as any).process = { env: {} };