/**
 * Alert Notification Service
 * Manages email notifications for alerts
 */

import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/notifications/email';
import { logger } from '@/lib/utils/logger';
import type { Alert, AlertSeverity } from '@/lib/types/domain';

interface AlertRecipient {
  email: string;
  name: string;
  userId: string;
}

interface GroupedAlert {
  clientId: string;
  clientName: string;
  alerts: Alert[];
  recipients: AlertRecipient[];
}

/**
 * Get recipients for a client's alerts
 * Returns users who should receive alert notifications
 */
export async function getAlertRecipients(clientId: string): Promise<AlertRecipient[]> {
  const supabase = await createClient();
  const recipients: AlertRecipient[] = [];

  // Get client details
  const { data: client } = await supabase
    .from('clients')
    .select('user_id')
    .eq('id', clientId)
    .single();

  if (!client) {
    logger.warn('Client not found for alert recipients', { clientId });
    return recipients;
  }

  // Get primary user (client owner)
  const { data: owner } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('id', client.user_id)
    .single();

  if (owner) {
    recipients.push({
      email: owner.email,
      name: owner.name || 'User',
      userId: owner.id,
    });
  }

  // TODO: In future, get additional recipients from notification_preferences table
  // This would include:
  // - Team members with access to this client
  // - Users who subscribed to this client's alerts
  // - Custom email addresses configured for notifications

  return recipients;
}

/**
 * Group pending alerts by client for batch email sending
 * Only includes alerts that haven't been sent yet
 */
export async function groupPendingAlerts(): Promise<GroupedAlert[]> {
  const supabase = await createClient();

  // Get all active alerts that haven't been sent
  const { data: pendingAlerts, error } = await supabase
    .from('alerts')
    .select(`
      *,
      clients (
        id,
        name,
        user_id
      )
    `)
    .eq('status', 'active')
    .eq('email_sent', false)
    .order('created_at', { ascending: true });

  if (error || !pendingAlerts || pendingAlerts.length === 0) {
    logger.info('No pending alerts to send');
    return [];
  }

  // Group alerts by client
  const groupedMap = new Map<string, GroupedAlert>();

  for (const alert of pendingAlerts) {
    const clientId = alert.client_id;
    const clientData = (alert as any).clients;

    if (!groupedMap.has(clientId)) {
      // Get recipients for this client
      const recipients = await getAlertRecipients(clientId);

      groupedMap.set(clientId, {
        clientId,
        clientName: clientData?.name || 'Unknown Client',
        alerts: [],
        recipients,
      });
    }

    groupedMap.get(clientId)!.alerts.push(alert as Alert);
  }

  return Array.from(groupedMap.values());
}

/**
 * Create HTML email for grouped alerts
 */
