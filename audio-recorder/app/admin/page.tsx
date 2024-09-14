// app/admin/page.tsx
"use client";
import React from 'react';
import RegisterForm from './registration';

const AdminPage: React.FC = () => {
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
