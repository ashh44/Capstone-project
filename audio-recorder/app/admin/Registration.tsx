"use client";

import React, { useState } from 'react';

const RegisterForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://54.208.12.34/api';
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://54.208.12.34';

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            console.log('Attempting registration with URL:', `${apiBaseUrl}/users`);

            const response = await fetch(`${apiBaseUrl}/users`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': frontendUrl
                },
                body: JSON.stringify({
                    username,
                    password,
                    authorities: ['ROLE_USER']
                }),
            });

            console.log('Registration response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Registration successful:', data);

                setMessage('Registration successful! Redirecting to login...');
                setMessageType('success');
                setUsername('');
                setPassword('');

                // Redirect to login page after successful registration
                setTimeout(() => {
                    window.location.href = `${frontendUrl}/login`;
                }, 2000);
            } else {
                const errorData = await response.json().catch(() => null);
                console.error('Registration failed:', errorData);

                setMessage(errorData?.message || 'Registration failed. Please try again.');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setMessage('An error occurred during registration. Please try again.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
                    Create Account
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                            minLength={3}
                            maxLength={20}
                            pattern="[a-zA-Z0-9]+"
                            title="Username must be between 3 and 20 characters and can only contain letters and numbers"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                            minLength={6}
                            title="Password must be at least 6 characters long"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoading ? 'Registering...' : 'Register'}
                        </button>
                    </div>

                    {message && (
                        <div className={`mt-4 p-3 rounded-md ${
                            messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                        }`}>
                            {message}
                        </div>
                    )}

                    <div className="text-sm text-center mt-4">
                        <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Already have an account? Login
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;