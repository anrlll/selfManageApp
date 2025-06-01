import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { todoId, newOrder, oldIndex, newIndex } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!todoId || typeof newOrder !== "number" || typeof oldIndex !== "number" || typeof newIndex !== "number") {
      return new NextResponse("Invalid request", { status: 400 });
    }

    // 移動するTODOの順序を更新
    await prisma.todo.update({
      where: {
        id: todoId,
        userId,
      },
      data: {
        order: newOrder,
      },
    });

    // 他のTODOの順序も更新
    if (oldIndex < newIndex) {
      // 下に移動する場合
      await prisma.todo.updateMany({
        where: {
          userId,
          order: {
            gt: oldIndex,
            lte: newIndex,
          },
          id: {
            not: todoId,
          },
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      });
    } else {
      // 上に移動する場合
      await prisma.todo.updateMany({
        where: {
          userId,
          order: {
            gte: newIndex,
            lt: oldIndex,
          },
          id: {
            not: todoId,
          },
        },
        data: {
          order: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TODOS_REORDER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 