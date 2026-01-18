import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ErgonomicReportData {
  mediaScore: number;
  colaboradoresRiscoAlto: number;
  total: number;
  totalAssessments: number;
}

interface ErgonomicHistoryItem {
  date: string;
  score: number;
}

interface LerHistoryItem {
  date: string;
  risk_level: string;
  symptoms: string[];
}

interface FatigueHistoryItem {
  date: string;
  level: string;
  suggestion?: string;
}

export interface PDFExportData {
  reportData: ErgonomicReportData;
  ergonomicHistory: ErgonomicHistoryItem[];
  lerHistory: LerHistoryItem[];
  fatigueHistory: FatigueHistoryItem[];
  generatedAt: Date;
}

const getLevelColor = (level: string): [number, number, number] => {
  switch (level) {
    case "alto":
    case "ruim":
      return [220, 38, 38]; // red
    case "medio":
    case "media":
      return [234, 179, 8]; // yellow
    case "baixo":
    case "boa":
      return [34, 197, 94]; // green
    default:
      return [100, 100, 100];
  }
};

const translateRiskLevel = (level: string): string => {
  switch (level) {
    case "alto":
      return "Alto";
    case "medio":
      return "Médio";
    case "baixo":
      return "Baixo";
    default:
      return level;
  }
};

const translateFatigueLevel = (level: string): string => {
  switch (level) {
    case "boa":
      return "Bem disposto";
    case "media":
      return "Um pouco cansado";
    case "ruim":
      return "Muito cansado";
    default:
      return level;
  }
};

export const generateErgonomicPDF = (data: PDFExportData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Header
  doc.setFillColor(99, 102, 241); // Indigo
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório Ergonômico", pageWidth / 2, 25, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Gerado em: ${format(data.generatedAt, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`,
    pageWidth / 2,
    38,
    { align: "center" }
  );

  yPosition = 60;

  // Summary Cards
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo Geral", 14, yPosition);
  yPosition += 10;

  const cardWidth = (pageWidth - 38) / 4;
  const cardHeight = 30;
  const startX = 14;

  // Card 1: Score Médio
  doc.setFillColor(237, 233, 254);
  doc.roundedRect(startX, yPosition, cardWidth, cardHeight, 3, 3, "F");
  doc.setFontSize(18);
  doc.setTextColor(99, 102, 241);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.reportData.mediaScore}%`, startX + cardWidth / 2, yPosition + 15, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Score Médio", startX + cardWidth / 2, yPosition + 24, { align: "center" });

  // Card 2: Risco Alto
  const card2X = startX + cardWidth + 3;
  doc.setFillColor(254, 226, 226);
  doc.roundedRect(card2X, yPosition, cardWidth, cardHeight, 3, 3, "F");
  doc.setFontSize(18);
  doc.setTextColor(220, 38, 38);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.reportData.colaboradoresRiscoAlto}`, card2X + cardWidth / 2, yPosition + 15, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Risco Alto LER", card2X + cardWidth / 2, yPosition + 24, { align: "center" });

  // Card 3: Colaboradores
  const card3X = card2X + cardWidth + 3;
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(card3X, yPosition, cardWidth, cardHeight, 3, 3, "F");
  doc.setFontSize(18);
  doc.setTextColor(34, 197, 94);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.reportData.total}`, card3X + cardWidth / 2, yPosition + 15, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Colaboradores", card3X + cardWidth / 2, yPosition + 24, { align: "center" });

  // Card 4: Total Avaliações
  const card4X = card3X + cardWidth + 3;
  doc.setFillColor(219, 234, 254);
  doc.roundedRect(card4X, yPosition, cardWidth, cardHeight, 3, 3, "F");
  doc.setFontSize(18);
  doc.setTextColor(59, 130, 246);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.reportData.totalAssessments}`, card4X + cardWidth / 2, yPosition + 15, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Total Avaliações", card4X + cardWidth / 2, yPosition + 24, { align: "center" });

  yPosition += cardHeight + 15;

  // Ergonomic History Table
  if (data.ergonomicHistory.length > 0) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Histórico de Avaliações Ergonômicas", 14, yPosition);
    yPosition += 5;

    autoTable(doc, {
      startY: yPosition,
      head: [["Data", "Score", "Status"]],
      body: data.ergonomicHistory.slice(0, 10).map((item) => [
        format(new Date(item.date), "dd/MM/yyyy HH:mm", { locale: ptBR }),
        `${item.score}%`,
        item.score >= 80 ? "Excelente" : item.score >= 60 ? "Bom" : item.score >= 40 ? "Regular" : "Precisa Melhorar",
      ]),
      theme: "striped",
      headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [243, 244, 246] },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Check if we need a new page
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }

  // LER History Table
  if (data.lerHistory.length > 0) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Histórico de Avaliações LER", 14, yPosition);
    yPosition += 5;

    autoTable(doc, {
      startY: yPosition,
      head: [["Data", "Nível de Risco", "Sintomas"]],
      body: data.lerHistory.slice(0, 10).map((item) => [
        format(new Date(item.date), "dd/MM/yyyy HH:mm", { locale: ptBR }),
        translateRiskLevel(item.risk_level),
        item.symptoms.length > 0 ? item.symptoms.join(", ") : "Nenhum",
      ]),
      theme: "striped",
      headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [254, 242, 242] },
      styles: { fontSize: 9, cellPadding: 4 },
      didParseCell: function (data) {
        if (data.section === "body" && data.column.index === 1) {
          const level = data.cell.raw as string;
          if (level === "Alto") {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = "bold";
          } else if (level === "Médio") {
            data.cell.styles.textColor = [234, 179, 8];
            data.cell.styles.fontStyle = "bold";
          } else {
            data.cell.styles.textColor = [34, 197, 94];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Check if we need a new page
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }

  // Fatigue History Table
  if (data.fatigueHistory.length > 0) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Histórico de Fadiga Mental", 14, yPosition);
    yPosition += 5;

    autoTable(doc, {
      startY: yPosition,
      head: [["Data", "Nível", "Sugestão"]],
      body: data.fatigueHistory.slice(0, 10).map((item) => [
        format(new Date(item.date), "dd/MM/yyyy HH:mm", { locale: ptBR }),
        translateFatigueLevel(item.level),
        item.suggestion || "-",
      ]),
      theme: "striped",
      headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 243, 255] },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        2: { cellWidth: 80 },
      },
      didParseCell: function (data) {
        if (data.section === "body" && data.column.index === 1) {
          const level = data.cell.raw as string;
          if (level === "Muito cansado") {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = "bold";
          } else if (level === "Um pouco cansado") {
            data.cell.styles.textColor = [234, 179, 8];
            data.cell.styles.fontStyle = "bold";
          } else {
            data.cell.styles.textColor = [34, 197, 94];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `OfficeWell - Relatório Ergonômico | Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Save the PDF
  const fileName = `relatorio-ergonomico-${format(data.generatedAt, "yyyy-MM-dd-HHmm")}.pdf`;
  doc.save(fileName);
};
