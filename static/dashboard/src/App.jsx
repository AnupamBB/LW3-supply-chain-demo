import { useState } from "react";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";

export default function App() {
	const [token, setToken] = useState(localStorage.getItem("token"));

	return (
		<div className="app">
			<h1 className="title">Supply Chain System</h1>

			{!token ? (
				<Login onLogin={setToken} />
			) : (
				<>
					<button
						className="logout"
						onClick={() => {
							localStorage.removeItem("token");
							setToken(null);
						}}
					>
						Logout
					</button>

					<Dashboard token={token} />
				</>
			)}
		</div>
	);
}
