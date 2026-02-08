// emails.js - Low Stock Email Alert Service for ScaleVest
// Place this file in your API folder

const nodemailer = require('nodemailer');

// ===== EMAIL CONFIGURATION =====
// UPDATE THESE WITH YOUR SMTP DETAILS
const EMAIL_CONFIG = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'your-email@gmail.com', // Your email address
        pass: 'your-app-password'      // Gmail App Password (not regular password)
    }
};

// Create reusable transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// ===== SEND LOW STOCK ALERT EMAIL =====
async function sendLowStockAlert(recipientEmail, productData) {
    const {
        productName,
        currentStock,
        threshold = 5,
        businessName = 'Your Business',
        unit = 'units'
    } = productData;

    // Email HTML template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: 'Arial', sans-serif; 
            background-color: #f8fafc; 
            margin: 0; 
            padding: 0; 
        }
        .container { 
            max-width: 600px; 
            margin: 40px auto; 
            background: white; 
            border-radius: 16px; 
            overflow: hidden; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
        }
        .header { 
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
            padding: 30px; 
            text-align: center; 
            color: white; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 24px; 
        }
        .header p { 
            margin: 10px 0 0 0; 
            opacity: 0.9; 
            font-size: 14px; 
        }
        .content { 
            padding: 30px; 
        }
        .alert-box { 
            background: #fef2f2; 
            border-left: 4px solid #ef4444; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
        }
        .product-name { 
            font-size: 22px; 
            font-weight: bold; 
            color: #dc2626; 
            margin-bottom: 10px; 
        }
        .stock-info { 
            background: #f8fafc; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 15px 0; 
        }
        .stock-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0; 
            border-bottom: 1px solid #e2e8f0; 
        }
        .stock-row:last-child { 
            border-bottom: none; 
        }
        .label { 
            color: #64748b; 
            font-weight: 600; 
        }
        .value { 
            color: #1e293b; 
            font-weight: bold; 
        }
        .critical { 
            color: #ef4444; 
            font-size: 18px; 
        }
        .action-btn { 
            display: inline-block; 
            background: #7c3aed; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            margin-top: 20px; 
            font-weight: bold; 
        }
        .recommendations { 
            background: #f0fdf4; 
            border-left: 4px solid #10b981; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0; 
        }
        .recommendations h3 { 
            margin: 0 0 10px 0; 
            color: #059669; 
            font-size: 16px; 
        }
        .recommendations ul { 
            margin: 0; 
            padding-left: 20px; 
            color: #475569; 
        }
        .recommendations li { 
            margin: 8px 0; 
            line-height: 1.5; 
        }
        .footer { 
            background: #f8fafc; 
            padding: 20px; 
            text-align: center; 
            color: #64748b; 
            font-size: 12px; 
        }
        .warning-icon { 
            font-size: 48px; 
            margin-bottom: 10px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="warning-icon">⚠️</div>
            <h1>Low Stock Alert</h1>
            <p>AI CFO Automated Warning System</p>
        </div>
        
        <div class="content">
            <div class="alert-box">
                <div class="product-name">🔔 ${productName}</div>
                <p style="margin: 5px 0 0 0; color: #64748b;">
                    This product is running low and needs immediate attention!
                </p>
            </div>
            
            <div class="stock-info">
                <div class="stock-row">
                    <span class="label">Business:</span>
                    <span class="value">${businessName}</span>
                </div>
                <div class="stock-row">
                    <span class="label">Product Name:</span>
                    <span class="value">${productName}</span>
                </div>
                <div class="stock-row">
                    <span class="label">Current Stock:</span>
                    <span class="value critical">${currentStock} ${unit}</span>
                </div>
                <div class="stock-row">
                    <span class="label">Alert Threshold:</span>
                    <span class="value">${threshold} ${unit}</span>
                </div>
                <div class="stock-row">
                    <span class="label">Status:</span>
                    <span class="value" style="color: #ef4444;">⚠️ CRITICAL</span>
                </div>
            </div>
            
            <div class="recommendations">
                <h3>📋 Recommended Actions:</h3>
                <ul>
                    <li>Contact your supplier immediately to place a restock order</li>
                    <li>Check if you have any pending deliveries for this product</li>
                    <li>Update inventory levels in ScaleVest dashboard</li>
                    <li>Consider increasing minimum stock threshold to avoid future stockouts</li>
                    <li>Review sales data to understand consumption rate</li>
                </ul>
            </div>
            
            <center>
                <a href="https://your-domain.com/inventory.html" class="action-btn">
                    Manage Inventory Now →
                </a>
            </center>
        </div>
        
        <div class="footer">
            <p>
                <strong>This is an automated alert from ScaleVest AI CFO</strong><br>
                You're receiving this because stock levels have fallen below the critical threshold.<br>
                © 2026 ScaleVest Business Hub | Powered by AI
            </p>
        </div>
    </div>
</body>
</html>
    `;

    // Plain text version (fallback)
    const textContent = `
LOW STOCK ALERT - ScaleVest AI CFO

⚠️ WARNING: Product stock is critically low!

Business: ${businessName}
Product: ${productName}
Current Stock: ${currentStock} ${unit}
Alert Threshold: ${threshold} ${unit}
Status: CRITICAL

RECOMMENDED ACTIONS:
• Contact your supplier immediately
• Place a restock order
• Update inventory in ScaleVest
• Review sales data

Manage your inventory: https://your-domain.com/inventory.html

---
This is an automated alert from ScaleVest Business Hub
© 2026 ScaleVest | Powered by AI
    `;

    // Email options
    const mailOptions = {
        from: {
            name: 'ScaleVest AI CFO',
            address: EMAIL_CONFIG.auth.user
        },
        to: recipientEmail,
        subject: `⚠️ LOW STOCK ALERT: ${productName} (${currentStock} ${unit} remaining)`,
        text: textContent,
        html: htmlContent,
        priority: 'high',
        headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'high'
        }
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Low stock alert email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('To:', recipientEmail);
        console.log('Product:', productName);
        console.log('Stock:', currentStock, unit);
        return {
            success: true,
            messageId: info.messageId,
            message: 'Email sent successfully'
        };
    } catch (error) {
        console.error('❌ Failed to send low stock alert email:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ===== SEND MULTIPLE ALERTS (BATCH) =====
async function sendBatchLowStockAlerts(recipientEmail, productsArray, businessName) {
    const results = [];
    
    for (const product of productsArray) {
        const result = await sendLowStockAlert(recipientEmail, {
            ...product,
            businessName
        });
        results.push({
            product: product.productName,
            ...result
        });
        
        // Add delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
}

// ===== VERIFY EMAIL CONFIGURATION =====
async function verifyEmailConfig() {
    try {
        await transporter.verify();
        console.log('✅ Email server is ready to send messages');
        return true;
    } catch (error) {
        console.error('❌ Email server verification failed:', error);
        return false;
    }
}

// ===== EXPORT FUNCTIONS =====
module.exports = {
    sendLowStockAlert,
    sendBatchLowStockAlerts,
    verifyEmailConfig
};

// ===== EXAMPLE USAGE =====
// Uncomment to test the email service

/*
// Single product alert
sendLowStockAlert('user@example.com', {
    productName: 'Coca Cola 500ml',
    currentStock: 3,
    threshold: 5,
    businessName: 'Nexus Corp',
    unit: 'bottles'
});

// Multiple products alert
sendBatchLowStockAlerts('user@example.com', [
    { productName: 'Coca Cola', currentStock: 2, threshold: 5, unit: 'bottles' },
    { productName: 'Lays Chips', currentStock: 1, threshold: 10, unit: 'packets' },
    { productName: 'Milk 1L', currentStock: 4, threshold: 8, unit: 'bottles' }
], 'Nexus Corp');

// Verify email configuration
verifyEmailConfig();
*/
