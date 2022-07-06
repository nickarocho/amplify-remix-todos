import { Auth } from "aws-amplify";

import { createUserSession } from "../session.server";
import { useState, useEffect, useCallback } from "react";
import { useFetcher } from "@remix-run/react";

export const action = async ({ request }) => {
  // get data from the form
  let formData = await request.formData();
  let accessToken = formData.get("accessToken");
  let idToken = formData.get("idToken");

  if (!accessToken || !idToken) throw new Error("action error");

  // create the user session
  return await createUserSession({
    request,
    userInfo: {
      accessToken,
      idToken,
    },
    redirectTo: "/privatePage",
  });
};

export function Login() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("nicaroch+123@amazon.com");
  const [password, setPassword] = useState("password");
  const [serverMessage, setServerMessage] = useState("");

  const fetcher = useFetcher();

  const setUserSessionInfo = useCallback(async () => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      setUser(currentUser);

      if (fetcher.type === "init") {
        // if we have an authenticated user, submit the tokens to the
        // `action` function to set up the cookies for server
        // authentication

        // TODO: this is really weak... can pass any string as values and it still works
        fetcher.submit(
          {
            accessToken: currentUser.signInUserSession.accessToken.jwtToken,
            idToken: currentUser.signInUserSession.idToken.jwtToken,
          },
          { method: "post" }
        );
      }
    } catch (err) {
      console.warn("setUserSessionInfo error: ", err);
    }
  }, [fetcher]);

  async function signIn() {
    try {
      const signInResult = await Auth.signIn(email, password);

      const { accessToken, idToken } = signInResult.signInUserSession;

      setUserSessionInfo(accessToken, idToken);
    } catch (err) {
      setServerMessage("Something went wrong... " + err.message);
      console.error("sign in error: ", err);
    }
  }

  async function signUp() {
    try {
      // sign the user up
      const { user } = await Auth.signUp(email, password);
      // retrieve the confirmation code
      const code = prompt("Confirmation code (sent to your email):");
      // confirm the user
      await confirmSignUp(code);
    } catch (err) {
      console.error("sign up error: ", err);
      setServerMessage("Something went wrong... " + err.message);
    }
  }

  async function confirmSignUp(code) {
    try {
      const result = await Auth.confirmSignUp(email, code);
      if (result === "SUCCESS") {
        setServerMessage(
          "Successfully signed up! You can sign in now with the credentials you created."
        );
      }
    } catch (err) {
      console.error("confirmSignUp error: ", err);
      setServerMessage("Something went wrong... " + err.message);
      const code = prompt(
        "Invalid (or missing) verification code, please try again:"
      );
      // recursively call to give user another chance
      confirmSignUp(code);
    }
  }

  // listening for when we have a user object...
  useEffect(() => {
    setUserSessionInfo(user);
  }, []);

  return (
    <>
      <h1>Sign In/Sign Up</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Email"
          value="nicaroch+123@amazonc.om"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" onClick={signIn}>
          Sign In
        </button>
        <button type="submit" onClick={signUp}>
          Sign Up
        </button>
      </form>
      {serverMessage && <p>{serverMessage}</p>}
    </>
  );
}

export default Login;
