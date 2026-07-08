import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';

export function AppLayout() {
  const { user, logout } = useAuth();
  const canViewCostPrice = usePermission('books.cost_price.view');
  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'A';
  const roleLabel = canViewCostPrice ? 'Manager' : 'Staff';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-4 py-4 shadow-sm sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <span className="font-semibold text-gray-800">Bookstore Admin</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-2 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                {initials}
              </div>
              <div className="pr-1 text-left">
                <p className="text-sm font-medium text-gray-800 mr-2">{user?.name || roleLabel}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="rounded bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
