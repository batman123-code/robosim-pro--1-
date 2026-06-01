const fs = require("fs");

// 1. Create server.js
const serverJsContent = `require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const port = isProd ? 3000 : 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SwK4brnrDOOszp', // User test key 
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// Create Order API
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', purpose, name, email, phone } = req.body;
    
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit
      currency,
      receipt: 'receipt_' + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json({
        ...order,
        donor: { name, email, phone, purpose }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify Payment API
app.post('/api/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment verified
      res.json({ 
        success: true, 
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature sent!' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Simulated Database API
const donations = [];

app.post('/api/save-donation', (req, res) => {
    const { paymentId, orderId, name, email, phone, amount, purpose } = req.body;
    const donation = {
        id: Date.now().toString(),
        paymentId,
        orderId,
        name,
        email,
        phone,
        amount,
        purpose,
        date: new Date().toISOString()
    };
    donations.push(donation);
    res.json({ success: true, id: donation.id, donation });
});

// Serve frontend in production
if (isProd) {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
        let page = req.path;
        if (page === '/') page = '/index.html';
        const fileToServe = path.join(__dirname, 'dist', page);
        if (fs.existsSync(fileToServe)) {
            res.sendFile(fileToServe);
        } else {
            res.sendFile(path.join(__dirname, 'dist', 'index.html'));
        }
    });
}

const fs = require('fs');

app.listen(port, () => {
    console.log(\`Server running on port \${port}\`);
});
`;
fs.writeFileSync("server.js", serverJsContent);

// 2. Create vite.config.js to include all HTML files and add proxy
const viteConfigContent = `import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
const inputMap = {};
files.forEach(f => {
    inputMap[f.replace('.html', '')] = resolve(__dirname, f);
});

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      input: inputMap
    }
  }
});
`;
fs.writeFileSync("vite.config.js", viteConfigContent);

// 3. Update package.json scripts
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
pkg.scripts = {
  dev: "node server.js & vite",
  build: "vite build",
  start: "NODE_ENV=production node server.js",
  preview: "NODE_ENV=production node server.js",
};
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));

// 4. Create .env.example
fs.writeFileSync(".env.example", "RAZORPAY_KEY_ID=\nRAZORPAY_KEY_SECRET=\n");

console.log("Fullstack setup completed");
