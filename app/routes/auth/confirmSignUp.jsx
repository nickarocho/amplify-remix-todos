import { Auth } from "aws-amplify";

import { redirect, Form, json, useActionData, Link } from "remix";
import { getSession, commitSession } from "../../session.server";

// use loader to check for existing session, if found, send the user to the `privatePage`
export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("temp_user");

  if (session.has("access_token")) {
    // if the user is already signed in, redirect to the `privatePage`
    return redirect("/privatePage");
  } else if (user.userConfirmed) {
    // if the user is not signed in but already confirmed, redirect to `login`
    return redirect("/auth/login");
  }

  const data = { error: session.get("error") };

  return json(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

// our action function will be launched when the 'Confirm' button is clicked
// this will attempt to confirm our newly signed up Amplify user and update
// the server-side session cookie
export const action = async ({ request }) => {
  let error;
  let result;
  let user;

  try {
    let formData = await request.formData();
    let code = formData.get("code");
    let session = await getSession(request.headers.get("Cookie"));
    user = session.get("temp_user");

    result = await Auth.confirmSignUp(user.username, code);

    // if confirmation was successful then we have a user
    if (result === "SUCCESS") {
      // send the user to the main page after login
      session.set("temp_user", {
        ...user,
        userConfirmed: true,
      });

      // send the user to the main page after login
      return redirect("/auth/login", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  } catch (err) {
    error = err.message;
    console.error("[SERVER] confirmSignUp error: ", err);
  }

  return { result, error };
};

export function ConfirmSignUp() {
  const actionData = useActionData();

  return (
    <>
      <h1>Confirm Sign Up</h1>
      <Form method="post">
        <input name="code" type="text" placeholder="Code" />
        <button type="submit">Confirm</button>
      </Form>
      Already Confirmed? <Link to="/auth/login">Login</Link>
      {actionData?.error && <p className="error">{actionData.error}</p>}
    </>
  );
}

export default ConfirmSignUp;
