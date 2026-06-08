export default function EventList({ events }) {
	return (
		<ul className="timeline">
			{events.map((e) => (
				<li key={e._id}>
					<span className="tag">{e.type}</span>
					<span className="time">
						{new Date(e.createdAt).toLocaleString()}
					</span>
				</li>
			))}
		</ul>
	);
}
