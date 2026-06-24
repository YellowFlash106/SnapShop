const PDFDocument = require('pdfkit');
const prisma = require('../config/prisma');

const generateInvoice = async (req, res) => {
    const orderId = Number(req.params.id);

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true, },
    });

    if(!order || order.userId !== req.user.id) {
        throw new Error("Order not found");
    }

    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; attachment;filename=invoice-${orderId}.pdf`);

    doc.pipe(res);

    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();

    doc.text(`Order ID: ${order.id}`);
    doc.text(`User ID: ${order.userId}`);
    doc.text(`Total Amount: $${order.totalAmount}`);
    doc.text(`Status: ${order.status}`);

    doc.moveDown();
    doc.text("Items:");

    order.items.forEach((item, i) => {
     doc.text(
       `${i + 1}. Product ID: ${item.productId} | Qty: ${item.quantity} |  Price: ₹${item.price}`
     );
    });

    doc.end();
}

module.exports = { generateInvoice };