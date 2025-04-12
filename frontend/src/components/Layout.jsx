import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="my-4">
        <Outlet /> {/* This renders child routes */}
      </main>
    </>
  );
}