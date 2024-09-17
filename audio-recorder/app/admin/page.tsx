// app/admin/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import RegisterForm from './registration';


const AdminPage: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    //commented by sahithi -  as we dont need another authentication check as admin landed on registration with prior check implemented in backend
    /*useEffect(() => {
        checkAuth(); // Call authentication check
     }, []);

    const checkAuth = async () => {
        try {
          const response = await fetch('http://localhost:8080/login', {
            method: 'GET',
            credentials: 'include', // This is important for including cookies
          });
          if (response.ok) {
            const data = await response.json();
            if (data.authenticated) {
              setIsAuthenticated(true);
            } else {
              window.location.href = '/login';
            }
          } else {
            window.location.href = '/login';
          }
        } catch (error) {
          console.error('Error checking authentication:', error);
          window.location.href = '/login';
        }
      };
*/
    return (
        <div className="min-h-screen bg-blue-900 flex flex-col">
            <header className="w-full flex justify-between items-center px-6 py-4">
                <img src="/facere-logo.svg" alt="Facere Logo" className="h-10" />
                <nav className="space-x-6">
                    <a href="#" className="text-white hover:underline">Home</a>
                    <a href="#" className="text-white hover:underline">Solution</a>
                    <a href="#" className="text-white hover:underline">News</a>
                    <a href="#" className="text-white hover:underline">FAQ</a>
                    <a href="#" className="text-white hover:underline">About Us</a>
                </nav>
            </header>

            {/* Render the RegisterForm directly */}
            <main className="flex-grow flex items-center justify-center">
                <div className="w-full max-w-sm">
                    <RegisterForm />
                </div>
            </main>
        </div>
    );
};

export default AdminPage;
