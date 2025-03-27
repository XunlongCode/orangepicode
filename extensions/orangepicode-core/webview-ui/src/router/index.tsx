import { createMemoryRouter } from "react-router-dom";
import Layout from "../layout";
import Index from "../pages/index";
import Welcome from "../pages/welcome";

export const router = createMemoryRouter(
	[
		{
			path: "/",
			element: <Layout />,
			children: [
				{
					path: "/index.html",
					element: <Index />,
				},
				{
					path: "/welcome",
					element: <Welcome />,
				},
			],
		},
	],
	{
		initialEntries: [window.isOnboardingCompleted ? "/index.html" : "/welcome"],
	}
);
