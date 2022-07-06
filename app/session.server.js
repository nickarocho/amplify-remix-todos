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
  const cookie = request?.headers?.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getUserSessionInfo(request) {
  const session = await getSession(request);
  const userSessionInfo = session.get(USER_SESSION_KEY);
  return userSessionInfo;
}

export async function requireUserId(request, redirectTo) {
  const userId = await getUserSessionInfo(request);

  // missing validation token!!
  if (!userId && redirectTo) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function createUserSession({ request, userInfo, redirectTo }) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userInfo);
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
    console.log("server logout");
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
