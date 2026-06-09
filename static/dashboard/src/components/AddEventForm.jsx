import { useState } from "react";
import { api } from "../api";
import { getAuth } from "../utils/auth";

export default function AddEventForm({ productId, onAdded }) {
	const [type, setType] = useState("shipped");
	const [note, setNote] = useState("");
	const [location, setLocation] = useState("");

	const [busy, setBusy] = useState(false);

	const auth = getAuth();

	const submit = async () => {
		setBusy(true);

		try {
			await api(
				"http://localhost:3002",
				`/products/${productId}/events`,
				{
					method: "POST",
					token: auth?.token,
					body: {
						type,
						payload: { note, location },
					},
				},
			);

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
				value={note}
				onChange={(e) => setNote(e.target.value)}
				placeholder="note"
			/>

			<input
				value={location}
				onChange={(e) => setLocation(e.target.value)}
				placeholder="location"
			/>

			<button className="primary" onClick={submit} disabled={busy}>
				{busy ? "Adding..." : "Add Event"}
			</button>
		</div>
	);
}
