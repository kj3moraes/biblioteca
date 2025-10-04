'use client';
import * as React from 'react';
import { ExpandableTabs } from './ui/expandable-tabs';
import { Home, PackagePlus } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export function NavMenu() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { title: 'Map', icon: Home },
    { title: 'Create Store', icon: PackagePlus },
  ];

  // Function to determine the currently selected tab based on pathname
  const getSelectedTab = (): number | null => {
    if (pathname === '/') return 0;
    if (pathname === '/bookstore/add') return 1;
    return null;
  };

  const handleNavigation = (index: number | null) => {
    if (index === null) return;

    switch (index) {
      case 0:
        router.push('/');
        break;
      case 1:
        router.push('/bookstore/add');
        break;
    }
  };

  return (
    <div className='fixed bottom-6 left-1/2 z-50 -translate-x-1/2'>
      <ExpandableTabs
        tabs={tabs}
        onChange={handleNavigation}
        className='border-muted'
        selectedTab={getSelectedTab()}
      />
    </div>
  );
}

export default NavMenu;
