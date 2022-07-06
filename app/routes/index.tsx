import { redirect } from "@remix-run/node";
import { requireUserId } from "../session.server";

// check for authenticated user, if not redirect to login
export async function loader({ request }) {
  try {
    await requireUserId(request, "/login");
  } catch (err) {
    console.error("index.tsx loader error: ", err);
  }
  return redirect("/privatePage");
}
