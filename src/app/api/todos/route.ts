import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const todos = await prisma.todo.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(todos);
  } catch (error) {
    console.error("[TODOS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { title, description } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    // 最大のorder値を取得
    const maxOrderTodo = await prisma.todo.findFirst({
      where: {
        userId,
      },
      orderBy: {
        order: 'desc',
      },
    });

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        userId,
        order: (maxOrderTodo?.order ?? -1) + 1,
      },
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error("[TODOS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}