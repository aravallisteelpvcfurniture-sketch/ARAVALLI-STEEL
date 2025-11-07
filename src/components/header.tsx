'use client';
import type { FC } from 'react';

const Header: FC = () => {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
      <h1 className="text-3xl font-headline text-primary">Aravalli Furniture</h1>
    </header>
  );
};

export default Header;
