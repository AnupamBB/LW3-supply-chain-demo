import { useState } from "react";
import { api, AUTH } from "../api";

export default function Login({ onLogin }) {
	const [email, setEmail] = useState("internal@lw3.com");
	const [password, setPassword] = useState("password123");
	const [err, setErr] = useState("");

	const submit = async (e) => {
		e.preventDefault();
		setErr("");

		try {
			const res = await api(AUTH, "/login", {
				method: "POST",
				body: { email, password },
			});

			localStorage.setItem("token", res.token);
			onLogin(res.token);
		} catch (e) {
			setErr(e.message);
		}
	};

	return (
		<div className="card center">
			<h2>Login</h2>

			<form onSubmit={submit} className="form">
				<input
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>

				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>

				<button className="primary">Login</button>
			</form>

			{err && <p className="error">{err}</p>}
		</div>
	);
}
