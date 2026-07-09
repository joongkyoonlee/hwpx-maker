'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Newspaper, Sparkles, Loader2, Download } from 'lucide-react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [resultStatus, setResultStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [docType, setDocType] = useState('report');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setResultStatus('loading');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      docType: docType,
      title: formData.get('title'),
      brief: formData.get('brief'),
      org: formData.get('org'),
      contact: formData.get('contact'),
    };

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || '생성 중 오류가 발생했습니다.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setResultStatus('success');
    } catch (error: any) {
      console.error(error);
      alert(error.message);
      setResultStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm shadow-sm">
              한글
            </div>
            <div className="leading-tight">
              <div className="text-lg font-bold">나만의 HWPX 메이커</div>
              <div className="text-xs text-slate-500">AI 행정문서·보도자료 · HWPX 자동 생성</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
        <section className="mb-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            AI 시대 행정문서 작성 가이드라인 준수
          </div>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl tracking-tight">
            주제만 알려주세요.<br />
            <span className="text-blue-600">한글 문서</span>는 저희가 씁니다.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
            보고서·계획안·보도자료를 서술식 규칙에 맞춰 자동으로 작성하고,
            한글(HWP)에서 바로 열리는 <span className="font-semibold text-slate-900">HWPX 파일</span>로 즉시 내려받을 수 있습니다.
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left Form */}
          <form className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm" onSubmit={handleSubmit}>
            <div className="mb-8">
              <Tabs defaultValue="report" className="w-full" onValueChange={(value) => setDocType(value)}>
                <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 p-1 rounded-xl">
                  <TabsTrigger value="report" className="rounded-lg py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <FileText className="h-4 w-4 mr-2" />
                    행정 보고서 · 계획안
                  </TabsTrigger>
                  <TabsTrigger value="press" className="rounded-lg py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Newspaper className="h-4 w-4 mr-2" />
                    보도자료
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="report" className="text-sm text-slate-500 px-1">
                  계획(안)·보고서·공문 등 내부 보고 문서. 요약 → 배경 → 주요 내용 → 향후 계획 구조로 작성됩니다.
                </TabsContent>
                <TabsContent value="press" className="text-sm text-slate-500 px-1">
                  외부 언론 배포용 보도자료. 제목 → 리드문 → 본문 → 붙임 구조로 작성됩니다.
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-sm font-semibold text-slate-700">
                  문서 제목 / 주제 <span className="text-blue-600">*</span>
                </Label>
                <Input 
                  id="title" 
                  name="title"
                  placeholder="예) AI 친화적 행정문서 작성 시범실시 계획(안)" 
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/50 px-4 transition-colors focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="brief" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  핵심 내용 <span className="text-blue-600">*</span>
                  <span className="text-xs font-normal text-slate-400">(누가/언제/무엇을/왜·배경 등을 자유롭게)</span>
                </Label>
                <Textarea 
                  id="brief" 
                  name="brief"
                  rows={8} 
                  placeholder="예) 공무원 불필요 문서작업을 줄이기 위해 행정안전부가 가이드라인 적용. 2026년 대면 교육 실시. 담당: 혁신행정담당관실."
                  className="min-h-[160px] rounded-xl border-slate-200 bg-slate-50/50 px-4 py-3 transition-colors focus:bg-white resize-y leading-relaxed"
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="org" className="text-sm font-semibold text-slate-700">발행 기관 (선택)</Label>
                  <Input 
                    id="org" 
                    name="org"
                    placeholder="예) 행정안전부 혁신행정담당관실" 
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 px-4 transition-colors focus:bg-white"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="contact" className="text-sm font-semibold text-slate-700">담당자 (선택)</Label>
                  <Input 
                    id="contact" 
                    name="contact"
                    placeholder="예) 홍길동 사무관 044-000-0000" 
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 px-4 transition-colors focus:bg-white"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow-md hover:shadow-lg transition-all mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    HWPX 문서 생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    HWPX 문서 생성
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Right Result Panel */}
          <aside className="lg:col-span-2">
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-400" />
                생성 결과
              </h2>

              {resultStatus === 'idle' && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  왼쪽에서 주제와 핵심 내용을 입력한 뒤<br />
                  <span className="font-semibold text-slate-700 mt-2 inline-block">‘HWPX 문서 생성’</span>을 눌러 주세요.
                </div>
              )}

              {resultStatus === 'loading' && (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-8 text-center flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <div className="text-sm font-medium text-slate-600">
                    AI가 문서를 작성하고 있습니다...<br/>
                    <span className="text-xs text-slate-400 font-normal">약 10~20초 소요됩니다.</span>
                  </div>
                </div>
              )}

              {resultStatus === 'success' && (
                <div className="rounded-xl border border-green-100 bg-green-50/50 p-6 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-300">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-slate-800 text-lg mb-1">생성 완료!</h3>
                    <p className="text-sm text-slate-500">작성된 HWPX 파일을 다운로드하세요.</p>
                  </div>
                  <Button className="w-full mt-4 h-12 rounded-xl bg-slate-900 hover:bg-slate-800" asChild>
                    <a href={downloadUrl || '#'} download="생성된_문서.hwpx">
                      <Download className="mr-2 h-4 w-4" />
                      HWPX 다운로드
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Feature Highlights */}
        <section className="mt-16 grid gap-6 sm:grid-cols-3">
          <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardContent className="p-6">
              <div className="mb-3 font-bold text-slate-900 text-base">서술식 자동 변환</div>
              <div className="text-sm leading-relaxed text-slate-500">
                개조식 대신 주어·서술어를 갖춘 음슴체(~함/~임) 문장으로 자동 정리합니다.
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardContent className="p-6">
              <div className="mb-3 font-bold text-slate-900 text-base">유니코드 기호 규칙</div>
              <div className="text-sm leading-relaxed text-slate-500">
                □ → ○ → - → · 위계와 실제 유니코드 문자를 사용해 AI가 인식 가능한 문서를 만듭니다.
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardContent className="p-6">
              <div className="mb-3 font-bold text-slate-900 text-base">한글에서 바로 열림</div>
              <div className="text-sm leading-relaxed text-slate-500">
                함초롬바탕 서식이 반영된 HWPX 템플릿으로 패키징되어 한글(HWP)에서 즉시 열립니다.
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
