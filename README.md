# বাংলা থাম্বনেইল এডিটর (Bangla Thumbnail Editor)

মোবাইল-ফার্স্ট ওয়েব অ্যাপ — Canva ছাড়াই মোবাইল থেকে বাংলা কোট থাম্বনেইল, ইসলামিক পোস্ট,
বিবাহ পোস্ট, মোটিভেশনাল পোস্ট ও সোশ্যাল মিডিয়া গ্রাফিক্স তৈরি করুন।

## Features

- 📱 **Mobile-first editor** — বড় টাচ-ফ্রেন্ডলি বাটন, বটম টুলবার (টেক্সট / ব্যাকগ্রাউন্ড / লোগো / লেয়ার / টেমপ্লেট / এক্সপোর্ট)
- ✍️ **Bengali-perfect text system** — মাল্টিপল টেক্সট লেয়ার, ফন্ট, সাইজ, রং, অ্যালাইনমেন্ট, লাইন/লেটার স্পেসিং, শ্যাডো, স্ট্রোক, অপাসিটি
- 🎨 **লাইন ও শব্দ-লেভেল স্টাইলিং** — একই লাইনের ভেতরে আলাদা শব্দে আলাদা রং (দিনদার = নীল, পাত্রী = গোলাপি)। Fabric-এর grapheme-aware ইনডেক্সিং ব্যবহার করা হয়েছে যাতে বাংলা যুক্তাক্ষর/কার ঠিক থাকে
- 🔤 **৮টি প্রি-লোডেড Google বাংলা ফন্ট** + লোকাল TTF স্লট (কালপুরুষ, সোলায়মান লিপি, সিয়াম রূপালী, আদর্শলিপি) + **কাস্টম TTF/OTF আপলোড** (IndexedDB-তে সেভ থাকে)
- 🖼️ **ব্যাকগ্রাউন্ড সিস্টেম** — সলিড, গ্রেডিয়েন্ট (অ্যাঙ্গেলসহ), ছবি আপলোড, ব্লার, অপাসিটি
- 🏷️ **My Logos** — আপলোড / রিনেম / ডিলিট / ডিফল্ট সেট; সব প্রজেক্টে এক ক্লিকে ব্যবহার
- 📑 **৬ ক্যাটাগরির টেমপ্লেট** — ইসলামিক, বিবাহ, মোটিভেশনাল, ফেসবুক স্ট্যাটাস, সোশ্যাল, বিজনেস
- ⚙️ **Brand Settings** — ডিফল্ট ফন্ট/সাইজ/রং/লোগো/ওয়াটারমার্ক/ক্যানভাস সাইজ, নতুন প্রজেক্টে অটো-অ্যাপ্লাই
- 🧅 **লেয়ার প্যানেল** — রিঅর্ডার, লক, হাইড, ডুপ্লিকেট, ডিলিট
- 💾 **অটো-সেভ (৪ সেকেন্ড)** + ড্রাফট সিস্টেম + IndexedDB ক্র্যাশ-ব্যাকআপ
- 📤 **হাই-রেজোলিউশন এক্সপোর্ট** — PNG / স্বচ্ছ PNG / JPG, 1080 → 2160 → 3240 → **4320px (৩০০ DPI প্রিন্ট কোয়ালিটি)**। এক্সপোর্টে পুরো সিন ভেক্টর থেকে রি-রেন্ডার হয়, তাই বাংলা টেক্সট সব রেজোলিউশনে শার্প
- ↩️ আনডু/রিডু (৫০ স্টেপ), জুম, ডুপ্লিকেট/ডিলিট কুইক অ্যাকশন

## Tech Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) + TypeScript | SSR dashboard + API routes in one deployable app |
| Styling | Tailwind CSS 4 | Mobile-first utility styling |
| Canvas | **Fabric.js v6** | Per-character text styles → word-level Bengali styling (Konva lacks this) |
| State | Zustand | Canvas/editor state without prop-drilling |
| Database | **MySQL** (`mysql2`) — Hostinger-ready | Designs, logos, brand settings |
| Local storage | IndexedDB | Custom fonts + draft crash-backup |

## Architecture

```
Browser (client)                          Server (Next.js)              MySQL (Hostinger)
┌──────────────────────────┐   fetch    ┌─────────────────┐           ┌──────────────┐
│ Dashboard (tabs)         │──────────▶│ /api/designs     │──────────▶│ designs       │
│ Editor                   │           │ /api/designs/:id │           │ logos         │
│  ├ Fabric canvas (1080²) │           │ /api/logos[ /:id]│           │ brand_settings│
│  ├ Zustand store         │           │ /api/brand       │           └──────────────┘
│  ├ History (undo/redo)   │           └─────────────────┘
│  └ Auto-save (4s)        │            Repository layer:
│ IndexedDB                │            MySQL ◀─ env ─▶ JSON file
│  ├ custom fonts          │            (local dev fallback ./data)
│  └ draft backups         │
└──────────────────────────┘
```

- **Repository pattern** (`src/lib/db`) — MySQL when `MYSQL_*` env vars are set, JSON-file store otherwise. Future storage (e.g. user accounts, S3) plugs in behind the same interface.
- **Templates are serializable specs** (`src/lib/templates.ts`) — positions/sizes are canvas-size fractions, so the same template works on any dimension. AI Text Layout / Bulk Creation can generate these specs later.
- **Export = vector re-render** — `canvas.toDataURL({ multiplier })` re-rasterizes glyph outlines at target resolution; no upscaling, no blur.

