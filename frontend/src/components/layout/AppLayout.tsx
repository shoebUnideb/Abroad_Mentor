import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';

/**
 * Main authenticated shell:
 *   ┌─────────────────────────────────────────┐
 *   │  Topbar (fixed, 56px)                   │
 *   ├──────────┬──────────────────────────────┤
 *   │ Sidebar  │  <Outlet /> (page content)   │
 *   │ (240px)  │  <Footer />                  │
 *   └──────────┴──────────────────────────────┘
 */
export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <Topbar />
      <div className="ml-60 mt-14 flex flex-col min-h-[calc(100vh-56px)]">
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
