export function generateEmailHtml(data: {
  reportType: 'Weekly' | 'Monthly';
  revenueData: any[];
  teacherData: any[];
}) {
  const { reportType, revenueData, teacherData } = data;
  
  // Calculate total revenue and bookings from data
  const totalRevenue = revenueData.reduce((acc, row) => acc + row.total_revenue, 0);
  const totalBookings = teacherData.reduce((acc, row) => acc + row.total_bookings, 0);

  const bodyStyle = 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #ffffff;';
  const containerStyle = 'max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;';
  const headerStyle = 'background: #000000; color: #ffffff; padding: 30px 20px; text-align: center; border-radius: 6px 6px 0 0;';
  const h1Style = 'margin: 0; font-size: 28px; letter-spacing: 1px; color: #ffffff;';
  const headerSubStyle = 'color: #888888; font-size: 14px; margin-top: 5px; display: block;';
  const statTableStyle = 'width: 100%; border-collapse: separate; border-spacing: 10px 0; margin: 30px 0;';
  const statCardStyle = 'background: #f9f9f9; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #f0f0f0;';
  const statValueStyle = 'font-size: 24px; font-weight: bold; color: #000000; margin-bottom: 5px;';
  const statLabelStyle = 'font-size: 14px; color: #666666;';
  const sectionTitleStyle = 'border-left: 4px solid #000000; padding-left: 10px; margin: 40px 0 20px; font-size: 18px; font-weight: bold; text-align: left;';
  const tableStyle = 'width: 100%; border-collapse: collapse; margin: 20px 0;';
  const thStyle = 'text-align: left; padding: 15px; border-bottom: 1px solid #eeeeee; background: #fafafa; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #888888;';
  const tdStyle = 'text-align: left; padding: 15px; border-bottom: 1px solid #eeeeee; font-size: 15px;';
  const bilingualStyle = 'font-size: 12px; color: #999999; display: block; margin-top: 2px; font-weight: normal;';
  const footerStyle = 'text-align: center; margin-top: 40px; font-size: 12px; color: #bbbbbb; border-top: 1px solid #eeeeee; padding-top: 20px;';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportType} Performance Report</title>
</head>
<body style="${bodyStyle}">
  <table width="600" align="center" cellpadding="0" cellspacing="0" style="${containerStyle}">
    <tr>
      <td>
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0" style="${headerStyle}">
          <tr>
            <td>
              <h1 style="${h1Style}">${reportType} Performance Report</h1>
              <span style="${headerSubStyle}">${reportType === 'Weekly' ? '周报' : '月报'} 表现报告</span>
            </td>
          </tr>
        </table>
        
        <!-- Stats Grid -->
        <table style="${statTableStyle}">
          <tr>
            <td width="50%" align="center">
              <div style="${statCardStyle}">
                <div style="${statValueStyle}">¥${totalRevenue.toLocaleString()}</div>
                <div style="${statLabelStyle}">Total Revenue <span style="${bilingualStyle}">总收入</span></div>
              </div>
            </td>
            <td width="50%" align="center">
              <div style="${statCardStyle}">
                <div style="${statValueStyle}">${totalBookings}</div>
                <div style="${statLabelStyle}">Total Bookings <span style="${bilingualStyle}">总预订量</span></div>
              </div>
            </td>
          </tr>
        </table>

        <!-- Section Title -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="${sectionTitleStyle}">
              Teacher Performance <span style="${bilingualStyle}">老师表现</span>
            </td>
          </tr>
        </table>

        <!-- Performance Table -->
        <table style="${tableStyle}">
          <thead>
            <tr>
              <th style="${thStyle}">Teacher <span style="${bilingualStyle}">老师</span></th>
              <th style="${thStyle}">Bookings <span style="${bilingualStyle}">预订</span></th>
              <th style="${thStyle}">Fill Rate <span style="${bilingualStyle}">上座率</span></th>
            </tr>
          </thead>
          <tbody>
            ${teacherData.map(t => `
              <tr>
                <td style="${tdStyle} font-weight: 500;">${t.teacher_name}</td>
                <td style="${tdStyle}">${t.total_bookings}</td>
                <td style="${tdStyle}"><span style="color: ${t.avg_fill_rate >= 80 ? '#22c55e' : t.avg_fill_rate >= 50 ? '#f59e0b' : '#ef4444'}">${t.avg_fill_rate.toFixed(1)}%</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="${footerStyle}">
          <tr>
            <td>
              Generated by Dance Studio Management System<br>
              © ${new Date().getFullYear()} Dance Studio
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
