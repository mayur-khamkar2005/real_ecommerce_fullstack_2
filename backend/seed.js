require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Product = require('./models/product.model');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

// ──────────────────────────────────────────
// Category-specific color palettes
// Format: [bg, text]
// ──────────────────────────────────────────
const CATEGORY_COLORS = {
  Electronics: ['0f172a', '60a5fa'],
  Fashion: ['1e1020', 'e879f9'],
  Gaming: ['0f1721', 'f43f5e'],
  'Home & Kitchen': ['0d1f15', '4ade80'],
  Books: ['1c1208', 'fb923c'],
  Sports: ['0b1f1a', '34d399'],
  Beauty: ['25111d', 'f472b6'],
  Accessories: ['1a1a1a', 'e2e8f0'],
  Footwear: ['1a0f09', 'fbbf24'],
  Gadgets: ['0c1930', '38bdf8'],
};

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncateText(text, maxLength = 30) {
  const clean = String(text || '').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1)}…`;
}

// Deploy-safe image: no external dependency, always renders
function buildImageUrl(name, category) {
  const [bg, text] = CATEGORY_COLORS[category] || ['1e293b', 'f97316'];
  const title = escapeXml(truncateText(name, 22));
  const cat = escapeXml(truncateText(category, 18));

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#${bg}" />
          <stop offset="100%" stop-color="#${bg}" />
        </linearGradient>
      </defs>

      <rect width="800" height="800" fill="url(#g)" />
      <circle cx="650" cy="160" r="220" fill="#${text}" opacity="0.08" />
      <circle cx="140" cy="660" r="180" fill="#${text}" opacity="0.05" />

      <rect x="70" y="70" width="660" height="660" rx="0" ry="0" fill="none" stroke="#${text}" stroke-opacity="0.08" />

      <text
        x="50%"
        y="46%"
        text-anchor="middle"
        fill="#${text}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="54"
        font-weight="700"
        letter-spacing="0.2px"
      >${title}</text>

      <text
        x="50%"
        y="57%"
        text-anchor="middle"
        fill="#${text}"
        fill-opacity="0.75"
        font-family="Arial, Helvetica, sans-serif"
        font-size="26"
        font-weight="600"
      >${cat}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const categoryProducts = {
  Electronics: [
    'Smartphone Pro',
    '4K Smart TV',
    'Wireless Headphones',
    'Laptop Pro 15"',
    'Tablet Ultra',
    'Bluetooth Speaker',
    'Smartwatch Series 8',
    'Digital Camera 4K',
    'Noise Canceling Earbuds',
    'External SSD 1TB',
  ],
  Fashion: [
    "Men's Classic T-Shirt",
    "Women's Summer Dress",
    'Denim Jacket',
    'Winter Coat',
    'Slim Fit Jeans',
    'Polo Shirt',
    'Leather Belt',
    'Silk Scarf',
    'Wool Sweater',
    'Cotton Shorts',
  ],
  Gaming: [
    'Next-Gen Console',
    'Wireless Controller',
    'Gaming Headset',
    'Mechanical Keyboard',
    'RGB Gaming Mouse',
    'Gaming Monitor 144Hz',
    'Ergonomic Gaming Chair',
    'Extended Mousepad',
    'Streaming Microphone',
    'Webcam 1080p',
  ],
  'Home & Kitchen': [
    'Coffee Maker',
    'Blender',
    'Air Fryer',
    'Toaster Oven',
    'Cookware Set',
    'Vacuum Cleaner',
    'Microwave Oven',
    'Electric Kettle',
    'Stand Mixer',
    'Slow Cooker',
  ],
  Books: [
    'The Great Gatsby',
    '1984 George Orwell',
    'To Kill a Mockingbird',
    'The Hobbit',
    'Pride and Prejudice',
    'Dune',
    'Harry Potter Series',
    'Lord of the Rings',
    'The Catcher in the Rye',
    'Fahrenheit 451',
  ],
  Sports: [
    'Yoga Mat',
    'Dumbbell Set',
    'Treadmill',
    'Resistance Bands',
    'Jump Rope',
    'Tennis Racket',
    'Basketball',
    'Soccer Ball',
    'Cycling Helmet',
    'Fitness Tracker',
  ],
  Beauty: [
    'Moisturizing Lotion',
    'Lipstick Set',
    'Eyeshadow Palette',
    'Mascara',
    'Foundation',
    'Perfume Spray',
    'Makeup Brushes',
    'Nail Polish Kit',
    'Hair Dryer',
    'Face Cleanser',
  ],
  Accessories: [
    'Leather Wallet',
    'Sunglasses',
    'Wristwatch',
    'Silver Necklace',
    'Diamond Earrings',
    'Baseball Cap',
    'Canvas Tote Bag',
    'Travel Backpack',
    'Silk Tie',
    'Umbrella',
  ],
  Footwear: [
    'Running Sneakers',
    'Leather Boots',
    'Casual Loafers',
    'High Heels',
    'Hiking Shoes',
    'Comfort Sandals',
    'Canvas Slip-ons',
    'Basketball Shoes',
    'Formal Oxfords',
    'Winter Boots',
  ],
  Gadgets: [
    'Smart Home Hub',
    'Wireless Charger',
    'Power Bank 20000mAh',
    'Smart Bulb',
    'Drone with Camera',
    'VR Headset',
    'Smart Thermostat',
    'Fitness Ring',
    'Portable Projector',
    'USB-C Hub',
  ],
};

const products = [];

Object.keys(categoryProducts).forEach((category, categoryIndex) => {
  categoryProducts[category].forEach((name, productIndex) => {
    products.push({
      name,
      description: `Premium quality ${name.toLowerCase()} designed for everyday use. Built with maximum durability and performance for the modern lifestyle.`,
      price: parseFloat(((Math.random() * 150) + 15).toFixed(2)),
      category,
      stock: Math.floor(Math.random() * 80) + 20,
      image: buildImageUrl(name, category),
      // Optional extra fields if your schema allows them
      // imageAlt: `${name} - ${category}`,
      // sortIndex: categoryIndex * 100 + productIndex,
    });
  });
});

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    await User.deleteMany();
    await Product.deleteMany();
    console.log('Cleared existing data.');

    const adminHash = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@ecommerce.com',
      password: adminHash,
      role: 'admin',
    });
    console.log(`Admin: ${adminUser.email} / admin123`);

    const userHash = await bcrypt.hash('user123', 10);
    await User.create({
      name: 'Test User',
      email: 'user@ecommerce.com',
      password: userHash,
      role: 'user',
    });
    console.log('User:  user@ecommerce.com / user123');

    await Product.insertMany(products);

    console.log(
      `\n✅ ${products.length} products seeded across ${Object.keys(categoryProducts).length} categories.`
    );
    console.log('✅ Images are embedded SVG data URLs, so they always render.');
    console.log('✅ No external image dependency. Works in dev + production.\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();