import React from "react";

const Header = ({ children }) => {
  return (
    <header className="bg-card border-b border-border p-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
      {children}
    </header>
  );
};

export default Header;