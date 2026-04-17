/**
 * Public Layout
 * 
 * Wrapper layout for public/marketing pages.
 * Includes top navigation and main content area.
 */

import { Outlet } from 'react-router-dom';
import { PublicTopNav } from './PublicTopNav';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-[#030014] text-white">
      <PublicTopNav />
      {/* Add padding-top to account for fixed nav */}
      <main className="pt-16 sm:pt-20">
        <Outlet />
      </main>
    </div>
  );
};
