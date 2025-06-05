import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const todos = await prisma.todo.findMany({
      where: {
        userId,
        ...(type && { type }),
      },
      orderBy: {
        order: "desc",
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
    const { title, description, type = "daily" } = body;

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
        type,
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
        type,
        order: (maxOrderTodo?.order ?? 0) + 1,
      },
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error("[TODOS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}