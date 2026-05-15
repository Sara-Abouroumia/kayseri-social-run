import {
  resolveActivityTypeDisplay,
} from "@/lib/event-activity-type";

type Props = {
  activityType: string;
  activityTypeEmoji?: string | null;
  className?: string;
};

export function ActivityTypeDisplay({
  activityType,
  activityTypeEmoji = null,
  className,
}: Props) {
  const { emoji, label } = resolveActivityTypeDisplay(activityType, activityTypeEmoji);
  if (!label) return null;
  return (
    <span className={className}>
      {emoji ? (
        <span className="mr-1.5 inline-block" aria-hidden>
          {emoji}
        </span>
      ) : null}
      <span>{label}</span>
    </span>
  );
}
