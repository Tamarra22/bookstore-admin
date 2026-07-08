import type { ReactNode } from 'react';
import { usePermission } from '../../hooks/usePermission';

interface HasPermissionProps {
  permission: string;
  children: ReactNode;
}

// Returning null means React never creates this DOM node at all. There is
// nothing for devtools to un-hide or re-enable, because it was never
// rendered — unlike `disabled` (still in the DOM) or CSS hiding (still in
// the DOM, just invisible). This is a UX/defense-in-depth measure; the API
// independently enforces the real permission check server-side.
export function HasPermission({ permission, children }: HasPermissionProps) {
  const allowed = usePermission(permission);
  return allowed ? <>{children}</> : null;
}
