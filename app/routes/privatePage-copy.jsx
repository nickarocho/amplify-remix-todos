import { withSSRContext } from "aws-amplify";
import { json, useLoaderData } from "remix";
import { commitSession, getSession } from "../session.server";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));

  let user = null;
  try {
    const { Auth } = withSSRContext({ request });
    user = await Auth.currentAuthenticatedUser();
    console.log({ user });
  } catch (err) {
    console.error({ user, err });
  }

  if (user) {
    const data = {
      authenticated: true,
      username: user.username,
    };
    return json(data, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } else {
    const data = {
      authenticated: false,
      username: null,
    };
    return json(data, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
}

export default function PrivatePage() {
  const { authenticated, username } = useLoaderData();
  if (!authenticated) {
    return <h1>Not authenticated</h1>;
  }
  return <h1>Hello {username} from SSR route!</h1>;
}
