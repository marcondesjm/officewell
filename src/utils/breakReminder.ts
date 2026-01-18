export function iniciarLembrete(intervaloMinutos: number): number {
  const intervalId = window.setInterval(() => {
    // Use browser notification if permission granted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("⏰ Hora de fazer uma pausa!", {
        body: "Levante-se e faça um alongamento rápido.",
        icon: "/pwa-192x192.png",
      });
    }
  }, intervaloMinutos * 60 * 1000);

  return intervalId;
}

export function pararLembrete(intervalId: number): void {
  window.clearInterval(intervalId);
}
