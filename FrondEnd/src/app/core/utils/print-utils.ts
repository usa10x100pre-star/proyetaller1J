export function imprimirTablaDesdeId(tableId: string, titulo: string): void {
  const tabla = document.getElementById(tableId);

  if (!tabla) {
    window.print();
    return;
  }

  const ventana = window.open('', '_blank', 'width=1000,height=800');
  if (!ventana) {
    return;
  }

  const estilos = `
    <style>
      body { font-family: 'Times New Roman', serif; padding: 16px; color: #0f172a; }
      h1 { text-align: center; margin-bottom: 16px; color: #1e3a8a; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #1e3a8a; padding: 8px; text-align: left; }
      th { background: #1e3a8a; color: white; }
      tr:nth-child(even) { background: #f8fafc; }
      img { max-width: 80px; height: auto; border-radius: 8px; }
    </style>
  `;

  ventana.document.write(`
    <html>
      <head>${estilos}</head>
      <body>
        <h1>${titulo}</h1>
        ${tabla.outerHTML}
      </body>
    </html>
  `);

  ventana.document.close();
  ventana.focus();
  ventana.print();
  ventana.close();
}