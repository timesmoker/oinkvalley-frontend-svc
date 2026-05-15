'use client';

import React, { useState } from 'react';
import { useLogin } from '@/features/auth/hooks/useLogin';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { handleLogin, error } = useLogin();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleLogin(email, password);
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow bg-white">
            <h2 className="text-2xl font-bold mb-2 text-center">로그인</h2>
            <p className="mb-6 text-center text-sm text-gray-600">가입할 때 등록한 이메일로 로그인합니다.</p>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">이메일</label>
                    <input
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">비밀번호</label>
                    <input
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    로그인
                </button>
            </form>
        </div>
    );
}
