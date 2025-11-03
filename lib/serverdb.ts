import DexieActions, { Todo } from "./dexiedb";
const api_url = process.env.NEXT_PUBLIC_BASE_URL + "/api/todos";

const ServerAction = {
  async SaveToServer(todo: Todo) {
    try {
      const response = await fetch(api_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todo)
      });
      if (!response.ok) throw new Error("HTTP Error: " + response.status);
      return response.json();
    } catch (e) {
      return null;
    }
  },
  async DeleteFromServer(id: number) {
    return fetch(`${api_url}/${id}`, { method: "DELETE" });
  },
  async Sync() {
    // Get all todos with status "w" (waiting to sync) or "0" (pending deletion)
    const waitingData = await DexieActions.ReadDataByStatus(["0", "w"]);
    if (waitingData.length === 0) return "No items to sync.";

    for (const itm of waitingData) {
      if (itm.status === "w") itm.status = "1"; // Mark as synced if upload successful
      let result;
      if (itm.status === "0") {
        result = await ServerAction.DeleteFromServer(itm.id!);
      } else {
        result = await ServerAction.SaveToServer(itm);
      }

      if (result) {
        if (itm.status === "0") {
          await DexieActions.DeleteById(itm.id!);
        } else {
          await DexieActions.Update(itm.id!, itm);
        }
      } else {
        throw new Error("Error syncing item");
      }
    }

    return "Sync completed successfully.";
  },
  async ReadFromServer() {
    const res = await fetch(api_url);
    if (!res.ok) throw new Error("Fetch failed with status: " + res.status);
    return res.json();
  },
  async ImportFromServer() {
    const data = await ServerAction.ReadFromServer();
    await DexieActions.DeleteByStatus("1"); // clear all synced todos to avoid duplicates
    await DexieActions.InsertBulk(data);
  }
};

export default ServerAction;
