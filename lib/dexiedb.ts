import Dexie, { Table } from "dexie";

export type Todo = {
  id?: number;
  name: string;
};

export interface DexieTodosDB extends Dexie {
  todos: Table<Todo, number>;
}

const INDEXEDDB_NAME = "TodoDB";

const TABLES = {
  todos: {
    tableName: "todos",
    columns: { id: "id", name: "name" }
  }
};

type TodoInsert = Omit<Todo, 'id'> | Todo; // Allows optional id for insertBulk

const DexieActions = {
  OpenDb: function (): DexieTodosDB {
    const db = new Dexie(INDEXEDDB_NAME) as DexieTodosDB;
    db.version(1).stores({ todos: "++id,name" });
    return db;
  },

  InsertBulk: async function (data: TodoInsert[]): Promise<void> {
    let db: DexieTodosDB | undefined;
    try {
      db = DexieActions.OpenDb();
      await db.todos.bulkPut(data);
    } catch (ex) {
      console.log("error insert bulk", ex);
    } finally {
      db?.close();
    }
  },

  DatabaseExists: async function (): Promise<boolean> {
    return Dexie.exists(INDEXEDDB_NAME);
  },

  ReadData: async function (): Promise<Todo[]> {
    const db = DexieActions.OpenDb();
    const result = await db.todos.orderBy(TABLES.todos.columns.id).toArray();
    db.close();
    return result;
  },

  ReadDataByID: async function (id: number): Promise<Todo[]> {
    const db = DexieActions.OpenDb();
    const result = await db.todos.where(TABLES.todos.columns.id).equals(id).toArray();
    db.close();
    return result;
  },

  DeleteById: async function (id: number): Promise<void> {
    let db: DexieTodosDB | undefined;
    try {
      db = DexieActions.OpenDb();
      await db.todos.delete(id);
      console.log("Deleted.");
    } catch (ex) {
      console.log("Error delete.. ", ex);
    } finally {
      db?.close();
    }
  },

  Update: async function (id: number, newData: Partial<Todo>): Promise<void> {
    let db: DexieTodosDB | undefined;
    try {
      db = DexieActions.OpenDb();
      await db.todos.update(id, newData);
    } catch (ex) {
      console.log("Error update.. ", ex);
    } finally {
      db?.close();
    }
  }
};

export default DexieActions;
