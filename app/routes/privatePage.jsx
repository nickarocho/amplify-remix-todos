import { redirect, useSubmit, Form, json, useLoaderData } from "remix";
import { commitSession, destroySession, getSession } from "../session.server";

import { Auth } from "aws-amplify";
import { Heading } from "@aws-amplify/ui-react";

import TaskDisplay from "../components/Task";
import CreateTask from "../components/CreateTask";

export async function loader({ request }) {
  // the following code is how we protect the pages to be viewable only by logged in users
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("access_token")) {
    return redirect("/auth/login");
  }

  // the user is logged in, so fetch the data and any relevant errors
  const data = { error: session.get("error") };
  return (
    json(data, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }),
    getTasks()
  );
}

/**
 * this action function is called when the user logs
 * out of the application. We call logout on the server to
 * clear out the session cookies
 */
export const action = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.has("access_token")) {
    await Auth.signOut();
    return redirect("/auth/login", {
      headers: { "Set-Cookie": await destroySession(session) },
    });
  }

  return redirect("/auth/login");
};

const getTasks = () => {
  // TODO: fetch actual tasks
  const tasks = [
    { id: "123", description: "task 1..." },
    { id: "456", description: "task 2..." },
    { id: "789", description: "task 3..." },
  ];
  return tasks;
};

export default function PrivatePage() {
  const { tasks } = useLoaderData();

  const submit = useSubmit();

  return (
    <div style={{ padding: 16 }}>
      <Heading level={3} textAlign="center">
        Private Page
      </Heading>
      <h3>Logged in with authenticated user {/* TODO */}</h3>
      <Form method="post">
        <button className="ui button" type="submit">
          Log Out
        </button>
      </Form>
      <div className="ui segment">
        <h4>Data Loaded From Amplify</h4>
        <div className="ui list divided large relaxed">
          {tasks?.map((t) => {
            return <TaskDisplay submit={submit} key={t.id} task={t} />;
          })}
          <CreateTask />
        </div>
      </div>
    </div>
  );
}
