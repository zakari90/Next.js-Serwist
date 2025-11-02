import Dexie from "dexie";

// Set up Dexie database
const dexieDb = new Dexie("dexieDb");
dexieDb.version(1).stores({
  todos: "++id,name", // auto-increment id, and name field
});
 export { dexieDb };
// Type for a todo
