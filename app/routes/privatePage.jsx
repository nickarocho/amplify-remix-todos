import { useFetcher, useLoaderData } from "@remix-run/react";
import { Auth } from "aws-amplify";
import { Heading } from "@aws-amplify/ui-react";
import { logout, requireSession } from "../session.server";
import { useEffect, useState } from "react";
import { json } from "@remix-run/node";

import { useSubmit } from "remix";

import TaskDisplay from "../components/Task";
import CreateTask from "../components/CreateTask";

export async function loader({ request }) {
  const sessionInfo = await requireSession(request, "/login");
  const { accessToken, idToken } = sessionInfo || {};

  // TODO: fetch actual tasks
  const tasks = [
    { id: "123", description: "hmm..." },
    { id: "456", description: "kay..." },
    { id: "789", description: "ugh..." },
  ];

  return json({
    accessToken,
    idToken,
    tasks: tasks,
  });
}

/**
 * this action function is called when the user logs
 * out of the application. We call logout on server to
 * clear out the session cookies
 */
export const action = async ({ request }) => {
  return await logout(request);
};

export default function PrivatePage() {
  const fetcher = useFetcher();
  const { accessToken, idToken, tasks } = useLoaderData();
  const [user, setUser] = useState();

  const submit = useSubmit();

  const fetchUser = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      setUser(user);
    } catch (err) {
      console.error("fetchUser error: ", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [accessToken, idToken]);

  return (
    <div style={{ padding: 16 }}>
      <Heading level={3} textAlign="center">
        Private Page
      </Heading>
      <h3>Logged in with authenticated user {user?.attributes?.email}</h3>
      <button
        className="ui button"
        type="button"
        onClick={async () => {
          // Amplify sign out - removes JWT's from local storage
          await Auth.signOut({ global: true });

          // clear out the internally-set Remix session cookie
          fetcher.submit({}, { method: "post" });
        }}
      >
        Log Out
      </button>
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
