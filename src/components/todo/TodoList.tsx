"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch("/api/todos");
      if (!response.ok) throw new Error("Failed to fetch todos");
      const data = await response.json();
      setTodos(data);
    } catch {
      toast.error("Todoの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim() || isAdding) return;

    try {
      setIsAdding(true);
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTodo,
        }),
      });

      if (!response.ok) throw new Error("Failed to add todo");

      const newTodoItem = await response.json();
      setTodos([newTodoItem, ...todos]);
      setNewTodo("");
      toast.success("新しいTodoを追加しました");
    } catch {
      toast.error("Todoの追加に失敗しました");
    } finally {
      setIsAdding(false);
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !todos.find((todo) => todo.id === id)?.completed,
        }),
      });

      if (!response.ok) throw new Error("Failed to update todo");

      const updatedTodo = await response.json();
      setTodos(
        todos.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
    } catch {
      toast.error("Todoの更新に失敗しました");
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete todo");

      setTodos(todos.filter((todo) => todo.id !== id));
      toast.success("Todoを削除しました");
    } catch {
      toast.error("Todoの削除に失敗しました");
    }
  };

  const incompleteTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Todoリスト</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">読み込み中...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Todoリスト</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="新しいタスクを入力"
            onKeyPress={(e) => e.key === "Enter" && !isAdding && addTodo()}
            disabled={isAdding}
          />
          <Button onClick={addTodo} disabled={isAdding}>
            {isAdding ? "追加中..." : "追加"}
          </Button>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">未完了のタスク</h3>
            <div className="space-y-2">
              {incompleteTodos.length === 0 ? (
                <p className="text-muted-foreground text-sm">未完了のタスクはありません</p>
              ) : (
                incompleteTodos.map((todo) => (
                  <Card key={todo.id} className="p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => toggleTodo(todo.id)}
                          className="h-5 w-5 cursor-pointer data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{todo.title}</p>
                          {todo.description && (
                            <p className="text-sm text-muted-foreground">
                              {todo.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteTodo(todo.id)}
                        className="cursor-pointer hover:bg-destructive/90 active:scale-95 active:bg-destructive/80 transition-all"
                      >
                        削除
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">完了したタスク</h3>
            <div className="space-y-2">
              {completedTodos.length === 0 ? (
                <p className="text-muted-foreground text-sm">完了したタスクはありません</p>
              ) : (
                completedTodos.map((todo) => (
                  <Card key={todo.id} className="p-2 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => toggleTodo(todo.id)}
                          className="h-5 w-5 cursor-pointer data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        />
                        <div className="flex-1">
                          <p className="font-medium line-through text-muted-foreground">
                            {todo.title}
                          </p>
                          {todo.description && (
                            <p className="text-sm text-muted-foreground line-through">
                              {todo.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteTodo(todo.id)}
                        className="cursor-pointer hover:bg-destructive/90 active:scale-95 active:bg-destructive/80 transition-all"
                      >
                        削除
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 