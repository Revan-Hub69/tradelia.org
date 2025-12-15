/**
 * Security Audit Logging
 *
 * Conforme a NIST Cybersecurity Framework - Detect & Respond
 *
 * Riferimenti:
 * - NIST SP 800-92: Guide to Computer Security Log Management
 * - OWASP Logging Cheat Sheet
 */

import { createClient } from "@/lib/supabase/server";

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  userId?: string;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  metadata?: Record<string, unknown>;
  severity: "low" | "medium" | "high" | "critical";
}

class AuditLogger {
  private async logToDatabase(entry: AuditLogEntry): Promise<void> {
    try {
      const supabase = await createClient();

      // Tabella audit_logs (creare migration se non esiste)
      await supabase.from("audit_logs").insert({
        timestamp: entry.timestamp,
        action: entry.action,
        user_id: entry.userId,
        user_email: entry.userEmail,
        ip: entry.ip,
        user_agent: entry.userAgent,
        endpoint: entry.endpoint,
        method: entry.method,
        status_code: entry.statusCode,
        metadata: entry.metadata,
        severity: entry.severity,
      });
    } catch (error) {
      // Non fallire se il logging fallisce
      console.error("Failed to log audit entry:", error);
    }
  }

  async log(entry: Omit<AuditLogEntry, "timestamp">): Promise<void> {
    const fullEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    // Log critico sempre in console
    if (entry.severity === "critical" || entry.severity === "high") {
      console.warn("[AUDIT]", fullEntry);
    }

    // Log in database (async, non blocca)
    this.logToDatabase(fullEntry).catch(() => {
      // Ignore errors
    });
  }

  async logApiCall(
    action: string,
    request: {
      userId?: string;
      userEmail?: string;
      ip?: string;
      userAgent?: string;
      endpoint?: string;
      method?: string;
      statusCode?: number;
    },
    severity: AuditLogEntry["severity"] = "low"
  ): Promise<void> {
    await this.log({
      action: `API_${action}`,
      ...request,
      severity,
    });
  }

  async logSecurityEvent(
    event: string,
    context: {
      userId?: string;
      userEmail?: string;
      ip?: string;
      metadata?: Record<string, unknown>;
    },
    severity: AuditLogEntry["severity"] = "high"
  ): Promise<void> {
    await this.log({
      action: `SECURITY_${event}`,
      ...context,
      severity,
    });
  }

  async logAuthentication(
    event: "LOGIN" | "LOGOUT" | "LOGIN_FAILED" | "PASSWORD_RESET",
    context: {
      userId?: string;
      userEmail?: string;
      ip?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<void> {
    await this.log({
      action: `AUTH_${event}`,
      ...context,
      severity: event === "LOGIN_FAILED" ? "medium" : "low",
    });
  }
}

export const auditLog = new AuditLogger();
