// PDF Export Service
// Install: npm install jspdf html2canvas

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const NGO_HEADER_IMAGE = '/NGO_Header.png';
const NGO_NAME = 'AHINSA MAHILA BAL KALYAN SWASTHYA SHIKSHA PRASAR SAMITI';
const NGO_ADDRESS_LINE_1 = 'Navjeevan Aadarshiya Drop-in Center (ODIC), Shiv Nagar, Govind Bagh ke piche,';
const NGO_ADDRESS_LINE_2 = 'Thatipur, Gwalior - 474011 Madhya Pradesh';

const getDisplayValue = (value: unknown, fallback = 'N/A') => {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text && text !== 'undefined' && text !== 'null' ? text : fallback;
};

const formatPdfDate = (value: unknown) => {
  const text = getDisplayValue(value, '');
  if (!text) return 'N/A';

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? text : date.toLocaleDateString();
};

const getPersonName = (value: any, fallback = 'N/A') => {
  if (typeof value === 'object' && value !== null) {
    return getDisplayValue(value.fullName || value.name || value.patientName, fallback);
  }

  return getDisplayValue(value, fallback);
};

const loadImageAsDataUrl = async (src: string) => {
  const response = await fetch(src);
  if (!response.ok) throw new Error(`Unable to load image: ${src}`);

  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const drawFallbackNgoHeader = (pdf: jsPDF, pageWidth: number) => {
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(31, 20, 168);
  pdf.text(NGO_NAME, pageWidth / 2, 28, { align: 'center' });

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(20, 20, 20);
  pdf.text(NGO_ADDRESS_LINE_1, pageWidth / 2, 36, { align: 'center' });
  pdf.text(NGO_ADDRESS_LINE_2, pageWidth / 2, 42, { align: 'center' });
};

/**
 * Generate PDF from HTML element
 */
export const generatePdfFromElement = async (elementId: string, filename: string) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found');

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Export Patient Discharge Report to PDF
 */
export const exportDischargeReport = async (
  patientName: string,
  admissionDate: string,
  dischargeDate: string,
  recoveryDays: number,
  finalNotes: string,
  recommendations: string,
  doctorName = 'Doctor Name',
) => {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 16;

    try {
      const headerImage = await loadImageAsDataUrl(NGO_HEADER_IMAGE);
      pdf.addImage(headerImage, 'PNG', 8, yPosition, pageWidth - 16, 46);
    } catch (error) {
      console.warn('NGO header image unavailable, drawing text header instead:', error);
      drawFallbackNgoHeader(pdf, pageWidth);
    }

    // Header
    yPosition = 74;
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(20);
    pdf.text('Discharge Report', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth - 20, yPosition, { align: 'right' });

    yPosition += 20;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Patient Information', 20, yPosition);
    yPosition += 8;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const displayPatientName = getDisplayValue(patientName, 'Patient Name');
    pdf.text(`Name: ${displayPatientName}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Admission Date: ${formatPdfDate(admissionDate)}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Discharge Date: ${formatPdfDate(dischargeDate)}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Recovery Duration: ${getDisplayValue(recoveryDays, '0')} days`, 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Final Notes', 20, yPosition);
    yPosition += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const finalNotesLines = pdf.splitTextToSize(getDisplayValue(finalNotes, 'No final notes'), pageWidth - 40);
    pdf.text(finalNotesLines, 20, yPosition);
    yPosition += finalNotesLines.length * 5 + 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recommendations', 20, yPosition);
    yPosition += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const recommendationLines = pdf.splitTextToSize(getDisplayValue(recommendations, 'No recommendations'), pageWidth - 40);
    pdf.text(recommendationLines, 20, yPosition);

    // Signature section
    const signatureY = pageHeight - 46;
    pdf.setDrawColor(0, 0, 0);
    pdf.line(20, signatureY, 78, signatureY);
    pdf.line(pageWidth - 78, signatureY, pageWidth - 20, signatureY);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Head of NGO', 20, signatureY + 7);
    pdf.text(getDisplayValue(doctorName, 'Doctor Name'), pageWidth - 20, signatureY + 7, { align: 'right' });
    pdf.setFont('helvetica', 'normal');
    pdf.text('Signature', 20, signatureY + 13);
    pdf.text('Doctor Signature', pageWidth - 20, signatureY + 13, { align: 'right' });

    // Footer
    pdf.setFontSize(8);
    pdf.text(
      'This is an official discharge document from the Rehabilitation Center Management System',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' },
    );

    pdf.save(`discharge_${displayPatientName}_${new Date().getTime()}.pdf`);
  } catch (error) {
    console.error('Error generating discharge report:', error);
    throw error;
  }
};

/**
 * Export Treatment Plan to PDF
 */
export const exportTreatmentPlan = async (
  patientName: string,
  planType: string,
  startDate: string,
  goals: string[],
  activities: string[],
  medicines: string[],
) => {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    pdf.setFontSize(18);
    pdf.text('Treatment Plan', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;
    pdf.setFontSize(10);
    pdf.text(`Patient: ${patientName}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Plan Type: ${planType}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Start Date: ${startDate}`, 20, yPosition);
    yPosition += 15;

    // Goals
    pdf.setFontSize(12);
    pdf.text('Goals', 20, yPosition);
    yPosition += 8;
    pdf.setFontSize(10);
    goals.forEach((goal) => {
      pdf.text(`• ${goal}`, 25, yPosition);
      yPosition += 5;
    });
    yPosition += 5;

    // Activities
    pdf.setFontSize(12);
    pdf.text('Activities', 20, yPosition);
    yPosition += 8;
    pdf.setFontSize(10);
    activities.forEach((activity) => {
      pdf.text(`• ${activity}`, 25, yPosition);
      yPosition += 5;
    });
    yPosition += 5;

    // Medicines
    pdf.setFontSize(12);
    pdf.text('Prescribed Medicines', 20, yPosition);
    yPosition += 8;
    pdf.setFontSize(10);
    medicines.forEach((medicine) => {
      pdf.text(`• ${medicine}`, 25, yPosition);
      yPosition += 5;
    });

    pdf.save(`treatment_plan_${patientName}_${new Date().getTime()}.pdf`);
  } catch (error) {
    console.error('Error generating treatment plan:', error);
    throw error;
  }
};

/**
 * Export Monthly Statistics Report
 */
export const exportMonthlyReport = async (
  month: string,
  totalPatients: number,
  newAdmissions: number,
  discharges: number,
  recoveryRate: string,
) => {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    pdf.setFontSize(18);
    pdf.text(`Monthly Report - ${month}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Statistics
    pdf.setFontSize(12);
    pdf.text('Statistics', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(11);
    pdf.text(`Total Patients: ${totalPatients}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`New Admissions: ${newAdmissions}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Discharges: ${discharges}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Recovery Rate: ${recoveryRate}`, 20, yPosition);

    pdf.save(`monthly_report_${month}.pdf`);
  } catch (error) {
    console.error('Error generating monthly report:', error);
    throw error;
  }
};