function createGroupedAlertsEmail(group: GroupedAlert, dashboardUrl: string): string {
  const { clientName, alerts } = group;

  // Count alerts by severity
  const severityCounts = {
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length,
  };

  // Sort alerts: critical first, then high, medium, low
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder: Record<AlertSeverity, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  // Get most severe alert
  const mostSevere = sortedAlerts[0].severity;
  const emoji = {
    critical: '🚨',
    high: '⚠️',
    medium: '📢',
    low: 'ℹ️',
  }[mostSevere];

  // Generate alert items HTML
  const alertsHTML = sortedAlerts.map(alert => {
    const severityEmoji = {
      critical: '🚨',
      high: '⚠️',
      medium: '📢',
      low: 'ℹ️',
    }[alert.severity];

    const severityColor = {
      critical: '#DC2626',
      high: '#EA580C',
      medium: '#D97706',
      low: '#0891B2',
    }[alert.severity];

    return `
      <div style="background: white; padding: 15px; margin: 10px 0; border-left: 4px solid ${severityColor}; border-radius: 4px;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 20px; margin-right: 10px;">${severityEmoji}</span>
          <strong style="color: #111; font-size: 16px;">${alert.title}</strong>
        </div>
        <p style="color: #666; margin: 5px 0;">${alert.message}</p>
        <p style="color: #999; font-size: 12px; margin: 5px 0;">
          ${new Date(alert.created_at).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    `;
  }).join('');

  // Summary HTML
  const summaryHTML = `
    <div style="display: flex; justify-content: space-around; margin: 20px 0;">
      ${severityCounts.critical > 0 ? `
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #DC2626;">${severityCounts.critical}</div>
          <div style="font-size: 12px; color: #666;">Críticos</div>
        </div>
      ` : ''}
      ${severityCounts.high > 0 ? `
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #EA580C;">${severityCounts.high}</div>
          <div style="font-size: 12px; color: #666;">Altos</div>
        </div>
      ` : ''}
      ${severityCounts.medium > 0 ? `
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #D97706;">${severityCounts.medium}</div>
          <div style="font-size: 12px; color: #666;">Médios</div>
        </div>
      ` : ''}
      ${severityCounts.low > 0 ? `
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #0891B2;">${severityCounts.low}</div>
          <div style="font-size: 12px; color: #666;">Baixos</div>
        </div>
      ` : ''}
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0B0C0E 0%, #1a1b1e 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">${emoji} Alertas de Reputação</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${clientName}</p>
          </div>

          <!-- Summary -->
          <div style="background: #f9fafb; padding: 20px; border-bottom: 1px solid #e5e7eb;">
            <p style="margin: 0 0 10px 0; text-align: center; color: #666;">
              Você tem <strong>${alerts.length}</strong> ${alerts.length === 1 ? 'alerta' : 'alertas'} ${alerts.length === 1 ? 'pendente' : 'pendentes'}
            </p>
            ${summaryHTML}
          </div>

          <!-- Alerts List -->
          <div style="padding: 20px;">
            <h2 style="font-size: 18px; margin: 0 0 15px 0; color: #111;">Detalhes dos Alertas</h2>
            ${alertsHTML}
          </div>

          <!-- Actions -->
          <div style="background: #f9fafb; padding: 20px; text-align: center;">
            <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 30px; background: #00ADE8; color: white; text-decoration: none; border-radius: 6px; margin: 5px; font-weight: 500;">
              Ver Dashboard
            </a>
            <a href="${dashboardUrl}/alerts" style="display: inline-block; padding: 12px 30px; background: #6B7280; color: white; text-decoration: none; border-radius: 6px; margin: 5px; font-weight: 500;">
              Gerenciar Alertas
            </a>
          </div>

          <!-- Footer -->
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 14px; color: #6B7280;">
              <strong>nORM</strong> - Online Reputation Manager
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #9CA3AF;">
              Este é um email automático. Por favor, não responda.
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #9CA3AF;">
              <a href="${dashboardUrl}/settings/notifications" style="color: #00ADE8; text-decoration: none;">
                Gerenciar preferências de notificação
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send grouped alert emails
 * Sends one email per client with all their pending alerts
 */
export async function sendPendingAlerts(): Promise<{
  sent: number;
  failed: number;
  skipped: number;
}> {
  const stats = { sent: 0, failed: 0, skipped: 0 };

  try {
    const groups = await groupPendingAlerts();

    if (groups.length === 0) {
      logger.info('No pending alerts to send');
      return stats;
    }

    logger.info(`Processing ${groups.length} client groups with pending alerts`);

    for (const group of groups) {
      try {
        // Skip if no recipients
        if (group.recipients.length === 0) {
          logger.warn('No recipients for client alerts', { clientId: group.clientId });
          stats.skipped += group.alerts.length;
          continue;
        }

        // Create dashboard URL (adjust based on your domain)
        const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.norm.com';

        // Create email HTML
        const html = createGroupedAlertsEmail(group, dashboardUrl);

        // Determine subject based on severity
        const hasCritical = group.alerts.some(a => a.severity === 'critical');
        const hasHigh = group.alerts.some(a => a.severity === 'high');

        let subjectPrefix = '📢';
        if (hasCritical) subjectPrefix = '🚨';
        else if (hasHigh) subjectPrefix = '⚠️';

        const subject = `${subjectPrefix} ${group.alerts.length} ${group.alerts.length === 1 ? 'Alerta' : 'Alertas'} de Reputação - ${group.clientName}`;

        // Send to all recipients
        const recipientEmails = group.recipients.map(r => r.email);

        await sendEmail({
          to: recipientEmails,
          subject,
          html,
        });

        // Mark alerts as sent
        const supabase = await createClient();
        const alertIds = group.alerts.map(a => a.id);

        const { error: updateError } = await supabase
          .from('alerts')
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString(),
          })
          .in('id', alertIds);

        if (updateError) {
          logger.error('Failed to mark alerts as sent', updateError, {
            alertIds,
            clientId: group.clientId,
          });
        }

        stats.sent += group.alerts.length;
        logger.info('Alert emails sent successfully', {
          clientId: group.clientId,
          alerts: group.alerts.length,
          recipients: recipientEmails.length,
        });
      } catch (error) {
        logger.error('Failed to send alert emails for client', error as Error, {
          clientId: group.clientId,
        });
        stats.failed += group.alerts.length;
      }
    }

    logger.info('Finished sending pending alerts', stats);
    return stats;
  } catch (error) {
    logger.error('Failed to send pending alerts', error as Error);
    throw error;
  }
}

/**
 * Send immediate alert notification (for critical alerts)
 * Bypasses grouping and sends immediately
 */
export async function sendImmediateAlert(alert: Alert): Promise<void> {
  const supabase = await createClient();

  // Get client info
  const { data: client } = await supabase
    .from('clients')
    .select('id, name')
    .eq('id', alert.client_id)
    .single();

  if (!client) {
    logger.warn('Client not found for immediate alert', { alertId: alert.id });
    return;
  }

  // Get recipients
  const recipients = await getAlertRecipients(alert.client_id);

  if (recipients.length === 0) {
    logger.warn('No recipients for immediate alert', { alertId: alert.id });
    return;
  }

  // Create dashboard URL
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.norm.com';

  // Create email as if it's a single-alert group
  const group: GroupedAlert = {
    clientId: client.id,
    clientName: client.name,
    alerts: [alert],
    recipients,
  };

  const html = createGroupedAlertsEmail(group, dashboardUrl);

  const emoji = {
    critical: '🚨',
    high: '⚠️',
    medium: '📢',
    low: 'ℹ️',
  }[alert.severity];

  const subject = `${emoji} URGENTE: ${alert.title} - ${client.name}`;

  // Send email
  await sendEmail({
    to: recipients.map(r => r.email),
    subject,
    html,
  });

  // Mark as sent
  await supabase
    .from('alerts')
    .update({
      email_sent: true,
      email_sent_at: new Date().toISOString(),
    })
    .eq('id', alert.id);

  logger.info('Immediate alert sent', {
    alertId: alert.id,
    clientId: client.id,
    recipients: recipients.length,
  });
}
