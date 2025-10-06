interface Window {
  ethereum: any;
}

// Avoid auto-typings pulling in ambient libs we don't use
// by declaring minimal modules when needed
declare module "stats.js";
declare module "draco3d";