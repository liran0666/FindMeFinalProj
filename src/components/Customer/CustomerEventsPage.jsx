import { useEffect, useState } from "react";

export default function CustomerEventsPage({ user }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // TEMP fake data (until backend is connected)
    setEvents([
      {
        id: 1,
        type: "חתונה",
        photographer: "יונתן לוי",
        date: "13/06/26",
        status: "upcoming",
        photosReady: false,
      },
      {
        id: 2,
        type: "יום הולדת",
        photographer: "מיכל כהן",
        date: "05/12/25",
        status: "completed",
        photosReady: true,
      },
    ]);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>📅 האירועים שלי</h2>

      {events.map((ev) => (
        <div
          key={ev.id}
          style={{
            border: "1px solid #ccc",
            padding: 12,
            marginBottom: 10,
            borderRadius: 8,
          }}
        >
          <div>
            <b>{ev.type}</b>
          </div>
          <div>📷 {ev.photographer}</div>
          <div>📅 {ev.date}</div>
          <div>{ev.status === "upcoming" ? "🟡 קרוב" : "🟢 הושלם"}</div>

          {ev.photosReady && <button>🖼️ צפה בתמונות</button>}
        </div>
      ))}
    </div>
  );
}
