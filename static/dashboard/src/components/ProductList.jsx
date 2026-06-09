import { useEffect, useState } from "react";
import { api } from "../api";
import { getAuth } from "../utils/auth";

export default function ProductList({ onSelect }) {
	const [products, setProducts] = useState([]);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const auth = getAuth();

	const load = async () => {
		setLoading(true);
		setError("");

		try {
			const res = await api("http://localhost:3002", "/products", {
				token: auth?.token,
			});

			console.log("PRODUCT API:", res); // DEBUG

			const list = Array.isArray(res.data)
				? res.data
				: Array.isArray(res)
					? res
					: [];

			setProducts(list);
		} catch (e) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	return (
		<div className="card">
			<h2>Product List</h2>

			{loading && <p>Loading...</p>}
			{error && <p className="error">{error}</p>}

			<ul>
				{products.map((p) => (
					<li key={p._id}>
						<button
							className="linkBtn"
							onClick={() => onSelect(p._id)}
						>
							{p.name} — {p.status}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