/**
 * Export table data to CSV then to PDF
 */
export const exportTableToPdf = async (
  tableId: string,
  filename: string,
  title: string,
) => {
  try {
    const table = document.getElementById(tableId);
    if (!table) throw new Error('Table not found');

    const canvas = await html2canvas(table);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4'); // landscape

    pdf.setFontSize(16);
    pdf.text(title, pdf.internal.pageSize.getWidth() / 2, 15, {
      align: 'center',
    });

    const imgWidth = 280;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 25, imgWidth, imgHeight);

    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting table to PDF:', error);
    throw error;
  }
};

/**
 * Generate Discharge Report from discharge data object
 */
export const generateDischargeReport = async (discharge: any) => {
  const patientName = discharge.patientName || getPersonName(discharge.patient, 'Patient Name');
  const doctorName = getPersonName(discharge.doctorName || discharge.doctor || discharge.dischargedBy, 'Doctor Name');
  const recommendations =
    discharge.recommendations ||
    discharge.recommendedFollowUp ||
    discharge.afterCareInstructions ||
    discharge.dischargeSummary ||
    'No recommendations';

  return exportDischargeReport(
    patientName,
    discharge.admissionDate,
    discharge.dischargeDate,
    discharge.recoveryDays,
    discharge.finalNotes || 'No final notes',
    recommendations,
    doctorName
  );
};

