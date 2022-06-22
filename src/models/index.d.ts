import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





type TaskMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Task {
  readonly id: string;
  readonly done: boolean;
  readonly dueDate?: string | null;
  readonly name: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Task, TaskMetaData>);
  static copyOf(source: Task, mutator: (draft: MutableModel<Task, TaskMetaData>) => MutableModel<Task, TaskMetaData> | void): Task;
}