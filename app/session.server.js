import { createCookieSessionStorage, redirect } from "@remix-run/node";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secrets: ["asdadasdasd"],
    secure: process.env.NODE_ENV === "production",
  },
});

const USER_SESSION_KEY = "userId";

export async function getSession(request) {
  const cookie = request?.headers?.get("cookie"); // CognitoIdentityServiceProvider.xxxxxxx.xxxxxxxx
  return sessionStorage.getSession(cookie);
}

export async function getUserSessionInfo(request) {
  const session = await getSession(request);
  const userSessionInfo = session.get(USER_SESSION_KEY);
  return userSessionInfo;
}

export async function requireSession(request, redirectTo) {
  const session = await getUserSessionInfo(request);

  // missing session tokens!!
  if (!session && redirectTo) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return session;
}

export async function createUserSession({ request, userInfo, redirectTo }) {
  const session = await getSession(request);

  session.set(
    USER_SESSION_KEY,
    userInfo
    // TODO: this is super weak... we can pass anything (or nothing) as the token values and it will still work
    //  i.e.:
    // userInfo: {
    //   accessToken: "",
    //   idToken: "",
    // },
  );
  return redirect(redirectTo || "/privatePage", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
      }),
    },
  });
}

export async function logout(request) {
  try {
    const session = await getSession(request);
    return redirect("/", {
      headers: {
        "Set-Cookie": await sessionStorage.destroySession(session),
      },
    });
  } catch (err) {
    console.error("server logout error", err);
  }
}
