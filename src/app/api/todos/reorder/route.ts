import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { todoId, newIndex } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!todoId || typeof newIndex !== "number") {
      return new NextResponse("Invalid request", { status: 400 });
    }

    // ユーザーの全TODOを取得
    const todos = await prisma.todo.findMany({
      where: {
        userId,
      },
      orderBy: {
        order: "desc",
      },
    });

    // 移動するTODOを取得
    const todoToMove = todos.find(todo => todo.id === todoId);
    if (!todoToMove) {
      return new NextResponse("Todo not found", { status: 404 });
    }

    // 移動するTODOを配列から削除
    const todosWithoutMoved = todos.filter(todo => todo.id !== todoId);

    // 新しい位置にTODOを挿入
    todosWithoutMoved.splice(newIndex, 0, todoToMove);

    // 全TODOのorderを更新
    for (let i = 0; i < todosWithoutMoved.length; i++) {
      await prisma.todo.update({
        where: {
          id: todosWithoutMoved[i].id,
        },
        data: {
          order: todosWithoutMoved.length - i,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TODOS_REORDER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 