const exportBrandedTreatmentPlan = async (
  patientName: string,
  planType: string,
  startDate: string,
  goals: string[],
  activities: string[],
  medicines: Array<string | any>,
) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = 16;

  try {
    const headerImage = await loadImageAsDataUrl(NGO_HEADER_IMAGE);
    pdf.addImage(headerImage, 'PNG', 8, yPosition, pageWidth - 16, 46);
  } catch (error) {
    console.warn('NGO header image unavailable, drawing text header instead:', error);
    drawFallbackNgoHeader(pdf, pageWidth);
  }

  yPosition = 74;
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(18);
  pdf.text('Treatment Plan', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const displayPatientName = getDisplayValue(patientName, 'Patient Name');
  pdf.text(`Patient: ${displayPatientName}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Plan Type: ${getDisplayValue(planType)}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Start Date: ${formatPdfDate(startDate)}`, 20, yPosition);
  yPosition += 15;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Goals', 20, yPosition);
  yPosition += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  goals.forEach((goal) => {
    pdf.text(`- ${goal}`, 25, yPosition);
    yPosition += 5;
  });
  yPosition += 5;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Activities', 20, yPosition);
  yPosition += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  activities.forEach((activity) => {
    pdf.text(`- ${activity}`, 25, yPosition);
    yPosition += 5;
  });
  yPosition += 5;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Prescribed Medicines', 20, yPosition);
  yPosition += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  medicines.forEach((medicine) => {
    const medicineName = getDisplayValue(
      medicine?.medicineName ||
        medicine?.name ||
        medicine?.medicineId?.name ||
        medicine?.medicineId ||
        medicine,
      'Medicine',
    );
    const medicineMeta = [
      medicine?.dosage ? `Dosage: ${medicine.dosage}` : '',
      medicine?.frequency ? `Frequency: ${medicine.frequency}` : '',
    ].filter(Boolean).join(', ');
    const medicineText = medicineMeta ? `${medicineName} (${medicineMeta})` : medicineName;
    const medicineLines = pdf.splitTextToSize(`- ${medicineText}`, pageWidth - 45);
    pdf.text(medicineLines, 25, yPosition);
    yPosition += medicineLines.length * 5;
  });

  pdf.save(`treatment_plan_${displayPatientName}_${new Date().getTime()}.pdf`);
};

/**
 * Generate Treatment Plan PDF from plan data object
 */
export const generateTreatmentPlan = async (plan: any) => {
  return exportBrandedTreatmentPlan(
    plan.patientName,
    plan.planType,
    plan.startDate,
    plan.goals || [],
    plan.activities?.map((a: any) => a.activity) || [],
    plan.medicines || []
  );
};

/**
 * Export Attendance Report for selected month
 */
export const exportAttendanceReport = async (attendances: any[], month: string) => {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    pdf.setFontSize(18);
    pdf.text(`Attendance Report - ${month}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Summary
    const present = attendances.filter(a => a.status === 'present').length;
    const absent = attendances.filter(a => a.status === 'absent').length;
    const leave = attendances.filter(a => a.status === 'leave').length;

    pdf.setFontSize(12);
    pdf.text('Summary', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.text(`Total Records: ${attendances.length}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Present: ${present}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Absent: ${absent}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`On Leave: ${leave}`, 20, yPosition);
    yPosition += 20;

    // Table Header
    pdf.setFontSize(10);
    pdf.text('Date', 20, yPosition);
    pdf.text('Staff', 60, yPosition);
    pdf.text('Status', 120, yPosition);
    pdf.text('Time In', 160, yPosition);
    pdf.text('Time Out', 190, yPosition);
    yPosition += 5;
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 5;

    // Table Data
    attendances.forEach((attendance) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(new Date(attendance.date).toLocaleDateString(), 20, yPosition);
      pdf.text(attendance.staffName || 'Unknown', 60, yPosition);
      pdf.text(attendance.status, 120, yPosition);
      pdf.text(attendance.timeIn || '-', 160, yPosition);
      pdf.text(attendance.timeOut || '-', 190, yPosition);
      yPosition += 5;
    });

    pdf.save(`attendance_report_${month}.pdf`);
  } catch (error) {
    console.error('Error generating attendance report:', error);
    throw error;
  }
};
