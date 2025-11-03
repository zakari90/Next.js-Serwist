// dexiedb.ts (TypeScript example)
import Dexie, { Table } from "dexie";

export interface Todo {
  id?: number;
  name: string;
  status?: string; // "1" (synced), "w" (waiting to sync), "0" (pending delete)
}

class TodoDB extends Dexie {
  todos!: Table<Todo, number>;

  constructor() {
    super("TodoDB");
    this.version(1).stores({
      todos: "++id,name,status"
    });
  }
}

export const dexieDb = new TodoDB();

const DexieActions = {
  async InsertBulk(data: Todo[]) {
    await dexieDb.todos.bulkPut(data);
  },
  async ReadData() {
    return dexieDb.todos.orderBy("id").and((item) => item.status !== "0").toArray();
  },
  async ReadDataByID(id: number) {
    return dexieDb.todos.where("id").equals(id).toArray();
  },
  async ReadDataByStatus(statuses: string[]) {
    return dexieDb.todos.where("status").anyOf(statuses).toArray();
  },
  async DeleteById(id: number) {
    await dexieDb.todos.delete(id);
  },
  async DeleteByStatus(status: string) {
    await dexieDb.todos.where("status").equals(status).delete();
  },
  async Update(id: number, data: Partial<Todo>) {
    await dexieDb.todos.update(id, data);
  }
};

export default DexieActions;
