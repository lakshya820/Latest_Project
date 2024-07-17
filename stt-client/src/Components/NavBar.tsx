// NavBar.tsx
import React from 'react';
import '../css/NavBar.css';

const NavBar: React.FC = () => {
  return (
    <div className="navbar">
      <button className="nav-button">Dashboard</button>
      <button className="nav-button">Tests</button>
      <button className="nav-button">Settings</button>
    </div>
  );
};

export default NavBar;
