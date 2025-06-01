"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  order: number;
}

interface SortableTodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  deletingIds: Set<string>;
}

function SortableTodoItem({ todo, onToggle, onDelete, deletingIds }: SortableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <Checkbox
            checked={todo.completed}
            onCheckedChange={() => onToggle(todo.id)}
            className="h-5 w-5 cursor-pointer data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          />
          <div className="flex-1">
            <p className={`font-medium ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
              {todo.title}
            </p>
            {todo.description && (
              <p className={`text-sm text-muted-foreground ${todo.completed ? "line-through" : ""}`}>
                {todo.description}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(todo.id)}
          disabled={deletingIds.has(todo.id)}
          className="relative cursor-pointer hover:bg-destructive/90 active:scale-95 active:bg-destructive/80 transition-all"
        >
          <span className={deletingIds.has(todo.id) ? "invisible" : ""}>削除</span>
          {deletingIds.has(todo.id) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </Button>
      </div>
    </Card>
  );
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = todos.findIndex((item) => item.id === active.id);
      const newIndex = todos.findIndex((item) => item.id === over.id);
      const newTodos = arrayMove(todos, oldIndex, newIndex);
      setTodos(newTodos);

      try {
        const response = await fetch("/api/todos/reorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            todoId: active.id,
            newIndex,
          }),
        });

        if (!response.ok) throw new Error("Failed to update todo order");
      } catch {
        toast.error("順序の更新に失敗しました");
        // エラー時は元の順序に戻す
        setTodos(todos);
      }
    }
  };

  const fetchTodos = async () => {
    try {
      const response = await fetch("/api/todos");
      if (!response.ok) throw new Error("Failed to fetch todos");
      const data = await response.json();
      // orderでソート（降順）
      setTodos(data.sort((a: Todo, b: Todo) => b.order - a.order));
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
    if (deletingIds.has(id)) return;

    try {
      setDeletingIds(prev => new Set([...prev, id]));
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete todo");

      setTodos(todos.filter((todo) => todo.id !== id));
      toast.success("Todoを削除しました");
    } catch {
      toast.error("Todoの削除に失敗しました");
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
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
          <Button onClick={addTodo} disabled={isAdding} className="relative">
            <span className={isAdding ? "invisible" : ""}>追加</span>
            {isAdding && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </Button>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">未完了のタスク</h3>
            <div className="space-y-2">
              {incompleteTodos.length === 0 ? (
                <p className="text-muted-foreground text-sm">未完了のタスクはありません</p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={incompleteTodos.map((todo) => todo.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {incompleteTodos.map((todo) => (
                      <SortableTodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={toggleTodo}
                        onDelete={deleteTodo}
                        deletingIds={deletingIds}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">完了したタスク</h3>
            <div className="space-y-2">
              {completedTodos.length === 0 ? (
                <p className="text-muted-foreground text-sm">完了したタスクはありません</p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={completedTodos.map((todo) => todo.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {completedTodos.map((todo) => (
                      <SortableTodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={toggleTodo}
                        onDelete={deleteTodo}
                        deletingIds={deletingIds}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 