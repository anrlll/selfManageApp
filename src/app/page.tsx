import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">SelfManage</h1>
      <p className="text-lg text-muted-foreground mb-8">
        タスク管理、スケジュール管理、家計簿を一つのアプリで管理しましょう。
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Todoリスト</CardTitle>
            <CardDescription>
              タスクを管理して、効率的に作業を進めましょう。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/todos">
              <Button>Todoリストを開く</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>スケジュール</CardTitle>
            <CardDescription>
              予定を管理して、時間を有効に使いましょう。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/schedule">
              <Button>スケジュールを開く</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>家計簿</CardTitle>
            <CardDescription>
              収支を管理して、家計を把握しましょう。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/finance">
              <Button>家計簿を開く</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
