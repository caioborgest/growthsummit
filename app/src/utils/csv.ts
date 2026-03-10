export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;

  const header = Object.keys(data[0]);
  const rows = data.map(row => 
    header.map(fieldName => {
      const value = row[fieldName];
      // Escape quotes and wrap in quotes
      return `"${String(value ?? "").replace(/"/g, '""')}"`;
    }).join(';')
  );

  const csvContent = [
    header.join(';'),
    ...rows
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
