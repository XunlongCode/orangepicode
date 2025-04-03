import { createMemoryRouter } from "react-router-dom";
import Layout from "../layout";
import Index from "../pages/index";
import Welcome from "../pages/welcome";
import { Usermenu } from '../pages/usermenu';
import Settings from '../pages/settings';

export const ORANGEPICODE_ONBOARDING_VIEWID = "onboarding_view";
export const ORANGEPICODE_USERMENU_VIEWID = "usermenu_view";
export const ORANGEPICODE_SETTINGS_VIEWID = "settings_view";

export const getInitialEntries = () => {
	switch (window.viewId) {
		case ORANGEPICODE_ONBOARDING_VIEWID:
			return [
				"/welcome"
			]

		case ORANGEPICODE_USERMENU_VIEWID:
			return [
				"/usermenu",
			]

		case ORANGEPICODE_SETTINGS_VIEWID:
			return [
				"/settings"
			]

		default:
			return [
				"/index.html"
			]
	}
}

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
				{
					path: "/usermenu",
					element: <Usermenu />,
				},
				{
					path: "/settings",
					element: <Settings />
				}
			],
		},
	],
	{
		initialEntries: getInitialEntries(),
	}
);
