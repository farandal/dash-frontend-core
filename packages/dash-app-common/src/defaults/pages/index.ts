/**
 * Default Pages Index
 * 
 * Default page components for common application pages.
 */

// Auth pages (standalone - no react-admin dependency)
export { default as DashDefaultLogin } from './DashDefaultLogin';

// Account pages
export { default as DashDefaultRegisterPage } from './Account/DashDefaultRegister';
export { default as DashDefaultSignUpPage } from './Account/DashDefaultSignUp';
export { default as DashDefaultSignUpSuccessPage } from './Account/DashDefaultSignUpSuccess';

// Misc pages (Error pages)
export { default as DashDefaultNotFoundPage } from './Misc/DashDefaultNotFound';
export { default as DashDefaultUnauthorizedPage } from './Misc/DashDefaultUnauthorized';
export { default as DashDefaultServerErrorPage } from './Misc/DashDefaultServerError';

// Static pages
export { default as DashDefaultStaticPage } from './Static/DashDefaultStaticPage';
export { default as DashDefaultTermsPage } from './Static/DashDefaultTermsPage';
export { default as DashDefaultPrivacyPage } from './Static/DashDefaultPrivacyPage';

// Re-export modules
export * from './Account';
export * from './Misc';
export * from './Static';
