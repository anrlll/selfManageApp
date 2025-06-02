'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function SchedulePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          startTime,
          endTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create schedule');
      }

      // フォームをリセット
      setTitle('');
      setStartTime('');
      setEndTime('');
      
      // 成功メッセージを表示（TODO: トースト通知の実装）
      alert('スケジュールを登録しました');
      
      // ページをリロード
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      alert('スケジュールの登録に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>スケジュール登録</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                予定タイトル
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="予定を入力してください"
                required
              />
            </div>
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium mb-1">
                開始時刻
              </label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                step="300"
                required
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium mb-1">
                終了時刻
              </label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                step="300"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? '登録中...' : '登録'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 