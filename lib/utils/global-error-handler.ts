/**
 * Global Error Handler
 * Cattura errori non gestiti e li logga per debugging
 */

if (typeof window !== "undefined") {
  // Cattura errori JavaScript non gestiti
  window.addEventListener("error", (event) => {
    console.error("Unhandled error:", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      stack: event.error?.stack,
    });

    // In produzione, potresti voler inviare questo a un servizio di logging
    if (process.env.NODE_ENV === "production") {
      // Example: logErrorToService(event.error);
    }
  });

  // Cattura promise rejection non gestite
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", {
      reason: event.reason,
      promise: event.promise,
    });

    // In produzione, potresti voler inviare questo a un servizio di logging
    if (process.env.NODE_ENV === "production") {
      // Example: logErrorToService(event.reason);
    }
  });

  // Cattura errori React non gestiti (se React Error Boundary non li cattura)
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Filtra errori di hydration che sono già gestiti
    const message = String(args[0] || "");
    const isHydrationError =
      message.includes("Hydration") ||
      message.includes("hydration") ||
      message.includes("Minified React error");

    if (!isHydrationError) {
      originalConsoleError.apply(console, args);
    }
  };
}
