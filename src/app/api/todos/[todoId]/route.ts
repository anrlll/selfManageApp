import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ todoId: string }> }
) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { completed } = body;
    const { todoId } = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const todo = await prisma.todo.update({
      where: {
        id: todoId,
        userId,
      },
      data: {
        completed,
      },
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error("[TODOS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ todoId: string }> }
) {
  try {
    const { userId } = await auth();
    const { todoId } = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.todo.delete({
      where: {
        id: todoId,
        userId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TODOS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}