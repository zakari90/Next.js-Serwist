import { useEffect, useState } from "react";
import { dexieDb } from "../lib/dexiedb";

type Todo = {
  id?: number;
  name: string;
};

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [name, setName] = useState("");

  // Load todos from DB on mount
  useEffect(() => {
    dexieDb.table("dexieDb")
      .toArray()
      .then(setTodos);
  }, []);

  // Add new todo
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === "") return;
    await dexieDb.table("dexieDb").add({ name });
    setName("");
    setTodos(await dexieDb.table("dexieDb").toArray());
  };

  return (
    <div>
      <h2>To-Do App</h2>
      <form onSubmit={addTodo}>
        <input
          type="text"
          className="border-amber-300"
          value={name}
          placeholder="To-do name"
          onChange={(e) => setName(e.target.value)}
        />
        <button className="bg-amber-400" type="submit">Add</button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default TodoApp;
