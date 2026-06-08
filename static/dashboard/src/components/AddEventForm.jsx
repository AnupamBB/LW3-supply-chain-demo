import { useState } from "react";
import { api, PRODUCTS } from "../api";

export default function AddEventForm({ token, productId, onAdded }) {
	const [type, setType] = useState("shipped");
	const [note, setNote] = useState("");
	const [location, setLocation] = useState("");
	const [busy, setBusy] = useState(false);

	const submit = async () => {
		setBusy(true);

		try {
			await api(PRODUCTS, `/products/${productId}/events`, {
				method: "POST",
				token,
				body: {
					type,
					payload: { note, location },
				},
			});

			setNote("");
			setLocation("");
			onAdded();
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="eventBox">
			<h4>Add Event</h4>

			<select value={type} onChange={(e) => setType(e.target.value)}>
				<option>manufactured</option>
				<option>shipped</option>
				<option>received</option>
				<option>sold</option>
				<option>recycled</option>
			</select>

			<input
				placeholder="note"
				value={note}
				onChange={(e) => setNote(e.target.value)}
			/>

			<input
				placeholder="location"
				value={location}
				onChange={(e) => setLocation(e.target.value)}
			/>

			<button onClick={submit} disabled={busy} className="primary">
				{busy ? "Adding..." : "Add Event"}
			</button>
		</div>
	);
}
