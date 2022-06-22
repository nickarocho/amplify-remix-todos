import { redirect } from "remix";
import { DataStore } from "aws-amplify";
import { Task } from "../../../src/models";

export async function action({ params, request }) {
  const taskToUpdate = await DataStore.query(Task, params.taskId);

  await DataStore.save(
    Task.copyOf(taskToUpdate, (updated) => {
      updated.done = !updated.done;
    })
  );

  return redirect("/");
}
