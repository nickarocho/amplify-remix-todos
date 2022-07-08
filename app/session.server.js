import { createCookieSessionStorage } from "@remix-run/node";

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      // amplify auth token
      name: "amplify:token",

      // all of these are optional
      expires: new Date(Date.now() + 600),
      httpOnly: true,
      maxAge: 600,
      path: "/",
      sameSite: "lax",
      secrets: ["tacos"],
      secure: true,
    },
  });

export { getSession, commitSession, destroySession };
