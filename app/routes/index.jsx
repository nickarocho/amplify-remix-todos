import { withSSRContext, DataStore, Auth } from "aws-amplify";
import { json, useLoaderData, useSubmit } from "remix";
import { Heading, Button, Text } from "@aws-amplify/ui-react";
import { Task } from "../../src/models";
import { serializeModel } from "@aws-amplify/datastore/ssr";
import { useState, useEffect } from "react";

import CreateTask from "../components/CreateTask";
import TaskDisplay from "../components/Task";

export const loader = async ({ request }) => {
  const tasks = await DataStore.query(Task);
  return json(serializeModel(tasks));
};

function Index(props) {
  // console.log({ props });
  const [user, setUser] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const submit = useSubmit();
  const tasks = useLoaderData();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const user = await Auth.currentAuthenticatedUser();
      console.log({ user });
      setUser(user);
    } catch (err) {
      console.error("error checking user: ", err);
    }
  }

  async function signIn() {
    try {
      console.log("signing in...");
      const result = await Auth.signIn(email, password);
      console.log("sign in result: ", result);
      setUser(result);
    } catch (err) {
      console.error("sign in error: ", err);
    }
  }

  async function signUp() {
    try {
      console.log("signing up...");
      const result = await Auth.signUp(email, password);
      console.log("sign up result: ", result);
    } catch (err) {
      console.error("sign up error: ", err);
    }
  }

  async function confirmSignUp() {
    try {
      console.log("confirming signing up...");
      const result = await Auth.confirmSignUp(email, code);
      console.log("confirm sign up result: ", result);
    } catch (err) {
      console.error("confirm sign up error: ", err);
    }
  }

  async function signOut() {
    try {
      await Auth.signOut();
      checkUser();
    } catch (err) {
      console.error("sign out error: ", err);
    }
  }

  return (
    <div style={{ maxWidth: "60%", margin: "0 auto" }}>
      {user ? (
        <div>
          <h1 className="text-3xl font-semibold tracking-wide mt-6">Profile</h1>
          <h3 className="font-medium text-gray-500 my-2">
            Username: {user.username}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Email: {user.attributes.email}
          </p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          <input
            value={email}
            type="text"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email..."
          />
          <input
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password..."
          />
          <button onClick={signIn}>Sign In</button>
          <button onClick={signUp}>Sign Up</button>
          <input
            type="number"
            onChange={(e) => setCode(e.target.value)}
            placeholder="code..."
          />
          <button onClick={confirmSignUp}>Confirm Sign Up</button>
        </div>
      )}
      <Heading level={1} textAlign="center">
        To Do
      </Heading>
      <ul>
        {tasks.map((task) => (
          <TaskDisplay submit={submit} key={task.id} task={task} />
        ))}
      </ul>
      <CreateTask />
    </div>
  );
}

export default Index;
