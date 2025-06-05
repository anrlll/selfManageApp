"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, GripVertical, Pencil, Check, X } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  order: number;
  type: string;
}

interface SortableTodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  deletingIds: Set<string>;
}

function SortableTodoItem({ todo, onToggle, onDelete, onEdit, deletingIds }: SortableTodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

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

  const handleEdit = () => {
    if (editTitle.trim() === "") {
      toast.error("タイトルを入力してください");
      return;
    }
    onEdit(todo.id, editTitle);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setIsEditing(false);
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-2 group">
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
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEdit();
                    if (e.key === "Escape") handleCancel();
                  }}
                  className="h-8"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="h-8 w-8 p-0"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className={`font-medium ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                  {todo.title}
                </p>
              </div>
            )}
            {todo.description && (
              <p className={`text-sm text-muted-foreground ${todo.completed ? "line-through" : ""}`}>
                {todo.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(todo.id)}
            disabled={deletingIds.has(todo.id)}
            className="relative hover:bg-destructive/90 active:scale-95 active:bg-destructive/80 transition-all"
          >
            <span className={deletingIds.has(todo.id) ? "invisible" : ""}>削除</span>
            {deletingIds.has(todo.id) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface TodoListProps {
  title: string;
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onAdd: (title: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
  deletingIds: Set<string>;
  isAdding: boolean;
}

function TodoListSection({ title, todos, onToggle, onDelete, onEdit, onAdd, onDragEnd, deletingIds, isAdding }: TodoListProps) {
  const [newTodo, setNewTodo] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const incompleteTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  const handleAddTodo = () => {
    if (!newTodo.trim() || isAdding) return;
    onAdd(newTodo);
    setNewTodo("");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="新しいタスクを入力"
            onKeyPress={(e) => e.key === "Enter" && !isAdding && handleAddTodo()}
            disabled={isAdding}
          />
          <Button onClick={handleAddTodo} disabled={isAdding} className="relative">
            <span className={isAdding ? "invisible" : ""}>追加</span>
            {isAdding && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </Button>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">未完了のタスク</h3>
          <div className="space-y-2">
            {incompleteTodos.length === 0 ? (
              <p className="text-muted-foreground text-sm">未完了のタスクはありません</p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={incompleteTodos.map((todo) => todo.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {incompleteTodos.map((todo) => (
                    <SortableTodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      deletingIds={deletingIds}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">完了したタスク</h3>
          <div className="space-y-2">
            {completedTodos.length === 0 ? (
              <p className="text-muted-foreground text-sm">完了したタスクはありません</p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={completedTodos.map((todo) => todo.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {completedTodos.map((todo) => (
                    <SortableTodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      deletingIds={deletingIds}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("daily");

  const fetchTodos = useCallback(async () => {
    try {
      const response = await fetch(`/api/todos?type=${activeTab}`);
      if (!response.ok) throw new Error("Failed to fetch todos");
      const data = await response.json();
      setTodos(data.sort((a: Todo, b: Todo) => b.order - a.order));
    } catch {
      toast.error("Todoの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

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
        setTodos(todos);
      }
    }
  };

  const addTodo = async (title: string) => {
    if (!title.trim() || isAdding) return;

    try {
      setIsAdding(true);
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          type: activeTab,
        }),
      });

      if (!response.ok) throw new Error("Failed to add todo");

      const newTodoItem = await response.json();
      setTodos([newTodoItem, ...todos]);
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

  const editTodo = async (id: string, title: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
        }),
      });

      if (!response.ok) throw new Error("Failed to update todo");

      const updatedTodo = await response.json();
      setTodos(
        todos.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
      toast.success("タスクを更新しました");
    } catch {
      toast.error("タスクの更新に失敗しました");
    }
  };

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
    <div className="w-full max-w-6xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">デイタスク</TabsTrigger>
          <TabsTrigger value="implementation">実装タスク</TabsTrigger>
          <TabsTrigger value="long-term">長期タスク</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <TodoListSection
            title="デイタスクリスト"
            todos={todos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onEdit={editTodo}
            onAdd={addTodo}
            onDragEnd={handleDragEnd}
            deletingIds={deletingIds}
            isAdding={isAdding}
          />
        </TabsContent>
        <TabsContent value="implementation">
          <TodoListSection
            title="実装タスクリスト"
            todos={todos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onEdit={editTodo}
            onAdd={addTodo}
            onDragEnd={handleDragEnd}
            deletingIds={deletingIds}
            isAdding={isAdding}
          />
        </TabsContent>
        <TabsContent value="long-term">
          <TodoListSection
            title="長期タスクリスト"
            todos={todos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onEdit={editTodo}
            onAdd={addTodo}
            onDragEnd={handleDragEnd}
            deletingIds={deletingIds}
            isAdding={isAdding}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 