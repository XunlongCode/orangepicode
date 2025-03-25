import { Outlet } from "react-router-dom";

const Layout = () => {
	return (
		<div className='h-screen bg-transparent'>
			<Outlet />
		</div>
	);
};

export default Layout;
