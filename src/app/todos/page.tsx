import TodoList from "@/components/todo/TodoList";

export default function TodosPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Todoリスト</h1>
      <TodoList />
    </div>
  );
} 