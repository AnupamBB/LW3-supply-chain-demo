import { useState } from "react";
import { api } from "../api";
import { getAuth } from "../utils/auth";
import ProductCard from "./ProductCard";
import ProductList from "./ProductList";

export default function Dashboard() {
	const [productId, setProductId] = useState("");
	const [product, setProduct] = useState(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const auth = getAuth();

	const loadProduct = async (id) => {
		const pid = id || productId;

		setLoading(true);
		setError("");

		try {
			const res = await api("http://localhost:3002", `/products/${pid}`, {
				token: auth?.token,
			});

			setProduct(res);
		} catch (e) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="dashboard">
			<ProductList onSelect={loadProduct} />

			<div className="card">
				<h2>Lookup Product</h2>

				<div className="row">
					<input
						value={productId}
						onChange={(e) => setProductId(e.target.value)}
						placeholder="Enter Product ID"
					/>

					<button className="primary" onClick={() => loadProduct()}>
						{loading ? "Loading..." : "Load"}
					</button>
				</div>

				{error && <p className="error">{error}</p>}
			</div>

			{product && <ProductCard product={product} />}
		</div>
	);
}
