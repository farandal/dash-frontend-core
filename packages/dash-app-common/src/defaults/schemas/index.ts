/**
 * Default Schemas Index
 * 
 * Default schema configurations for resources.
 * These schemas provide common field configurations that can be
 * customized or extended for specific resources.
 */

// Base schema
export { default as dashDefaultSchema } from './dashDefaultSchema';

// Demo schemas
export * from './demo';
export { default as dashDefaultTodoSchema } from './demo/dashDefaultTodoSchema';
