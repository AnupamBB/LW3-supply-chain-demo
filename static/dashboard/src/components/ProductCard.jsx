import { useState } from "react";
import { api, PRODUCTS } from "../api";
import AddEventForm from "./AddEventForm";
import EventList from "./EventList";

export default function ProductCard({ product, token }) {
	const [data, setData] = useState(product);

	const refresh = async () => {
		const res = await api(PRODUCTS, `/products/${data._id}`, {
			token,
		});
		setData(res);
	};

	return (
		<div className="card">
			<h3>{data.name}</h3>

			<div className="meta">
				<span>Status: {data.status}</span>
				<span>Partner: {data.partnerId}</span>
			</div>

			<h4>Events</h4>
			<EventList events={data.events || []} />

			<AddEventForm
				token={token}
				productId={data._id}
				onAdded={refresh}
			/>
		</div>
	);
}
