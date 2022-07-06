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
// this will sign in our Amplify user and create our session and cookie using user.getIDToken()
export const action = async ({ request }) => {
  let error;
  let amplifyUser;

  try {
    let formData = await request.formData();
    let email = formData.get("email");
    let password = formData.get("password");

    // sign out any existing users
    await Auth.signOut();

    // sign up the new user
    const { user, userConfirmed } = await Auth.signUp(email, password);
    amplifyUser = user;

    // if signUp was successful then we have a user
    if (amplifyUser) {
      // setup the session and cookie wth the unconfirmed user info
      let session = await getSession(request.headers.get("Cookie"));
      session.set("temp_user", {
        ...amplifyUser,
        userConfirmed,
      });

      // send the user to the main page after login
      return redirect("/auth/confirmSignUp", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  } catch (err) {
    error = err.message;
    console.error("[SERVER] signUp error: ", err);
  }

  return { amplifyUser, error };
};

export function SignUp() {
  const actionData = useActionData();

  return (
    <>
      <h1>Sign Up</h1>
      <div>
        Already Registered? <Link to="/auth/login">Login</Link>
      </div>
      <Form method="post">
        <input name="email" type="text" placeholder="Email" />
        <input
          name="password"
          type="password"
          placeholder="Password"
          defaultValue="password"
        />
        <button type="submit">Sign Up</button>
      </Form>
      {actionData?.error && <p className="error">{actionData.error}</p>}
    </>
  );
}

export default SignUp;
