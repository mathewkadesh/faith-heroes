<div align="center">

<img src="https://mathewkadesh.github.io/faith-heroes/Img/faith-heroes-brand-hero.png" alt="Faith Heroes Banner" width="100%" />

<br /><br />

# ✝ Faith Heroes

### *Handcrafted Bible Story Gift Boxes — Bristol, UK*

**Every story. A sacred gift.**

Bringing Scripture to life through beautifully curated collector gift boxes  
for children, families, and communities across the world.

<br />

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/Deployed-GitHub%20Pages-181717?style=for-the-badge&logo=github&logoColor=white)

<br />

[🌐 Live Site](https://mathewkadesh.github.io/faith-heroes) &nbsp;·&nbsp; [🛍 Shop](https://mathewkadesh.github.io/faith-heroes/shop) &nbsp;·&nbsp; [🔐 Admin Dashboard](https://mathewkadesh.github.io/faith-heroes/admin) &nbsp;·&nbsp; [📖 About Us](https://mathewkadesh.github.io/faith-heroes/about)

</div>

---

## 📖 The Story Behind Faith Heroes

Faith Heroes is a faith-driven e-commerce brand born in **Bristol, UK**, with a simple but powerful mission: to make the Bible's greatest heroes come alive for the next generation.

Every gift box is built around a Bible character — **Noah, David, Moses, Esther, and more** — and contains a handcrafted collection of physical items designed to spark imagination, build faith, and become treasured keepsakes for years to come.

We believe every child deserves to grow up knowing the heroes of Scripture — not as distant figures in a dusty book, but as real, courageous people whose faith in God changed history. And whose stories can change lives today.

> *"Faith Heroes is more than a shop. It's a movement — one story, one family, one life at a time."*  
> — The Faith Heroes Team, Bristol UK

---

## 🎁 What's Inside Every Gift Box

<div align="center">
<img src="https://mathewkadesh.github.io/faith-heroes/Img/noah-unboxing-gift-box.png" alt="Noah Unboxing" width="48%" />
&nbsp;
<img src="https://mathewkadesh.github.io/faith-heroes/Img/david-and-goliath-character-story.png" alt="David & Goliath Story" width="48%" />
</div>

<br />

Each Faith Heroes gift box contains **5 signature items** — every single one meaningful, every one made to last:

| Item | Description |
|------|-------------|
| 🗿 **Chibi 3D Vinyl Figure** | Hand-painted collector figure — each Bible hero uniquely designed |
| 📚 **Story Booklet** | Illustrated 12-page narrative booklet with the full biblical story |
| 🔑 **Scripture Keychain** | Engraved metal keychain with the hero's key verse |
| 🔖 **Character Bookmark** | Premium leather tassel bookmark with character artwork |
| 🎴 **Voice Narration Card** | Tap to your phone — hear the story in cinematic audio *(NEW)* |

---

## 🖼 Product Gallery

<div align="center">

<img src="https://mathewkadesh.github.io/faith-heroes/Img/moses-collector-gift-box.png" alt="Moses Collector Gift Box" width="32%" />
<img src="https://mathewkadesh.github.io/faith-heroes/Img/david-collector-gift-box.png" alt="David Collector Gift Box" width="32%" />
<img src="https://mathewkadesh.github.io/faith-heroes/Img/cross-keychain-signature-item.png" alt="Scripture Keychain" width="32%" />

<br /><br />

<img src="https://mathewkadesh.github.io/faith-heroes/Img/handcrafted-with-love-workshop.png" alt="Handcrafted Workshop" width="48%" />
&nbsp;
<img src="https://mathewkadesh.github.io/faith-heroes/Img/faith-heroes-workshop-desk.png" alt="Faith Heroes Studio" width="48%" />

</div>

---

## ✨ Platform Features

### 🛍 Customer Experience
- Animated **Landing Page** with hero section, character showcase, testimonials, and community stories wall
- **Shop Page** with live search, Old/New Testament filters, price sorting, and stock indicators
- **Product Detail Page** with full character story, scripture quotes, and interactive **3D model viewer**
- **Gift Box Customisation** — personalised message and recipient name at checkout
- **Cart & Checkout** fully integrated with **Stripe** and **PayPal**
- **Real-time Order Tracking** with live status updates via Socket.io
- **User Authentication** — register, log in, manage account and order history
- **Share Kindness Wall** — community story submissions and a public browsable feed
- **Promotions & Discount Codes** — featured banners and code redemption at checkout
- **Newsletter Signup** with toast confirmation

---

## 🔐 Admin Dashboard

> **Access:** Go to [`/admin`](https://mathewkadesh.github.io/faith-heroes/admin) on the live site and log in with your admin credentials.

The platform includes a **full internal admin panel** — no developer needed to manage the business day-to-day. Everything is controlled through the dashboard:

| Section | What you can manage |
|---------|-------------------|
| 📊 **Dashboard** | Live sales overview, revenue charts, recent orders at a glance |
| 📦 **Orders** | View all orders, update fulfilment status, manage shipping |
| 🧑‍🎨 **Characters** | Add/edit Bible hero characters, upload product images & 3D models |
| 🛒 **Products** | Create gift box listings, set prices, manage stock levels |
| 🎟 **Promotions** | Create discount codes, set expiry dates, feature banners |
| 📝 **Stories** | Review and approve/reject community story submissions |
| 👥 **Customers** | Browse registered users, view order history |
| ⚙️ **Settings** | Store config, shipping zones, notification preferences |

> **Adding product images?** Go to Admin → Characters → edit a character → upload `Figure Image`, `Lid Image`, and `Box Image`. Changes appear live on the site immediately — no rebuild or redeployment needed.

---

## 🗄 Database

The platform uses **Neon PostgreSQL** (serverless Postgres, EU West — London region) managed through **Prisma ORM**.

```
Provider:   Neon Serverless PostgreSQL
Region:     eu-west-2 (London)
ORM:        Prisma 7.8
Schema:     prisma/schema.prisma
```

> ⚠️ **Testing Phase Notice** — The database is currently running on a Neon development instance for testing and staging. Before full commercial launch, this will be migrated to a production-grade Neon plan with connection pooling, automated daily backups, and point-in-time recovery enabled.

**Core schema:**

```
characters      — Hero profiles, images, bible references, 3D model URLs
products        — Gift box listings, pricing, stock quantities
orders          — Customer orders with full status lifecycle
order_items     — Line items, quantities, personalisation per order
profiles        — User accounts, addresses, preferences
promotions      — Discount codes, featured offers, expiry management
stories         — Community submissions (pending / approved / rejected)
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router v7, Tailwind CSS v3, Framer Motion |
| **3D Viewer** | Three.js, React Three Fiber, Drei |
| **Backend API** | Node.js, Express 5 |
| **Database** | Neon PostgreSQL (serverless), Prisma ORM |
| **Auth** | JWT (Express), Supabase Auth |
| **Payments** | Stripe, PayPal |
| **Real-time** | Socket.io |
| **Email** | Resend |
| **Deployment** | GitHub Pages (frontend) · Render (backend — coming soon) |

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+, npm
- Neon database URL (or any PostgreSQL connection string)

### 1. Clone
```bash
git clone https://github.com/mathewkadesh/faith-heroes.git
cd faith-heroes
```

### 2. Install
```bash
npm install --legacy-peer-deps
cd server && npm install && cd ..
```

### 3. Configure environment

**Root `.env`**
```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
REACT_APP_API_URL=http://localhost:5001/api
```

**`server/.env`**
```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:3000
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
JWT_SECRET=your-secret-here
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
FROM_EMAIL=hello@faithheroes.co.uk
```

### 4. Start (frontend + backend together)
```bash
npm run dev
```

| Service | URL |
|---------|-----|
| React App | http://localhost:3000 |
| Express API | http://localhost:5001/api |
| Admin Panel | http://localhost:3000/admin |

---

## 🌐 Deployment

### Frontend → GitHub Pages
```bash
npm run deploy
```
Builds React and pushes the compiled output to the `gh-pages` branch automatically.

### Backend → Render / Railway
Deploy the `server/` folder to [Render](https://render.com) or [Railway](https://railway.app).  
Then update `REACT_APP_API_URL` in `.env.production` to your live server URL and redeploy with `npm run deploy`.

---

## 📁 Project Structure

```
faith-heroes/
├── public/
│   └── Img/                  # All product and brand images
├── src/
│   ├── components/           # Navbar, Cart, ProductCard, CharacterCard, 3D Viewer...
│   ├── context/              # AuthContext, CartContext
│   ├── hooks/                # useOrders, useSignatureItems
│   ├── lib/                  # API client, Stripe, Supabase, Socket, assets
│   └── pages/
│       ├── admin/            # Dashboard, Orders, Characters, Products, Promotions...
│       ├── LandingPage.js
│       ├── ShopPage.js
│       ├── ProductPage.js
│       ├── CheckoutPage.js
│       ├── OrderTrackingPage.js
│       └── ShareKindnessPage.js
├── server/
│   ├── controllers/          # Business logic per resource
│   ├── routes/               # Express API routes
│   ├── middleware/           # Auth, rate limiting, error handling
│   └── index.js
└── prisma/
    └── schema.prisma         # Database schema
```

---

## 🗺 Roadmap

- [x] Animated landing page with character showcase
- [x] Shop with search, filters, and product cards
- [x] Cart and checkout — Stripe + PayPal
- [x] Full admin dashboard
- [x] Community stories wall
- [x] 3D product viewer (Three.js)
- [x] Real-time order tracking
- [x] Promotions and discount codes
- [ ] 3D chibi vinyl figure models per character (.glb)
- [ ] Hero background video production
- [ ] Backend deployed to Render
- [ ] Custom domain — faithheroes.co.uk
- [ ] Mobile app (React Native)
- [ ] Church & school bulk ordering portal
- [ ] Subscription gifting plan

---

<div align="center">

<img src="https://mathewkadesh.github.io/faith-heroes/Img/bible-candle-story-background.png" alt="Bible Candle" width="65%" />

<br /><br />

*"Be strong and courageous. Do not be afraid; do not be discouraged,*  
*for the Lord your God will be with you wherever you go."*  
— Joshua 1:9

<br />

**© 2026 Faith Heroes · Bristol, UK**  
faithheroes.co.uk *(coming soon)*

</div>
