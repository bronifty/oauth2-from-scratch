import { href, redirect } from "react-router";
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader(_: Route.LoaderArgs) {
  return redirect(href("/contacts"));
}

export default function Home() {
  return <Welcome />;
}
