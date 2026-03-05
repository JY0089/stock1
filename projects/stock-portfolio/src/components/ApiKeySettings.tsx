'use client';

import { useState, useEffect } from 'react';
import { KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

interface ApiKeySettingsProps {
    onKeyChange: (key: string) => void;
    currentKey: string;
}

export function ApiKeySettings({ onKeyChange, currentKey }: ApiKeySettingsProps) {
    const [inputKey, setInputKey] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        // Session memory only: API key is kept in parent state but we can initialize local if needed.
        if (currentKey) {
            setInputKey(currentKey);
            setIsSaved(true);
        }
    }, [currentKey]);

    const handleSave = () => {
        if (inputKey.trim()) {
            onKeyChange(inputKey.trim());
            setIsSaved(true);
        } else {
            onKeyChange('');
            setIsSaved(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-100">
                <KeyRound className="w-5 h-5" />
                Gemini API 설정
            </h3>
            <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    AI 포트폴리오 상담을 위해 Google Gemini API Key가 필요합니다. 입력된 키는
                    <strong> 현재 브라우저 세션</strong>에서만 유지되며 외부로 전송되거나 저장되지 않습니다.
                </p>

                <div className="flex gap-2">
                    <input
                        type="password"
                        value={inputKey}
                        onChange={(e) => {
                            setInputKey(e.target.value);
                            setIsSaved(false);
                        }}
                        placeholder="AIzaSy..."
                        className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                        {isSaved ? '업데이트' : '설정'}
                    </button>
                </div>

                {isSaved && inputKey && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>API Key가 설정되었습니다. 이제 AI 상담을 이용할 수 있습니다.</span>
                    </div>
                )}

                {!isSaved && currentKey && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 mt-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>저장되지 않은 변경사항이 있습니다.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
