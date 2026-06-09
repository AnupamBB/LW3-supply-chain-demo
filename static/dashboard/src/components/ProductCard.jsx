import { useEffect, useState } from "react";
import { api } from "../api";
import { getAuth } from "../utils/auth";
import AddEventForm from "./AddEventForm";
import EventList from "./EventList";

export default function ProductCard({ product }) {
	const [data, setData] = useState(product);
	const [verify, setVerify] = useState(null);

	const auth = getAuth();
	const isInternal = auth?.role === "internal";

	useEffect(() => {
		setData(product);
		setVerify(null);
	}, [product]);

	const refresh = async () => {
		const res = await api(
			"http://localhost:3002",
			`/products/${data._id}`,
			{ token: auth?.token },
		);
		setData(res);
	};

	const verifyChain = async () => {
		try {
			const res = await api(
				"http://localhost:3002",
				`/products/${data._id}/verify`,
				{ token: auth?.token },
			);
			setVerify(res);
		} catch (e) {
			setVerify({ valid: false, error: e.message });
		}
	};

	return (
		<div className="card">
			<h3>{data.name}</h3>

			<div className="meta">
				<span>Status: {data.status}</span>
				<span>Partner: {data.partnerId}</span>
				<span>Role: {auth?.role}</span>
			</div>

			{isInternal ? (
				<button className="primary" onClick={verifyChain}>
					Verify Chain
				</button>
			) : (
				<p className="muted"> </p>
			)}
			{verify && (
				<p className={verify.valid ? "ok" : "error"}>
					{verify.valid
						? "Supply chain verified successfully"
						: "Supply chain verification failed"}
				</p>
			)}

			<h4>Events</h4>
			<EventList events={data.events || []} />

			{isInternal ? (
				<AddEventForm productId={data._id} onAdded={refresh} />
			) : (
				<p className="muted"> </p>
			)}
		</div>
	);
}
