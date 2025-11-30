/**
 * Helper per assicurarsi che un utente abbia profilo e ruolo
 * Idempotente: può essere chiamato più volte senza problemi
 */
export async function ensureUserBootstrap(
  userId: string,
  email: string,
  name?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/auth/bootstrap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        email,
        name: name || email.split("@")[0], // Usa parte prima di @ se name non fornito
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      return { success: false, error: error.error || "Failed to bootstrap user" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error ensuring user bootstrap:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
