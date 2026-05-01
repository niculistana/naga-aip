import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Outlet, type LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

export async function loader({ params }: LoaderFunctionArgs) {
  return redirect("/home");
}

export default () => {
  return null;
};
