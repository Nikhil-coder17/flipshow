# Maverick Fashion – Online Store (setup guide for beginners)

You do NOT need to know coding. Follow the steps in order.

## What you have
- **Website** (`public/index.html`) – the exact design you approved, now connected to a real server.
- **Server** (`server.js`) – saves products and orders, checks prices, logs you in.
- **Admin page** (`/admin.html`) – add / edit / hide / delete products, change prices, upload photos, see orders, update order status, message customers on WhatsApp.
- **Data** (`data/`) – your products and orders. **Photos** are in `public/uploads/`.

---

## Part 1 – Run it on your own computer (10 minutes)

1. **Install Node.js.** Go to https://nodejs.org , download the **LTS** version, install it (keep clicking Next).
2. **Unzip** this project to a folder, for example `Documents\maverick-store`.
3. **Make your settings file.** Find the file `.env.example`, make a copy, and rename the copy to `.env`.
   Open `.env` in Notepad and change `ADMIN_PASSWORD=change-me` to your own strong password. Save.
   *(Windows: if you can't see file extensions, ask Claude – it will walk you through.)*
4. **Start the store.**
   - **Windows:** double-click **start.bat**
   - **Mac:** open Terminal, type `cd ` (with a space), drag the folder into the Terminal window, press Enter, then type `node server.js` and press Enter.
5. You will see "Maverick Fashion store is running". Open your browser:
   - Website: **http://localhost:3000**
   - Admin: **http://localhost:3000/admin.html**
6. Keep that black window open while using the store. Close it to stop.

## Part 2 – Add and change products

1. Open the admin page and log in.
2. **+ Add product** → fill name, design/colour, category, price → choose a photo → **Save**.
   - The *category* becomes a page in the menu automatically. A new category name = a new page.
   - Best photo: front and back together, square-ish. The server shrinks big photos for you.
3. **Edit** to change price or photo. **Delete** removes it. Untick *Show on website* to hide without deleting.
4. **Orders** tab: see every order, set status (Confirmed, Packed, Shipped…), mark paid, tap **WhatsApp** to message the customer.

## Part 3 – Put it online so customers can use it

Your computer can't stay on forever, so use a hosting service. Easiest path:

1. Create a free account at **GitHub.com**, make a new *private* repository, and upload this folder's files (do NOT upload `.env`).
2. Create an account at **Render.com** → **New → Web Service** → connect your GitHub repo.
   - Runtime: **Node**. Build command: leave empty. Start command: `node server.js`
3. **Important – keep your data safe.** Free hosting forgets files when it restarts. Add a **Disk** (paid option, a few dollars a month – check Render's current price) mounted at `/var/data`.
   In Render → **Environment**, add:
   - `ADMIN_PASSWORD` = your password
   - `DATA_DIR` = `/var/data/data`
   - `UPLOAD_DIR` = `/var/data/uploads`
   (On first start the server copies your products and photos onto the disk.)
4. Render gives you a link like `maverick-store.onrender.com`. Test the website and `/admin.html`.
5. **Your own address (domain):** buy one (for example maverickfashion.in) from GoDaddy / Namecheap / Hostinger. In Render → **Settings → Custom Domains** add it, then copy the DNS records Render shows into your domain's DNS page. HTTPS (the padlock) is added automatically.

## Part 4 – Online payments (Razorpay) – optional

Without this, customers choose *Cash on delivery*, or *UPI/Card (pay later)* and you contact them to collect payment.

1. Create a **Razorpay** account and complete KYC. Use **Test mode** first.
2. Settings → API Keys → copy **Key ID** and **Key Secret**.
3. Put them in `.env` (or Render Environment) as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. Restart the server.
4. Place a test order with a Razorpay test card. When it works, switch Razorpay to **Live** and replace the keys.
   *The payment code is written to Razorpay's documented flow but was not tested against a live Razorpay account – always do a test order before you launch.*

## Part 5 – Things to check before launch

- Change `ADMIN_PASSWORD`. Never share it.
- The product page says "Free delivery / 7-day easy returns / Cash on delivery available" and the home page has offer cards and a "Live now · Big Maverick Sale" label. **Make sure these match your real policies**, or ask Claude to change them (upload `public/index.html` and describe the change).
- Delivery charges, stock counts and customer accounts are not included yet – good next steps.
- **Backups:** copy the `data` and `public/uploads` folders (or `/var/data` on hosting) every week. That is your whole business data.

## Troubleshooting
- *"node is not recognized"* → Node.js isn't installed yet (Part 1, step 1). Restart the computer after installing.
- *Page won't open* → make sure the black window is still open and shows "running".
- *Port already in use* → close other copies of the store window, or add `PORT=3001` to `.env`.
- *Forgot admin password* → open `.env`, set a new `ADMIN_PASSWORD`, restart.
