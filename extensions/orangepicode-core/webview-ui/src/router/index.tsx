import { createMemoryRouter } from "react-router-dom";
import Layout from "../layout";
import Splash from "../pages/splash";
import Welcome from "../pages/welcome";

export const router = createMemoryRouter([
	{
		path: "/",
		element: <Layout />,
		children: [
			{
				path: "/index.html",
				element: <Splash />,
			},
			{
				path: "/welcome",
				element: <Welcome />,
			},
		],
	},
]);
