declare namespace App {
  interface Locals {
    /** The server's client for this request, with the buyer's token when signed in. */
    api: import('./lib/api/client').Api;
    session: import('./lib/session').Session;
    viewer: import('./lib/session').Viewer | null;
    reputation?: Promise<import('./lib/api/client').Schemas['ReputationScreen']>;
  }
}
