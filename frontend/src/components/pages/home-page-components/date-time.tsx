import { useEffect, useState } from "react";

interface Props {
  timezone: string;
}

export default function AppointmentTime({ timezone }: Props) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  });

  const dateString = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
    timeZone: timezone,
  });

  return (
    <div className="text-right">
      <div>{timeString}</div>
      <div>{dateString}</div>
    </div>
  );
}
