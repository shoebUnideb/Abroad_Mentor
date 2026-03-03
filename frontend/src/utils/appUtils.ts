import type { Application } from '../types';

/** Calculate what % of steps are approved */
export function getApplicationProgress(app: Application): number {
  if (!app.steps || app.steps.length === 0) return 0;
  const approved = app.steps.filter(s => s.status === 'approved').length;
  return Math.round((approved / app.steps.length) * 100);
}
