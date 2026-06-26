# 🔧 Suluhisho la Error ya Database kwenye Render

## ❌ Tatizo
```
❌ Error in automatic scheduler: getaddrinfo ENOTFOUND dpg-d5hlo7pr0fns73dnvvq0-a
```

Tatizo hili linatokea wakati:
- DATABASE_URL ina hostname ya internal ya Render ambayo haiwezi kupatikana
- DNS lookup inashindwa kwa sababu hostname sio sahihi

---

## ✅ SULUHISHO: Tumia External Database URL

### Hatua 1: Ingia Render Dashboard
1. Nenda kwenye https://dashboard.render.com
2. Bonyeza kwenye **PostgreSQL database** yako

### Hatua 2: Pata External Database URL
1. Kwenye database dashboard, tafuta sehemu ya **"Connections"**
2. Utaona aina mbili za URL:
   - **Internal Database URL** (ina hostname kama `dpg-xxxxx-a`) ❌ USITUMIE HII
   - **External Database URL** (ina hostname kama `dpg-xxxxx-a.oregon-postgres.render.com`) ✅ TUMIA HII

### Hatua 3: Copy External Database URL
External URL inaonekana hivi:
```
postgresql://username:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/database_name
```

**MUHIMU:** Hakikisha URL ina:
- Full hostname na domain (`.oregon-postgres.render.com` au `.frankfurt-postgres.render.com`)
- Port number (`:5432`)

### Hatua 4: Update Environment Variable kwenye Backend Service
1. Nenda kwenye **Backend Service** yako (must-lms-backend)
2. Bonyeza **"Environment"** tab
3. Tafuta variable **DATABASE_URL**
4. Bonyeza **"Edit"** na weka External Database URL
5. Bonyeza **"Save Changes"**

### Hatua 5: Redeploy Service
1. Service itaredeploy automatically baada ya kubadilisha environment variable
2. Au bonyeza **"Manual Deploy"** → **"Deploy latest commit"**

---

## 🔍 Jinsi ya Kuthibitisha Kama Umefanikiwa

Baada ya kudeploy, angalia logs:
```
✅ Connected to PostgreSQL database: LMS_MUST_DB_ORG
```

Badala ya:
```
❌ Error in automatic scheduler: getaddrinfo ENOTFOUND dpg-xxxxx-a
```

---

## 📋 Checklist

- [ ] Nimepata External Database URL kutoka Render dashboard
- [ ] Nimebadilisha DATABASE_URL kwenye backend service environment variables
- [ ] Service imeanza kudeploy upya
- [ ] Logs zinaonyesha "Connected to PostgreSQL database"
- [ ] Hakuna error za "ENOTFOUND"

---

## 🆘 Kama Bado Kuna Tatizo

### Tatizo 1: Database URL Haipo
**Suluhisho:** Unda database mpya kwenye Render:
1. Dashboard → New → PostgreSQL
2. Jaza details na create
3. Copy External Database URL

### Tatizo 2: Connection Timeout
**Suluhisho:** Hakikisha:
- Database iko kwenye region moja na backend service (e.g., Oregon)
- Database iko "Available" status (sio "Suspended")

### Tatizo 3: Authentication Failed
**Suluhisho:** 
- Copy DATABASE_URL tena kutoka Render (password inaweza kubadilika)
- Paste bila kubadilisha chochote

---

## 💡 Maelezo ya Kina

### Tofauti kati ya Internal na External URL

**Internal URL** (`dpg-xxxxx-a`):
- Inatumika kwa services ndani ya Render network tu
- Haiwezi kupatikana kutoka nje
- DNS inashindwa kwa external services

**External URL** (`dpg-xxxxx-a.oregon-postgres.render.com`):
- Inapatikana kutoka popote
- Ina SSL/TLS encryption
- Inafanya kazi kwa services zote

### Kwa Nini Code Imebadilika?

Nimebadilisha code ili:
1. **Kuhandle ENOTFOUND error** - Sasa scheduler haitaonyesha error spam
2. **Kuongeza connection timeout settings** - Kufanya connection iwe stable zaidi
3. **Kuongeza helpful error messages** - Kukuelekeza jinsi ya kutatua tatizo

---

## 📞 Msaada Zaidi

Kama unahitaji msaada:
1. Screenshot ya Render database dashboard (Connections section)
2. Screenshot ya Backend service environment variables
3. Copy logs kutoka Render backend service

---

**Imetengenezwa: April 21, 2026**
**Mwandishi: Kiro AI Assistant**
