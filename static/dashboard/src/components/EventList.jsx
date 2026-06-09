export default function EventList({ events }) {
	if (!events.length) {
		return <p className="muted">No events yet</p>;
	}

	return (
		<ul className="timeline">
			{events.map((e) => (
				<li key={e._id} className="eventItem">
					<span className="tag">{e.type}</span>

					<span className="time">
						{new Date(e.createdAt).toLocaleString()}
					</span>

					{e.payload?.note && (
						<div className="metaText">
							Description: {e.payload.note}
						</div>
					)}

					{e.payload?.location && (
						<div className="metaText">
							Location: {e.payload.location}
						</div>
					)}
				</li>
			))}
		</ul>
	);
}
