import { NextRequest, NextResponse } from "next/server";

type Todo = {
  id: number;
  name: string;
};

let todos: Todo[] = []; // Simple in-memory store, reset on reload!

// Utility to get next id
const getNextId = () => (todos.length ? Math.max(...todos.map(t => t.id)) + 1 : 1);

export async function GET(req: NextRequest) {
  return NextResponse.json(todos);
}

// Accepts { name: string }
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }
  const todo: Todo = { id: getNextId(), name: body.name };
  todos.push(todo);
  return NextResponse.json(todo, { status: 201 });
}

// Accepts { id: number } in body to delete
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  if (typeof body.id !== "number") {
    return NextResponse.json({ error: "Missing valid id" }, { status: 400 });
  }
  todos = todos.filter(t => t.id !== body.id);
  return NextResponse.json({ deleted: body.id });
}
