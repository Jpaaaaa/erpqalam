/** Shared print CSS — matches hrat/pdf-report.js */
export const REPORT_SHELL_CSS = `
    * { box-sizing: border-box; }
    body { border-top: 8px solid #0F172A; margin: 0; padding: 40px; font-family: 'Tajawal', 'Segoe UI', Tahoma, sans-serif; color: #1E293B; font-size: 13px; line-height: 1.6; background-color: #FFFFFF; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    
    .header { background: #ffffff; padding: 0 0 24px 0; margin: 0 0 32px 0; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #E2E8F0; }
    .header-brand { text-align: right; border-right: 4px solid #EA580C; padding-right: 16px; }
    .header-logo-title { display: flex; align-items: center; gap: 16px; direction: rtl; }
    .header-logo { width: 52px; height: 52px; object-fit: contain; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px; }
    .header .sub { font-size: 14px; color: #64748b; margin-top: 4px; font-weight: 600; }
    .header .meta { text-align: left; font-size: 12px; color: #475569; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .header .meta .report-type { font-weight: 800; color: #0F172A; font-size: 14px; background: #F1F5F9; padding: 4px 12px; border-radius: 4px; border: 1px solid #E2E8F0; }
    
    .title { font-size: 20px; font-weight: 800; color: #0F172A; margin-bottom: 4px; letter-spacing: -0.3px; }
    .period { font-size: 13px; color: #64748b; margin-bottom: 24px; font-weight: 600; }
    
    .stats { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 32px; }
    .stat-card { padding: 16px 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 4px; min-width: 140px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .stat-label { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-size: 24px; font-weight: 800; color: #0F172A; line-height: 1; }
    
    .stat-card.emerald { background: #F0FDF4; border: 1px solid #BBF7D0; }
    .stat-card.emerald .stat-value { color: #166534; }
    .stat-card.amber { background: #FFFBEB; border: 1px solid #FDE68A; }
    .stat-card.amber .stat-value { color: #92400e; }
    .stat-card.blue { background: #F0F9FF; border: 1px solid #BAE6FD; }
    .stat-card.blue .stat-value { color: #0369A1; }
    .stat-card.slate { background: #F8FAFC; border: 1px solid #E2E8F0; }
    .stat-card.red { background: #FEF2F2; border: 1px solid #FECACA; }
    .stat-card.red .stat-value { color: #991b1b; }
    
    .section-heading { font-size: 14px; font-weight: 800; color: #0F172A; margin-bottom: 16px; border-bottom: 2px solid #0F172A; display: inline-block; padding-bottom: 4px; }
    .explain-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 4px; padding: 16px 20px; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
    th { background: #0F172A; color: #FFFFFF; padding: 12px 16px; text-align: right; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #0F172A; }
    td { padding: 12px 16px; text-align: right; border: 1px solid #E2E8F0; color: #334155; font-weight: 600; }
    tr:nth-child(even) td { background: #F8FAFC; }
    
    .row-absent td { background: #FEF2F2 !important; border-color: #FECACA; color: #991b1b; }
    .row-holiday td { background: #F0F9FF !important; border-color: #BAE6FD; color: #0369A1; }
    
    .text-red { color: #DC2626 !important; font-weight: 800; }
    .text-amber { color: #D97706 !important; font-weight: 800; }
    .text-emerald { color: #059669 !important; font-weight: 800; }
    .text-blue { color: #0284C7 !important; font-weight: 800; }
    
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; font-weight: 600; }

    .cover-page { page-break-after: always; }
    .employee-page { page-break-before: always; break-before: page; }
    .employee-page-first { page-break-before: auto; break-before: auto; }
`;
