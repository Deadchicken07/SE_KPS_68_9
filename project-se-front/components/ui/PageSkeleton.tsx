import { Card, Skeleton } from "antd";

interface PageSkeletonProps {
  cards?: { rows: number }[];
}

export default function PageSkeleton({ cards = [{ rows: 6 }] }: PageSkeletonProps) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "80%", display: "flex", flexDirection: "column", gap: 16 }}>
        {cards.map((card, i) => (
          <Card key={i} style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <Skeleton active paragraph={{ rows: card.rows }} />
          </Card>
        ))}
      </div>
    </div>
  );
}
