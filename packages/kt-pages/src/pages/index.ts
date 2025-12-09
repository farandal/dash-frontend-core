// kt-pages - All Pages
export * from './Account';
export * from './Misc';
export * from './Static';

// Re-export with namespaces for clarity
import * as Account from './Account';
import * as Misc from './Misc';
import * as Static from './Static';

export { Account, Misc, Static };
