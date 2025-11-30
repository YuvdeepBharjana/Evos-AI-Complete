import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const AppLayout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950">
      <Sidebar />
      {/* Main content area - add padding for mobile header/bottom nav */}
      <div className="flex-1 flex flex-col overflow-y-auto pt-16 pb-20 md:pt-0 md:pb-0">
        <Outlet />
      </div>
    </div>
  );
};
