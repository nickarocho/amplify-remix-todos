import { redirect, Form, json, useActionData, Link } from "remix";
import { getSession, commitSession } from "../../session.server";

import { Auth } from "aws-amplify";

// use loader to check for existing session, if found, send the user to the `privatePage`
export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.has("access_token")) {
    // Redirect to the `privatePage` if they are already signed in.
    return redirect("/privatePage");
  }

  const data = { error: session.get("error") };

  return json(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

// our action function will be launched when the submit button is clicked
// this will sign in our Amplify user and create our session and cookie
export const action = async ({ request }) => {
  let error;
  let amplifyUser;

  try {
    let formData = await request.formData();
    let email = formData.get("email");
    let password = formData.get("password");

    // sign the user in
    const user = await Auth.signIn(email, password);
    amplifyUser = user;

    // if signin was successful, redirect to the `privatePage`
    if (amplifyUser) {
      // setup the session and cookie wth user's access_token
      let session = await getSession(request.headers.get("Cookie"));

      // check for the temp user cookie set during signUp, and unset if it's there
      // to avoid mismatch of user objects, and cookie exceeding the length limits
      const tempUserCookie = session.get("temp_user");
      if (tempUserCookie) {
        session.unset("temp_user");
      }

      session.set("access_token", amplifyUser.signInUserSession.idToken);

      // persist the mutated session, and redirect
      return redirect("/privatePage", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  } catch (err) {
    error = err.message;
    console.error("[SERVER] signIn error: ", err);
  }

  return { error };
};

export function Login() {
  const actionData = useActionData();

  return (
    <>
      <h1>Sign In</h1>
      <div>
        Already Registered? <Link to="/auth/signUp">Sign Up</Link>
      </div>
      <Form method="post">
        <input name="email" type="text" placeholder="Email" />
        <input
          name="password"
          type="password"
          placeholder="Password"
          defaultValue="password"
        />
        <button type="submit">Sign In</button>
      </Form>
      {actionData?.error && <p className="error">{actionData.error}</p>}
    </>
  );
}

export default Login;
