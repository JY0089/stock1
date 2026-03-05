import { GoogleGenerativeAI } from '@google/generative-ai';
import { StockEntry } from '../types';

export async function analyzePortfolio(
    apiKey: string,
    portfolio: StockEntry[],
    question: string
): Promise<string> {
    if (!apiKey) {
        throw new Error('Google AI API Key가 필요합니다.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Using recommended flash model as per plan
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const portfolioContext = JSON.stringify(portfolio, null, 2);

    const systemPrompt = `
당신은 전문 투자 분석가입니다. 사용자의 다음 주식 포트폴리오 데이터를 바탕으로 분석, 섹터 분산도 평가, 투자 전략에 대해 조언해주세요.
질문에 한국어로 친절하고 명확하게 답변하세요.

[현재 포트폴리오 데이터]
${portfolioContext}
`;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n사용자 질문: ${question}` }] }],
        });
        return result.response.text();
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error('AI 분석 중 오류가 발생했습니다. API Key를 확인해주세요.');
    }
}
