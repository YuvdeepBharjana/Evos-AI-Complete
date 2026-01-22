import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-[#030014] text-white">
      <AppSidebar />
      {/* Main content area - add left margin/padding for sidebar */}
      <main className="md:ml-60 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};
