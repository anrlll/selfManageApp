'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface Schedule {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

export default function SchedulePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  // スケジュール一覧を取得
  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedules');
      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  // 初回レンダリング時にスケジュールを取得
  useEffect(() => {
    fetchSchedules();
  }, []);

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
      
      // スケジュール一覧を更新
      await fetchSchedules();
      
      // 成功メッセージを表示
      alert('スケジュールを登録しました');
    } catch (error) {
      console.error('Error:', error);
      alert('スケジュールの登録に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 時刻をフォーマットする関数
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>スケジュール一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <p className="text-center text-gray-500">スケジュールがありません</p>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <h3 className="font-medium">{schedule.title}</h3>
                  <p className="text-sm text-gray-500">
                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 