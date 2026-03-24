import styles from "./EventCard.module.css";

export default function EventCard({ event }) {
  return (
    <div className={styles.card}>
      <h3>{event.title}</h3>
      <p>{event.date}</p>
      <p>Status: {event.status}</p>
    </div>
  );
}
