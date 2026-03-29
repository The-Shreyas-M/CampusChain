# 🛡️ CampusChain V2
**Modular | Targeted | Secure**

CampusChain is a simulated blockchain-based digital currency system designed for university ecosystems. It features a **Targeted Token Protocol** that ensures specific funds (like Canteen Credits or Club Grants) can only be spent at authorized nodes, preventing fund misappropriation.

---

### 🚀 Core Innovations

* **Targeted Token System:** Multi-vault wallets that separate `GENERAL` funds from restricted tokens like `ANY_MERCHANT` or `ANY_CLUB`.
* **Smart Validator Layer:** The UI dynamically filters spendable assets based on the recipient's role, enforcing "Smart Contract" logic at the transaction level.
* **Node-Based Architecture:** Specialized dashboards for **Admins** (Minter/Treasury), **Students** (Users), **Merchants** (Canteen/Stationary), and **Clubs** (Events/Fees).
* **Auth-Protocol:** Integrated PinPad system for every transaction (Transfer, Bill Pay, or Redemption) to ensure node security.
* **Global Ledger:** A real-time, transparent audit trail of all successful and failed transactions across the network.

---

### 🛠️ Tech Stack

* **Frontend:** React.js + Vite
* **Styling:** Tailwind CSS (Cyberpunk/Dark Mode Aesthetic)
* **Icons:** Lucide React
* **Animations:** Framer Motion
* **Persistence:** LocalStorage (Simulated Distributed Ledger)

---

### 📥 Installation & Setup

Follow these steps to get the node running locally:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/](https://github.com/)[YOUR_USERNAME]/CampusChain-V2.git
    cd CampusChain-V2
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```

4.  **Login Credentials (Default Demo Data):**
    * **Admin:** UID: `admin` | PIN: `1234`
    * **Student:** UID: `23104188` | PIN: `1234`
    * **Merchant:** UID: `M-999` | PIN: `1234`

---

### 🛡️ Project Status: **MVP_READY**
Designed and developed for the 24-hour FinTech Hackathon. This version (v6.5_MODULAR) focuses on solving the problem of fund misappropriation in campus grants and restricted scholarship spending.
