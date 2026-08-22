import { NextResponse, type NextRequest } from "next/server";
import { getServerUser } from "@/shared/lib/auth/client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import path from "path";
import fs from "fs";
import sharp from "sharp";

const RUST_BACKEND = process.env.CORE_ENGINE_URL || "http://localhost:4001";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    // Fetch order details from backend
    const cookieHeader = request.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/kodedock_token=([^;]+)/);
    const token = tokenMatch?.[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backendRes = await fetch(`${RUST_BACKEND}/api/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!backendRes.ok) {
      return NextResponse.json({ error: "Order not found" }, { status: backendRes.status });
    }

    const resJson = await backendRes.json();
    const order = resJson.data;

    // Make sure buyer owns the order or user is the seller
    if (order.buyer_id !== user.id && order.seller_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Convert SVG Logo to PNG Buffer using Sharp
    let logoBase64 = "";
    try {
      const logoPath = path.join(process.cwd(), "public", "icons", "logo", "full-logo.svg");
      const pngBuffer = await sharp(logoPath).resize(1066).png().toBuffer();
      logoBase64 = `data:image/png;base64,${pngBuffer.toString("base64")}`;
    } catch (e) {
      console.warn("Failed to load full logo for PDF", e);
    }

    // Convert Icon to Watermark PNG Buffer using Sharp
    let watermarkBase64 = "";
    try {
      const iconPath = path.join(process.cwd(), "src", "app", "icon.svg");
      let iconSvg = fs.readFileSync(iconPath, "utf-8");
      // Add heavy transparency to the SVG root to act as a watermark
      iconSvg = iconSvg.replace("<svg ", '<svg opacity="0.06" ');
      const pngBuffer = await sharp(Buffer.from(iconSvg)).resize(800).png().toBuffer();
      watermarkBase64 = `data:image/png;base64,${pngBuffer.toString("base64")}`;
    } catch (e) {
      console.warn("Failed to load watermark icon for PDF", e);
    }

    // Generate Professional PDF
    const doc = new jsPDF();
    const primaryColor = [132, 44, 249]; // #842CF9
    const darkGray = [40, 40, 40];
    const lightGray = [120, 120, 120];

    // --- Watermark ---
    if (watermarkBase64) {
      // Icon viewBox is 153x105 (Ratio 1.457)
      // Center on A4 (210x297)
      const wWidth = 140;
      const wHeight = wWidth / 1.457;
      const x = (210 - wWidth) / 2;
      const y = (297 - wHeight) / 2;
      doc.addImage(watermarkBase64, "PNG", x, y, wWidth, wHeight);
    }

    // --- Header Section ---
    if (logoBase64) {
      // Original viewBox 1066x146 -> Ratio 7.30
      // Fixed height 11mm -> Width 80.3mm to perfectly preserve aspect ratio
      doc.addImage(logoBase64, "PNG", 14, 15, 80.3, 11);
    } else {
      doc.setFontSize(24);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text("KODEDOCK", 14, 24);
    }

    doc.setFontSize(26);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 145, 24);
    
    doc.setFontSize(10);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice No: INV-${order.id.substring(0, 8).toUpperCase()}`, 145, 30);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, 145, 35);
    
    // Status Badge background
    const isCompleted = order.status === 'completed';
    doc.setFillColor(isCompleted ? 230 : 255, isCompleted ? 245 : 240, isCompleted ? 235 : 240);
    doc.roundedRect(145, 38, 45, 7, 1.5, 1.5, "F");
    doc.setTextColor(isCompleted ? 30 : 100, isCompleted ? 130 : 100, isCompleted ? 50 : 100);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(order.status.toUpperCase(), 167.5, 43, { align: "center" });

    // Divider
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(14, 52, 196, 52);

    // --- Billing Details Section ---
    doc.setFontSize(10);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text("Billed To:", 14, 62);
    doc.text("Sold By:", 120, 62);

    doc.setFontSize(12);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont("helvetica", "bold");
    doc.text(user.full_name || "Buyer", 14, 68);
    doc.text(order.seller?.full_name || "KodeDock Seller", 120, 68);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(user.email, 14, 73);
    doc.text("Digital Code Assets", 120, 73);

    // --- Items Table ---
    const tableData = [
      [
        order.product?.title || "Digital Product Software",
        "Source Code Delivery",
        `Rs. ${(order.amount_paise / 100).toFixed(2)}`,
        `Rs. ${(order.amount_paise / 100).toFixed(2)}`
      ]
    ];

    autoTable(doc, {
      startY: 85,
      head: [['Product Description', 'Type', 'Price', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor, 
        textColor: 255,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        textColor: [50, 50, 50],
        fontSize: 10
      },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 }
    });

    // --- Total Calculation Section ---
    // @ts-ignore
    const finalY = doc.lastAutoTable?.finalY || 110;
    
    // Background for total
    doc.setFillColor(248, 249, 250);
    doc.rect(130, finalY + 10, 66, 25, "F");
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal", 135, finalY + 18);
    doc.text(`Rs. ${(order.amount_paise / 100).toFixed(2)}`, 190, finalY + 18, { align: "right" });
    
    doc.setFontSize(13);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("Total Paid", 135, finalY + 28);
    doc.text(`Rs. ${(order.amount_paise / 100).toFixed(2)}`, 190, finalY + 28, { align: "right" });

    // --- Footer Section ---
    const pageHeight = doc.internal.pageSize.height;
    
    // Footer Divider
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(1);
    doc.line(14, pageHeight - 30, 196, pageHeight - 30);
    
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text("Thank you for your business!", 105, pageHeight - 20, { align: "center" });

    doc.setFontSize(9);
    doc.setTextColor(130, 130, 130);
    doc.setFont("helvetica", "normal");
    doc.text("This is a computer generated invoice and does not require a physical signature.", 105, pageHeight - 15, { align: "center" });
    doc.text("For support, contact support@kodedock.com | www.kodedock.com", 105, pageHeight - 10, { align: "center" });

    // Output as array buffer
    const pdfBuffer = doc.output('arraybuffer');

    // Return as PDF Response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-KodeDock-${order.id.substring(0, 8).toUpperCase()}.pdf"`,
      },
    });

  } catch (err) {
    console.error("PDF Generation Error:", err);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
