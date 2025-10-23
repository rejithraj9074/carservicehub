import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate a professional invoice PDF for a transaction
 * @param {Object} transaction - The transaction data
 * @param {Object} user - The user data
 * @returns {jsPDF} - The generated PDF document
 */
export const generateInvoicePDF = (transaction, user) => {
  try {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set font styles
    doc.setFont('helvetica');
    
    // Check if this is a car wash booking (declared early to avoid reference error)
    const isCarWash = transaction.serviceType && !transaction.items;
    
    // Add company header
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('CARVOHUB', 20, 20);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Automotive Services & Accessories', 20, 28);
    doc.text('Email: info@carvohub.com', 20, 34);
    doc.text('Phone: +91 9876543210', 20, 40);
    
    // Add service type indicator at the top
    if (isCarWash) {
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('CAR WASH SERVICE INVOICE', 140, 35);
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
    }
    
    // Add invoice title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    const invoiceTitleY = isCarWash ? 50 : 20;
    doc.text('INVOICE', 160, invoiceTitleY);
    
    // Add invoice details
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const invoiceY = isCarWash ? 70 : 60;
    
    // Handle car wash bookings differently
    doc.text(`Invoice #: ${transaction.orderNumber || 'N/A'}`, 140, invoiceY);
    doc.text(`Date: ${new Date(transaction.createdAt || new Date()).toLocaleDateString('en-IN')}`, 140, invoiceY + 6);
    doc.text(`Payment ID: ${transaction._id || transaction.paymentId || 'N/A'}`, 140, invoiceY + 12);
    
    // Add billing information
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    const billToY = isCarWash ? invoiceY + 10 : invoiceY;
    doc.text('Bill To:', 20, billToY);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(user?.name || 'Customer', 20, billToY + 6);
    doc.text(user?.email || 'customer@example.com', 20, billToY + 12);
    
    if (transaction.shippingAddress) {
      const address = transaction.shippingAddress;
      doc.text(`${address.street || ''}`, 20, billToY + 18);
      doc.text(`${address.city || ''}, ${address.state || ''} ${address.zipCode || ''}`, 20, billToY + 24);
      doc.text(address.country || '', 20, billToY + 30);
    } else if (isCarWash) {
      // For car wash, show service details instead of shipping address
      doc.text('Service Details:', 20, billToY + 18);
      doc.text(`Car Model: ${transaction.carDetails?.model || 'N/A'}`, 20, billToY + 24);
      doc.text(`Plate Number: ${transaction.carDetails?.plateNumber || 'N/A'}`, 20, billToY + 30);
    }
    
    // Add items table or service description
    let finalY = isCarWash ? invoiceY + 70 : invoiceY + 40;
    
    if (isCarWash) {
      // For car wash bookings, show service details
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Service Details:', 20, invoiceY + 40);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Service Type: ${transaction.serviceType || 'N/A'}`, 20, invoiceY + 48);
      doc.text(`Car Model: ${transaction.carDetails?.model || 'N/A'}`, 20, invoiceY + 54);
      doc.text(`Plate Number: ${transaction.carDetails?.plateNumber || 'N/A'}`, 20, invoiceY + 60);
      doc.text(`Date: ${transaction.date ? new Date(transaction.date).toLocaleDateString('en-IN') : 'N/A'} ${transaction.timeSlot || ''}`, 20, invoiceY + 66);
      doc.text(`Location: ${transaction.location || 'N/A'}`, 20, invoiceY + 72);
      doc.text(`Amount: ₹${(transaction.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, invoiceY + 78);
      
      finalY = invoiceY + 84;
    } else {
      // For accessory orders, show items table
      const items = (transaction.items || []).map(item => [
        item.accessory?.name || item.name || 'Accessory',
        item.quantity || 1,
        `₹${(item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `₹${((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]);
      
      // Check if we have items to display
      if (items.length > 0) {
        // Use the autoTable function directly
        autoTable(doc, {
          startY: invoiceY + 40,
          head: [['Item', 'Quantity', 'Unit Price', 'Total']],
          body: items,
          theme: 'grid',
          headStyles: {
            fillColor: [59, 130, 246], // Blue color
            textColor: [255, 255, 255], // White text
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 10
          },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 30, halign: 'right' },
            3: { cellWidth: 30, halign: 'right' }
          }
        });
        finalY = doc.lastAutoTable.finalY + 10;
      } else {
        // If no items, show a message
        doc.setFontSize(12);
        doc.text('No items found for this order', 20, invoiceY + 40);
        finalY = invoiceY + 50;
      }
    }
    
    // Add totals
    const totalsY = isCarWash ? finalY + 10 : finalY;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Total Amount:', 140, totalsY);
    doc.text(`₹${(transaction.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 180, totalsY);
    
    // Add payment status
    const paymentY = isCarWash ? totalsY + 10 : finalY + 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Payment Status: ${transaction.paymentStatus || 'N/A'}`, 140, paymentY);
    doc.text(`Payment Method: ${transaction.paymentMethod || 'N/A'}`, 140, paymentY + 6);
    
    // Add service type for car wash bookings
    if (isCarWash) {
      doc.text(`Service Type: ${transaction.serviceType || 'N/A'}`, 140, paymentY + 12);
      doc.text(`Managed in: Car Wash Management Section`, 140, paymentY + 18);
    }
    
    // Add service type indicator
    if (isCarWash) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Service Type: Car Wash Booking', 20, finalY + 30);
      doc.text('Managed in: Car Wash Management Section', 20, finalY + 36);
      doc.text('Payment Status: Paid (Processed via Razorpay)', 20, finalY + 42);
    }
    
    // Add footer
    const footerY = isCarWash ? paymentY + 24 : finalY + 42;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Thank you for your business!', 20, footerY);
    doc.text('This is a computer generated invoice', 20, footerY + 6);
    
    return doc;
  } catch (error) {
    console.error('Error in generateInvoicePDF:', error);
    throw new Error('Failed to generate invoice: ' + error.message);
  }
};

/**
 * Download invoice as PDF
 * @param {Object} transaction - The transaction data
 * @param {Object} user - The user data
 */
export const downloadInvoice = (transaction, user) => {
  try {
    const doc = generateInvoicePDF(transaction, user);
    const filename = `invoice-${transaction.orderNumber || transaction._id || 'transaction'}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error('Error in downloadInvoice:', error);
    throw new Error('Failed to generate invoice PDF: ' + error.message);
  }
};

export default { generateInvoicePDF, downloadInvoice };