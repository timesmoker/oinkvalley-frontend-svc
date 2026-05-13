//src/app/(default)/signup/page.tsx
'use client'

import { useState } from 'react'
import axios from "axios";
import { getSignupEnabled } from '@/lib/api/runtimeConfig'
import { signupApi } from '@/features/auth/api/signupApi'


export default function SignUpForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [nickname, setNickname] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        const signupEnabled = await getSignupEnabled().catch(() => false)
        if (!signupEnabled) {
            setError('현재는 회원가입을 받고 있지 않습니다.')
            return
        }
        try {
            await signupApi({ email, password, nickname })

            setSuccess('회원가입이 완료되었습니다. 로그인 페이지에서 이메일로 로그인하세요.')
            setEmail('')
            setPassword('')
            setNickname('')
        } catch (err) {
            console.error('에러:', err)

            if (axios.isAxiosError(err)) {
                const status = err.response?.status
                if (status === 409) {
                    setError('이미 사용 중인 닉네임 또는 이메일입니다.')
                } else {
                    const data = err.response?.data as { message?: string; error?: string } | undefined
                    setError(data?.message || data?.error || '회원가입에 실패했습니다.')
                }
            } else {
                setError('알 수 없는 오류가 발생했습니다.')
            }
        }
    }


    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow bg-white">
            <h2 className="text-2xl font-bold mb-6 text-center">회원가입</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">이메일 (로그인 ID)</label>
                    <input
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded"
                    />
                    <p className="mt-1 text-xs text-gray-500">로그인할 때 사용하는 이메일 주소입니다.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium">비밀번호</label>
                    <input
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">닉네임</label>
                    <input
                        type="text"
                        autoComplete="nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded"
                    />
                    <p className="mt-1 text-xs text-gray-500">게시판·댓글에 표시되는 이름입니다. 로그인 ID가 아닙니다.</p>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-600 text-sm">{success}</p>}

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    가입하기
                </button>
            </form>
        </div>
    )
}
