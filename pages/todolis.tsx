import React, { useEffect, useState } from "react";
import DexieActions, { Todo } from "../lib/dexiedb";
import ServerAction from "../lib/serverdb";

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Load todos
  useEffect(() => {
    DexieActions.ReadData().then(setTodos);
  }, []);

  // Add new todo with status "w" (waiting sync)
const addTodo = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!name.trim()) return;

  // First try saving to server
  let serverTodo: Todo | null = null;
  try {
    // try Server
    serverTodo = await ServerAction.SaveToServer({ name });
  } catch (err) {
    console.log("saving to server failed:", err);
    
    // ignore, will fallback to local
  }

  // What to insert in Dexie?
  const todo: Todo = serverTodo
    ? { ...serverTodo, status: "1" } // mark as synced if server worked
    : { name, status: "w" }; // fallback: status waiting

  await DexieActions.InsertBulk([todo]);
  setName("");
  setTodos(await DexieActions.ReadData());
};


  // Delete: if not synced, just delete; else mark as "0" for later remote removal
  const deleteTodo = async (id?: number) => {
    if (!id) return;
    const found = await DexieActions.ReadDataByID(id);
    if (found.length === 0) return;
    const status = found[0].status;
    if (status === "w") {
      await DexieActions.DeleteById(id);
    } else {
      await DexieActions.Update(id, { status: "0" }); // Mark for later deletion
    }
    setTodos(await DexieActions.ReadData());
  };

  // Manual sync with server
  const syncTodos = async () => {
    setLoading(true);
    try {
      const msg = await ServerAction.Sync();
      setTodos(await DexieActions.ReadData());
      alert(msg);
    } catch (err) {
      alert("Sync failed: " + err);
    } finally {
      setLoading(false);
    }
  };

  // Import todos from server
  const importTodos = async () => {
    setLoading(true);
    try {
      await ServerAction.ImportFromServer();
      setTodos(await DexieActions.ReadData());
      alert("Imported todos from server.");
    } catch (err) {
      alert("Import failed: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-4">To-Do App (Offline Sync)</h2>
      <form onSubmit={addTodo} className="flex gap-2 mb-4">
        <input
          type="text"
          value={name}
          placeholder="To-do name"
          onChange={e => setName(e.target.value)}
          className="border rounded px-2 py-1 flex-grow"
          disabled={loading}
        />
        <button className="bg-blue-500 text-white rounded px-4 py-1" type="submit" disabled={loading}>
          Add
        </button>
      </form>
      <div className="mb-4 flex gap-2">
        <button
          className="bg-green-500 text-white rounded px-4 py-1"
          onClick={syncTodos}
          disabled={loading}
        >
          Sync to Server
        </button>
        <button
          className="bg-purple-500 text-white rounded px-4 py-1"
          onClick={importTodos}
          disabled={loading}
        >
          Import from Server
        </button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} className="flex items-center justify-between py-1">
            <span>
              {todo.name}
              {todo.status === "w" && <span className="text-yellow-600 ml-2">(waiting)</span>}
              {todo.status === "0" && <span className="text-red-600 ml-2">(to delete)</span>}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500 hover:underline ml-4"
              disabled={loading}
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
