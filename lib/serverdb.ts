import DexieActions, { Todo } from "./dexiedb";

// The API endpoint (update as needed)
const api_url = "https://thriving-alpaca-4a24ea.netlify.app/doc";

interface ServerActionType {
  SaveToServer: (todo: Todo) => Promise<Todo | null>;
  DeleteFromServer: (id: number) => Promise<Response>;
  Sync: () => Promise<string>;
  ReadFromServer: () => Promise<Todo[]>;
  ImportFromServer: () => Promise<void>;
}

const ServerAction: ServerActionType = {
  // Save to-do to server
  async SaveToServer(todo: Todo): Promise<Todo | null> {
    try {
      const response = await fetch(api_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todo)
      });
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      return await response.json() as Todo;
    } catch (error) {
      console.error("Failed to save:", error);
      return null;
    }
  },

  // Delete to-do from server
  async DeleteFromServer(id: number): Promise<Response> {
    return await fetch(`${api_url}/${id}`, {
      method: "DELETE"
    });
  },

  // Sync all local to-dos to server
  async Sync(): Promise<string> {
    try {
      const waitingData = await DexieActions.ReadDataByStatus(["w", "0"]);
      if (waitingData.length === 0) {
        return "No items to sync..";
      }
      for (const item of waitingData) {
        const result = item.status === "0" ?
        await ServerAction.DeleteFromServer(item.id!):
        await ServerAction.SaveToServer(item)

        if (item.status === "w") {
                item.status = "1";
            }
        if (!result) {
          throw new Error("Error during saving some items to server.");
        }
        // Optionally mark as synced in Dexie or delete after sync if needed
      }
      return "Sync completed successfully.";
    } catch (error) {
      console.log("Error..", error);
      throw error;
    }
  },

  // Read all to-dos from server
  async ReadFromServer(): Promise<Todo[]> {
    try {
      const res = await fetch(api_url);
      if (!res.ok) throw new Error(`Fetch failed with status: ${res.status}`);
      const data: Todo[] = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  },

  // Replace local to-dos with server to-dos (import)
  async ImportFromServer(): Promise<void> {
    try {
      const serverTodos = await ServerAction.ReadFromServer();
      // Optionally clear local DB first (implement DexieActions.ClearAll if needed)
      await DexieActions.InsertBulk(serverTodos);
    } catch (error) {
      console.error("Import failed:", error);
      throw error;
    }
  }
};

export default ServerAction;
