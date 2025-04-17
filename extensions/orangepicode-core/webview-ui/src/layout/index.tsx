import { Outlet } from "react-router-dom";

const Layout = () => {
	return (
		<div className="h-screen bg-transparent pointer-events-none">
			<Outlet />
		</div>
	);
};

export default Layout;
