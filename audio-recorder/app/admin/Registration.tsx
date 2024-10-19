import React, { useState } from 'react';

const RegisterForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');  // State to store success/error message
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
            const response = await fetch(`${backendUrl}/api/users`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, authorities: ['ROLE_USER'] }),
            });

            if (response.ok) {
                setMessage('User added successfully!');
                setMessageType('success');
                setUsername(''); // Clear input fields
                setPassword('');
            } else {
                setMessage('User registration failed.');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('User registration failed.');
            setMessageType('error');
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
            <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="username" className="block text-gray-700">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="password" className="block text-gray-700">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                >
                    Register
                </button>
            </form>

            {/* Show success or error message */}
            {message && (
                <p className={`mt-4 text-center ${messageType === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default RegisterForm;