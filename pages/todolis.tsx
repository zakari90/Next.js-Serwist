import React, { useEffect, useState } from "react";
import DexieActions, { Todo } from "../lib/dexiedb";

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [name, setName] = useState("");

  // Load todos from DB on mount
  useEffect(() => {
    DexieActions.ReadData().then(setTodos);
  }, []);

  // Add new todo
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === "") return;
    await DexieActions.InsertBulk([{ name }]);
    setName("");
    setTodos(await DexieActions.ReadData());
  };

  // Delete todo
  const deleteTodo = async (id?: number) => {
    if (!id) return;
    await DexieActions.DeleteById(id);
    setTodos(await DexieActions.ReadData());
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-4">To-Do App (Dexie.js)</h2>
      <form onSubmit={addTodo} className="flex gap-2 mb-4">
        <input
          type="text"
          value={name}
          placeholder="To-do name"
          onChange={e => setName(e.target.value)}
          className="border rounded px-2 py-1 flex-grow"
        />
        <button className="bg-blue-500 text-white rounded px-4 py-1" type="submit">
          Add
        </button>
      </form>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} className="flex items-center justify-between py-1">
            <span>{todo.name}</span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500 hover:underline ml-4"
            >
              Delete
            </button>
          </li>
        ))}
        {todos.length === 0 && <li className="text-gray-400">No todos yet.</li>}
      </ul>
    </div>
  );
}

export default TodoApp;
