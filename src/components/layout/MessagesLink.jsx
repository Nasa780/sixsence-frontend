import Link from "next/link";
import { LuMail } from "react-icons/lu";
import useMessagesUnread from "../../hooks/useMessagesUnread";
import { cn } from "../../lib/cn";

/** Enveloppe de la barre du haut (connecté) : vers la messagerie, pastille du nombre de messages non lus. */
export function MessagesLink({ userId, active = false }) {
  const unread = useMessagesUnread(userId);
  return (
    <Link
      href="/messages"
      aria-label={unread ? `Messages : ${unread} non lu${unread > 1 ? "s" : ""}` : "Messages"}
      className={cn("relative grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-white/[0.08] hover:text-white", active ? "text-gold" : "text-white/70")}
    >
      <LuMail aria-hidden className="h-[18px] w-[18px]" />
      {unread ? (
        <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold px-1 font-tech text-[10px] font-bold leading-none text-ink tabular-nums">
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
