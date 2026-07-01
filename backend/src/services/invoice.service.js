const PDFDocument = require('pdfkit');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

const generateInvoice = asyncHandler(async (orderId, res, userId) => {
    const parsedOrderId = Number(orderId);

    const order = await prisma.order.findUnique({
        where: { id: parsedOrderId },
        include: { items: true, },
    });

    if(!order || order.userId !== userId) {
        throw new Error("Order not found");
    }

    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; attachment;filename=invoice-${parsedOrderId}.pdf`);

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
})

module.exports = { generateInvoice };