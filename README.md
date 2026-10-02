# ProTrack 📊 | Smart Store & Profit Management System
### نظام إدارة المنتجات والمبيعات والأرباح الذكية

[![Django](https://img.shields.io/badge/Django-5.0+-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Django REST Framework](https://img.shields.io/badge/Django_REST-Framework-red?style=for-the-badge&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🌟 Overview | نظرة عامة
**ProTrack** is a modern, full-stack store and financial management platform designed for retailers and small businesses. It offers complete inventory tracking, automated profit margin calculations, multi-currency revenue analytics, sales logging, and supplier management with direct WhatsApp integration.

---

## 🚀 Key Features | المميزات الرئيسية

- 🔐 **Secure JWT Authentication**: Full login & registration flow with access and refresh tokens, silent auto-refresh interceptors, and protected routes.
- 🏬 **Multi-Tenant Data Isolation**: Each store manager only sees and manages their own products, sales, and analytics.
- 📦 **Smart Inventory Management**: Real-time stock level monitoring with automatic low-stock alerts (< 5 units remaining).
- 💰 **Automated Profit & Revenue Calculation**: Calculates single-unit profit margin and total profits dynamically on every sale transaction.
- 💱 **Multi-Currency Support**: Supports transactions and balances in YER (ريال يمني), USD ($), and SAR (ريال سعودي).
- 📈 **Interactive Visual Analytics**: Interactive Recharts graphs showing stock distribution (Pie), top 5 best sellers (Bar), and cash flow liquidity (Stacked Bar).
- 📑 **Export & Print Reports**: One-click Excel (.xlsx) export and print-ready financial statements.
- 🤝 **Supplier Directory & CRM**: Manage suppliers with quick-dial and instant WhatsApp messaging links.
- 🌓 **Dark & Light Mode**: User interface supporting customizable dark theme preferences.

---

## 🛡️ Security Measures | معايير الأمان

- **JWT Token Lifetime & Auto-Rotation**: Short-lived access tokens (60 mins) and secure refresh tokens with automatic token rotation.
- **Axios Silent Refresh**: Proactive token renewal interceptor prevents session interruptions while keeping credentials secure.
- **Rate Limiting & Throttling**: DRF Throttling configured to protect sensitive endpoints from brute-force and DDoS attacks.
- **Environment Isolation**: Sensitive configuration (`SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`) decoupled via environment variables.
- **Row-Level Security**: All API querysets are strictly scoped to `request.user` on the server-side to prevent unauthorized data access (IDOR protection).
- **CORS Protection**: Restricted Cross-Origin Resource Sharing whitelist.

---

## 🏗️ Tech Stack | التقنيات المستخدمة

### Backend
- **Framework**: Django 5.0+ / Django 6.0 & Django REST Framework (DRF)
- **Authentication**: `rest_framework_simplejwt` (JWT)
- **Database**: SQLite (Development) / PostgreSQL-ready
- **CORS**: `django-cors-headers`

### Frontend
- **Library**: React 19 + Vite
- **Routing**: React Router DOM v7
- **Charts & Visualization**: Recharts
- **HTTP Client**: Axios with custom Interceptors & Token Queue
- **Notifications**: SweetAlert2
- **Export Tools**: SheetJS (XLSX)

---

## 📡 API Endpoints | نقاط النهاية البرمجية

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/register/` | Register new store user & create store profile | ❌ |
| `POST` | `/api/token/` | Obtain JWT Access & Refresh Token pair | ❌ |
| `POST` | `/api/token/refresh/` | Refresh expired access token | ❌ |
| `GET` | `/api/dashboard/` | Get aggregated revenue, profit & low stock alerts | ✅ |
| `GET/POST` | `/api/products/` | List or create store products | ✅ |
| `GET/PUT/DELETE`| `/api/products/{id}/` | Retrieve, update, or delete a product | ✅ |
| `GET/POST` | `/api/sales/` | List or record new sale transactions | ✅ |
| `GET/POST` | `/api/suppliers/` | List or register suppliers | ✅ |
| `PUT/DELETE` | `/api/suppliers/{id}/` | Edit or delete supplier | ✅ |
| `POST` | `/api/change-password/` | Update username / password with verification | ✅ |
| `GET` | `/api/reports/detailed/`| Comprehensive sales and revenue breakdown | ✅ |

---

## 💻 Getting Started | طريقة التشغيل والتثبيت

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 1. Backend Setup
```bash
# Clone repository
git clone https://github.com/your-username/shopsproject.git
cd shopsproject

# Create and activate virtual environment
python -m venv virtual
# Windows:
.\virtual\Scripts\activate
# Linux/macOS:
source virtual/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start Django Development Server
python manage.py runserver
```

### 2. Frontend Setup
```bash
# Open a new terminal in project root
cd frontend

# Install dependencies
npm install

# Start Vite Development Server
npm run dev
```

Visit `http://localhost:5173` to explore the application.

---

## 📂 Project Structure | هيكلية المشروع

```
shopsproject/
├── core/                   # Django Project Root (settings, urls, wsgi)
│   ├── settings.py         # Security, JWT & Throttling settings
│   └── urls.py             # Main API routing
├── stores/                 # Core Business Application
│   ├── models.py           # Product, Sale, Supplier, StoreProfile
│   ├── views.py            # API ViewSets & Aggregated Stats
│   ├── serializers.py      # DRF ModelSerializers & Validators
│   └── admin.py            # Django Admin registration
├── frontend/               # React Application (Vite)
│   ├── src/
│   │   ├── api.js          # Centralized Axios instance & JWT Interceptor
│   │   ├── pages/          # Dashboard, Products, Sales, Reports, Settings, Login, SignUp
│   │   ├── components/     # Navbar, Suppliers, Navigation
│   │   └── App.jsx         # Protected Routes & Layout
│   └── package.json
├── requirements.txt        # Backend dependencies
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

---

## 📜 License
This project is licensed under the [MIT License](LICENSE).
