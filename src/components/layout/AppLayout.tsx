import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const AppLayout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};


