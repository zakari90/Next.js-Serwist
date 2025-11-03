// app/api/todos/route.ts (Next.js App Router API)

import { NextRequest, NextResponse } from "next/server";

// Todo type
type Todo = {
  id: number;
  name: string;
};

// In-memory store (resets on reload/redeploy/serverless invocation)
let todos: Todo[] = [];

// Utility to get the next available ID
const getNextId = () => (todos.length ? Math.max(...todos.map(t => t.id)) + 1 : 1);

// GET all todos
export async function GET(_: NextRequest) {
  // '_' means request isn't used (no ESLint unused-vars warning)
  return NextResponse.json(todos);
}

// POST to add a new todo { name: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }
    const todo: Todo = { id: getNextId(), name: body.name };
    todos.push(todo);
    return NextResponse.json(todo, { status: 201 });
  } catch (e) {
    // Log or handle error
    console.error("POST error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE by ID in body { id: number }
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    if (typeof body.id !== "number") {
      return NextResponse.json({ error: "Missing valid id" }, { status: 400 });
    }
    todos = todos.filter(t => t.id !== body.id);
    return NextResponse.json({ deleted: body.id });
  } catch (e) {
    // Log or handle error
    console.error("DELETE error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
