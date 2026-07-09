import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { htmlToHwpx } from 'hwp-convert';

// Initialize OpenAI client
// Note: Requires OPENAI_API_KEY in environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { docType, title, brief, org, contact } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다. .env.local 파일에 OPENAI_API_KEY를 추가해주세요.' },
        { status: 500 }
      );
    }

    // 1. Construct prompt based on document type
    const systemPrompt = `당신은 대한민국 최고 수준의 행정문서(공문, 보고서, 보도자료) 작성 전문가입니다.
사용자가 입력한 "주제"와 "핵심 내용"을 바탕으로 완벽한 행정문서 초안을 HTML 형식으로 작성해주세요.

[작성 규칙 (AI 시대 행정문서 작성 가이드라인 준수)]
1. 문체: 개조식(단어 나열)을 지양하고, 명확한 주어와 서술어를 갖춘 서술식(음슴체: ~함, ~임, ~할 계획임 등)으로 작성하세요.
2. 기호 체계: 
   - 1단계: □ (주요 항목)
   - 2단계: ○ (세부 항목)
   - 3단계: - (추가 설명)
   - 4단계: · (가장 작은 단위)
3. 구조화: 문서 종류(${docType === 'report' ? '행정 보고서' : '보도자료'})에 맞는 표준 구조를 따르세요.
   - 보고서: [추진 배경] -> [주요 내용] -> [기대 효과] -> [향후 계획]
   - 보도자료: [리드문(요약)] -> [본문] -> [향후 계획]
4. 출력 형식: 순수 HTML 코드로만 출력하세요 (<html>, <body> 태그 없이 내부 콘텐츠만).
   - 제목은 <h1> 태그 사용
   - 1단계 항목(□)은 <h2> 태그 사용
   - 2단계 항목(○)은 <h3> 태그 사용
   - 강조할 부분은 <strong> 태그 사용
   - 단락은 <p> 태그 사용
   - 목록은 <ul>, <li> 태그 사용
   - markdown 문법이나 \`\`\`html 블록으로 감싸지 마세요.`;

    const userMessage = `
[문서 종류] ${docType === 'report' ? '행정 보고서/계획안' : '보도자료'}
[제목] ${title}
[발행 기관] ${org || '(생략)'}
[담당자] ${contact || '(생략)'}
[핵심 내용]
${brief}

위 내용을 바탕으로 HWPX 변환용 HTML 코드를 작성해주세요.`;

    // 2. Call OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      model: 'gpt-4o-mini',
      temperature: 0.5,
    });

    let htmlContent = completion.choices[0].message.content || '';
    
    // Clean up if the model wrapped it in markdown code blocks
    htmlContent = htmlContent.replace(/^```html/i, '').replace(/```$/i, '').trim();

    // Add Title explicitly to HTML to ensure it's rendered properly at the top
    const finalHtml = `<h1>${title}</h1>\n${htmlContent}\n<br/><br/><p>발행 기관: ${org || ''}</p><p>담당자: ${contact || ''}</p>`;

    // 3. Convert HTML to HWPX bytes using hwp-convert
    const hwpxBytes = await htmlToHwpx(finalHtml);

    // 4. Return as downloadable file
    return new NextResponse(hwpxBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.hancom.hwpx',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(title.replace(/[^a-zA-Z0-9가-힣_-]/g, '_'))}.hwpx"`,
      },
    });

  } catch (error: any) {
    console.error('HWPX Generation Error:', error);
    return NextResponse.json(
      { error: 'HWPX 생성 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}
