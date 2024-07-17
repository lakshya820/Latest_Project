// MainLayout.tsx
import React from 'react';
import NavBar from './NavBar';
import Header from './Header';
import '../css/MainLayout.css';

interface MainLayoutProps{
    //onNext: () => void; // Function to call when "Next" button is clicked
    children: React.ReactNode; // To render other components inside MainLayout
}
  
const MainLayout: React.FC<MainLayoutProps> = ({children}) => {
  
   /* const handleNextClick = () => {
        onNext(); // Call the onNext function when "Next" button is clicked
      };
    */

  return (
    <div className="layout">
      <Header />
      <NavBar />
        <div className="content">
        {children}
        </div>
      </div>
  );
};

export default MainLayout;
