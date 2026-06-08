import { useState } from "react";
import { api, PRODUCTS } from "../api";
import ProductCard from "./ProductCard";

export default function Dashboard({ token }) {
	const [productId, setProductId] = useState("");
	const [product, setProduct] = useState(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const loadProduct = async () => {
		setError("");
		setLoading(true);

		try {
			const res = await api(PRODUCTS, `/products/${productId}`, {
				token,
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
			<div className="card">
				<h2>Dashboard</h2>

				<div className="row">
					<input
						placeholder="Enter Product ID"
						value={productId}
						onChange={(e) => setProductId(e.target.value)}
					/>

					<button onClick={loadProduct} className="primary">
						{loading ? "Loading..." : "Load"}
					</button>
				</div>

				{error && <p className="error">{error}</p>}
			</div>

			{product && <ProductCard token={token} product={product} />}
		</div>
	);
}
