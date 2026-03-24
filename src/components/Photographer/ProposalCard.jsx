import styles from "./ProposalCard.module.css";

export default function ProposalCard({ proposal, onAccept, onDecline }) {
  return (
    <div className={styles.card}>
      <h3>{proposal.clientName}</h3>
      <p>{proposal.date}</p>
      <p>{proposal.details}</p>

      <div className={styles.actions}>
        <button onClick={() => onAccept(proposal.id)}>Accept</button>
        <button onClick={() => onDecline(proposal.id)}>Decline</button>
      </div>
    </div>
  );
}