## Folder Structure

```
├─ schema.sql                      # MySQL schema (phpMyAdmin import)
├─ public/fonts/                   # Local Bengali TTFs (see README inside)
└─ src/
   ├─ app/
   │  ├─ page.tsx                  # Dashboard
   │  ├─ editor/page.tsx           # Editor (?id= | ?template= | ?new=1&w=&h=)
   │  └─ api/                      # designs / logos / brand REST routes
   ├─ components/
   │  ├─ dashboard/                # Tabs: Designs, Templates, Logos, Brand + NewDesignModal
   │  ├─ editor/                   # EditorShell, CanvasStage, TopBar, BottomToolbar,
   │  │  └─ panels/                #   Text, Background, Logo, Layers, Templates, Export
   │  └─ ui/                       # BottomSheet, Slider, ColorPicker
   ├─ hooks/useCommit.ts           # dirty-mark + debounced undo snapshot
   ├─ lib/
   │  ├─ db/                       # Repository: index (selector), mysql, filestore
   │  ├─ fabricHelpers.ts          # text/bg/logo/layers + grapheme-aware word styling
   │  ├─ exportUtils.ts            # high-res export
   │  ├─ templates.ts              # template specs + applier
   │  ├─ fonts.ts                  # font registry + preloader
   │  └─ idb.ts                    # IndexedDB (custom fonts, draft backup)
   ├─ store/editorStore.ts         # Zustand: canvas, selection, history, save status
   └─ types/index.ts
```

## Local Development

```bash
npm install
npm run dev        # http://localhost:3000 — MySQL ছাড়াই চলে (./data JSON store)
```

## Hostinger Deploy Guide (হোস্টিঙ্গারে ডিপ্লয়)

> Next.js চালাতে Node.js দরকার — Hostinger-এর **VPS** অথবা **Cloud/Business প্ল্যানের
> Node.js অ্যাপ** ফিচার ব্যবহার করুন (সাধারণ শেয়ার্ড PHP হোস্টিং-এ Node অ্যাপ চলে না)।

**১. MySQL ডাটাবেস তৈরি করুন**
hPanel → **Databases → MySQL Databases** → নতুন ডাটাবেস + ইউজার তৈরি করুন।

**২. টেবিল ইমপোর্ট করুন**
hPanel → **phpMyAdmin** → আপনার ডাটাবেস সিলেক্ট → **Import** → এই রিপোর `schema.sql` আপলোড করুন।

**৩. এনভায়রনমেন্ট ভ্যারিয়েবল দিন** (`.env` ফাইল বা hPanel-এর Environment variables):

```env
MYSQL_HOST=localhost          # অথবা Hostinger-এর দেওয়া DB হোস্ট
MYSQL_PORT=3306
MYSQL_USER=u123456_dbuser
MYSQL_PASSWORD=আপনার_পাসওয়ার্ড
MYSQL_DATABASE=u123456_thumbnail
```

**৪. বিল্ড ও রান**

```bash
npm install
npm run build
# output: "standalone" — পুরো সার্ভার .next/standalone-এ থাকে:
cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
node .next/standalone/server.js     # PORT=3000 (env দিয়ে বদলানো যায়)
```

VPS-এ হলে `pm2 start .next/standalone/server.js --name thumbnail-editor` দিয়ে চালু রাখুন,
আর Nginx রিভার্স-প্রক্সি দিয়ে আপনার ডোমেইনে পয়েন্ট করুন।

**৫. বাংলা ফন্ট ফাইল** — `public/fonts/README.md` দেখে কালপুরুষ/সোলায়মান লিপি/সিয়াম
রূপালী/আদর্শলিপি-র TTF ফাইলগুলো রাখুন (ঐচ্ছিক — Google Fonts এমনিতেই কাজ করে)।

## Database Schema

`schema.sql` দেখুন — ৩টি টেবিল:

- **designs** — id, name, width, height, `data` (Fabric canvas JSON, LONGTEXT), thumbnail, is_draft, timestamps
- **logos** — id, name, `data` (base64 data URL), is_default
- **brand_settings** — single row: default font/size/color/logo, watermark, canvas size

সব টেবিল `utf8mb4` — বাংলা ও ইমোজি সম্পূর্ণ সাপোর্টেড।

## Development Roadmap

- [x] **Phase 1 — Core:** dashboard, canvas editor, text system (line/word styling), fonts, undo/redo
- [x] **Phase 2 — Assets:** logo library, background system, templates, brand settings
- [x] **Phase 3 — Persistence:** MySQL + auto-save drafts + IndexedDB backup
- [x] **Phase 4 — Export:** multi-resolution PNG/JPG, transparent PNG, 300 DPI print
- [ ] **Phase 5 — Future:** AI text layout, AI background generator, bulk thumbnail creation (CSV → template merge), brand kits, multi-user accounts

আর্কিটেকচার এগুলোর জন্য প্রস্তুত: টেমপ্লেট-স্পেক ফরম্যাট AI জেনারেশনের আউটপুট হতে পারে,
repository layer-এ user-id কলাম যোগ করলেই মাল্টি-ইউজার হয়।
