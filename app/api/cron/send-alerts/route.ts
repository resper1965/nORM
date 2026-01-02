import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAlertEmail } from "@/lib/notifications/email";
import { logger } from "@/lib/utils/logger";
import { env } from "@/lib/config/env";

import { requireCronAuth } from "@/lib/auth/cron-auth";

export async function POST(request: NextRequest) {
  try {
    // Verify cron authentication
    const authError = requireCronAuth(request);
    if (authError) return authError;

    const supabase = createAdminClient();
    let processed = 0;
    let errors: string[] = [];
    // 1. Fetch pending high/critical alerts
    const { data: alerts, error: alertsError } = await supabase
      .from("alerts")
      .select(
        `
        id,
        title,
        message,
        severity,
        client_id,
        clients (
          name
        )
      `
      )
      .eq("email_sent", false)
      .eq("status", "active")
      .in("severity", ["high", "critical"])
      .limit(20); // Batch size

    if (alertsError) throw alertsError;

    if (!alerts || alerts.length === 0) {
      return NextResponse.json({ message: "No pending alerts found" });
    }

    // 2. Process each alert
    for (const alert of alerts) {
      try {
        const clientName =
          alert.clients && !Array.isArray(alert.clients)
            ? (alert.clients as any).name
            : "Unknown Client";

        // 3. Get recipients (Admins and Editors of the client)
        const { data: recipients, error: recipientsError } = await supabase
          .from("client_users")
          .select("user_id")
          .eq("client_id", alert.client_id)
          .in("role", ["admin", "editor"]);

        if (recipientsError) throw recipientsError;

        if (!recipients || recipients.length === 0) {
          logger.warn(`No recipients found for client ${alert.client_id}`);
          continue;
        }

        // 4. Get User Emails & Send
        const userIds = recipients.map((r) => r.user_id);
        const sentTo: string[] = [];

        for (const userId of userIds) {
          try {
            const {
              data: { user },
              error: userError,
            } = await supabase.auth.admin.getUserById(userId);

            if (user && user.email) {
              await sendAlertEmail(user.email, {
                title: alert.title,
                message: alert.message,
                severity: alert.severity,
                clientName: clientName,
                dashboardUrl: `${env.NEXT_PUBLIC_APP_URL}/clients/${alert.client_id}`,
              });
              sentTo.push(user.email);
            }
          } catch (emailErr) {
            logger.error(
              `Failed to send email to user ${userId}`,
              emailErr as Error
            );
          }
        }

        // 5. Mark as sent
        if (sentTo.length > 0) {
          await supabase
            .from("alerts")
            .update({
              email_sent: true,
              email_sent_at: new Date().toISOString(),
            })
            .eq("id", alert.id);

          processed++;
        }
      } catch (innerErr) {
        logger.error(`Failed to process alert ${alert.id}`, innerErr as Error);
        errors.push(`Alert ${alert.id}: ${(innerErr as Error).message}`);
      }
    }

    return NextResponse.json({
      processed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    logger.error("Error in send-alerts cron", err as Error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
