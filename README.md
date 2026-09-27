# AI-Powered Code Snippet Manager

**English** | [Türkçe](#türkçe)

An AI-powered code snippet manager built with React, Express, Prisma, and PostgreSQL.

`ai-powered-code-snippet-manager` is a full-stack application for storing, searching, and managing code snippets, with AI features layered on top. It uses a separate authentication microservice for user management and a self-published npm package for the frontend auth flow. The stack is split into three parts: a React frontend, a backend that owns snippets and forwards auth requests, and a dedicated auth service that owns credentials and tokens. AI features are powered by Groq, chosen because it works both locally and on a deployed host.

---

## Flowchart of the project

_Request flow: frontend → backend → auth service, with Groq handling AI requests._

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js 18, Express, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | Custom auth service, `@bmdinner/logreg` npm package |
| AI | Groq (`openai/gpt-oss-120b`) |
| Markdown | `react-markdown`, `remark-gfm`, `react-syntax-highlighter` |
| Container | Docker, Nginx (frontend), Render (hosting) |

---

## Installation

    git clone https://github.com/BMDINNER/ai-powered-code-snippet-manager.git
    cd ai-powered-code-snippet-manager

### Backend

    cd backend
    npm install
    npx prisma generate
    npx prisma migrate dev

### Frontend

    cd frontend
    npm install

---

## Quick Start

### Backend

    cd backend
    npm run dev

### Frontend

    cd frontend
    npm run dev

The frontend expects a `VITE_API_URL` environment variable pointing at the backend.

---

## Environment Variables

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `GROQ_API_KEY` | Yes | Groq API key for AI features |
| `GROQ_MODEL` | No | Groq model name (default: `openai/gpt-oss-120b`) |
| `PROJECT_ID` | Yes | Project ID registered with the auth service |
| `API_KEY` | Yes | API key for the project, sent to the auth service |
| `AUTH_SERVICE_URL` | Yes | Base URL of the auth microservice |
| `PORT` | No | Server port (default: `3002`) |
| `CLIENT_URL` | No | Frontend URL for CORS |
| `CORS_ORIGIN` | No | Additional CORS origin |

The backend refuses to start if any required variable is missing. `API_KEY` and `PROJECT_ID` are never sent to the frontend.

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Base URL of the backend |

---

## API

### Auth Routes (proxied to the auth service)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Login with email and password |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/refresh` | Refresh the access token |
| `POST` | `/api/auth/logout` | Clear cookies and revoke refresh token |
| `GET` | `/api/auth/verify` | Verify the current token |
| `PUT` | `/api/auth/email` | Update email |
| `PUT` | `/api/auth/change-password` | Change password |

### Snippet Routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/snippets` | List snippets with search, language, tag filters |
| `GET` | `/api/snippets/:id` | Get a single snippet |
| `POST` | `/api/snippets` | Create a snippet |
| `PUT` | `/api/snippets/:id` | Update a snippet |
| `DELETE` | `/api/snippets/:id` | Delete a snippet |
| `GET` | `/api/snippets/languages` | Get distinct languages |
| `GET` | `/api/snippets/tags` | Get distinct tags |
| `GET` | `/api/snippets/categories` | Get distinct categories |

### AI Routes

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/ai/generate` | Generate a snippet from a prompt |
| `POST` | `/api/ai/improve` | Optimize an existing snippet |
| `POST` | `/api/ai/explain` | Explain what a snippet does |
| `POST` | `/api/ai/chat` | Chat with the AI assistant |
| `GET` | `/api/ai/health` | Check the AI provider status |

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Basic health check |
| `GET` | `/ping` | Health check with DB connectivity |

---

## Architecture Notes

### Where credentials live

The frontend sends only user credentials to the backend. The backend attaches its own `API_KEY` and `PROJECT_ID` before forwarding to the auth service. The browser never sees these values.

The old flow was:

    frontend + LogReg → auth service

The new flow is:

    frontend + LogReg → backend → auth service

This change was made specifically to prevent `apiKey` and `projectId` from appearing in DevTools.

### Where sessions live

The backend sets HTTP-only cookies after a successful login or register. The frontend never touches the access token or refresh token directly. When a request returns 401, the frontend calls `/api/auth/refresh` once and replays the original request. If refresh fails, the user is redirected to `/login`.

### Where AI features live

AI requests go through the backend, which holds the Groq API key. The frontend never sees the Groq key.

---

## Struggles and Solutions

Notes on problems I ran into while building and deploying this project, and what I did about them.

### Choosing an AI provider for a deployed environment

**The struggle:** Ollama worked locally but not on a deployed host. The AI features would be dead on arrival on Render.

**What I did:** Switched to Groq as the AI provider. Groq has a hosted API that works both locally and in production, so the same model is used everywhere.

---

### Groq model deprecation

**The struggle:** Around August 2026, the Groq model I had been using, `llama-3.3-70b-versatile`, was deprecated and shut down. AI features stopped working without any code change on my side.

**What I did:** Migrated to `openai/gpt-oss-120b`, which is the model currently in use. The model name is read from an environment variable, so future swaps only require a config change.

---

### Raw code came back from the AI without formatting

**The struggle:** When I generated a snippet through the AI, the response came back as raw code with no structure. It was hard to read and hard to copy, and the AI assistant's replies had the same problem.

**What I did:** Built two markdown renderer components, one for code display and one for the AI assistant chat. Both use `react-markdown` with `remark-gfm` and `react-syntax-highlighter`. Separating them let me tune each renderer for its use case instead of trying to make one component handle both.

---

### Markdown rules were leaking into the AI assistant chat

**The struggle:** The same markdown renderer was used for both the AI assistant and for code generation. In the assistant, some plain text responses were getting wrapped in markdown rules, which caused visual glitches, strange spacing, and broken formatting on messages that were never supposed to be markdown.

**What I did:** Split the renderers and made the assistant renderer smarter. It checks whether the message actually contains markdown syntax (bold, headers, lists, blockquotes, tables, code blocks) before rendering. If it doesn't, it renders the content as plain text with preserved whitespace. The initial greeting message is also detected by its ID and always rendered as plain text.

---

### Markdown was being applied to code multiple times

**The struggle:** In the code generation flow, markdown rules were being applied to code that had already been wrapped in markdown. Each time I used the explain or improve features, the code was re-wrapped, and the fences stacked up.

**What I did:** Added a `stripCodeBlock` helper that runs before any AI call. It pulls the raw code out of any triple-backtick or inline-code wrapper before sending it to the AI. This happens in both the backend controllers and the frontend `useAI` hook, so the code is clean before it is explained or optimized.

---

### API keys and project IDs were visible in DevTools

**The struggle:** `apiKey` and `projectId` were being sent from the frontend through the LogReg package directly to the auth service. That meant they were visible in the network tab and anywhere someone cared to look.

**What I did:** Flipped the data flow. The frontend now talks only to my backend, and the backend attaches its own credentials before forwarding to the auth service. LogReg was updated to match, and `apiKey` and `projectId` were removed as props entirely.

The commit that captured this was: "corrected the authentication flow by changing direction of authorization from frontend to auth-service, to frontend to backend to auth-service, to prevent apiKey and projectID leak."

---

### OAuth and reset password broke in production

**The struggle:** OAuth2 login and the forgot/reset password pages work locally but fail on the live deployment. The CSP headers on the live host block the redirects. This is the same CSP issue that is being tracked in the auth service.

**What I did:** The OAuth and reset password features are disabled on the live deployment for now. They still work locally. The fix is being worked on in the auth service, and once that is resolved the frontend will pick it up without changes.

---

### Raw error messages were being shown to users

**The struggle:** When something went wrong, users saw raw strings like "Unauthorized" or "Refresh token is invalid." These are useful for debugging but meaningless to a normal user.

**What I did:** Wrapped error responses in the backend with human-readable messages. The frontend surfaces those messages instead of the raw backend text. For example, a 401 on login becomes "Invalid email or password" instead of "Unauthorized." A 429 from the auth service becomes a friendly wait-and-retry message.

---

### Environment variables and CORS broke on first deploy

**The struggle:** The first time I deployed to Render, environment variables weren't set because they were never committed to GitHub (they're in `.gitignore`, which is correct). The service started with empty values and refused to run. On top of that, the CORS origin list was still full of `localhost` URLs, so the deployed frontend was rejected by the backend.

**What I did:** Added every required variable to the Render dashboard and switched the CORS allow-list to use the deployed URLs from Render. Now the origins are read from environment variables where possible, so future deployments don't need a code change to add a new URL.

---

## Docker

### Backend

    docker build -t snippet-backend ./backend
    docker run -p 3002:3002 --env-file ./backend/.env snippet-backend

The backend Dockerfile runs `prisma migrate deploy` on startup, so migrations are applied automatically.

### Frontend

    docker build \
      --build-arg VITE_API_URL=https://your-backend-url \
      -t snippet-frontend ./frontend
    docker run -p 3000:3000 snippet-frontend

The frontend image is served by Nginx with a `try_files` fallback so client-side routing works on refresh.

---

## Database Schema

| Model | Purpose |
|-------|---------|
| `Snippet` | Code snippet with title, description, code, language, tags, category, AI metadata, and owner |

Indexed on `userId`, `language`, and `tags` for fast filtering.

---

## License

MIT

---

# AI Destekli Kod Snippet Yöneticisi

**English** | [Türkçe](#türkçe)

React, Express, Prisma ve PostgreSQL ile geliştirilmiş, yapay zeka destekli bir kod snippet yöneticisi.

`ai-powered-code-snippet-manager`, kod snippet'lerini saklamak, aramak ve yönetmek için tam yığın bir uygulamadır ve üzerine yapay zeka özellikleri eklenmiştir. Kullanıcı yönetimi için ayrı bir kimlik doğrulama mikroservisi, frontend kimlik doğrulama akışı için de kendi yayınladığım bir npm paketi kullanır. Yığın üç parçaya ayrılır: bir React frontend, snippet'leri sahiplenen ve auth isteklerini ileten bir backend, ve kimlik bilgileri ile token'ların sahibi olan ayrı bir auth servisi. Yapay zeka özellikleri, hem yerelde hem de deploy edilmiş bir sunucuda çalıştığı için Groq ile güçlendirilmiştir.

---

## Projenin Akış Diyagramı

_İstek akışı: frontend → backend → auth service, yapay zeka istekleri Groq tarafından karşılanır._

---

## Teknoloji Yığını

| Katman           | Teknoloji                                                  |
|------------------|------------------------------------------------------------|
| Frontend         | React, TypeScript, Vite, Tailwind CSS                      |
| Backend          | Node.js 18, Express, TypeScript                            |
| ORM              | Prisma                                                     |
| Veritabanı       | PostgreSQL                                                 |
| Kimlik Doğrulama | Özel auth servisi, `@bmdinner/logreg` npm paketi           |
| Yapay Zeka       | Groq (`openai/gpt-oss-120b`)                               |
| Markdown         | `react-markdown`, `remark-gfm`, `react-syntax-highlighter` |
| Konteyner        | Docker, Nginx (frontend), Render (hosting)                 |

---

## Kurulum

    git clone https://github.com/BMDINNER/ai-powered-code-snippet-manager.git
    cd ai-powered-code-snippet-manager

### Backend

    cd backend
    npm install
    npx prisma generate
    npx prisma migrate dev

### Frontend

    cd frontend
    npm install

---

## Başlangıç ve Kullanım

### Backend

    cd backend
    npm run dev

### Frontend

    cd frontend
    npm run dev

Frontend, backend'i işaret eden bir `VITE_API_URL` ortam değişkeni bekler.

---

## Ortam Değişkenleri

### Backend

| Değişken           | Zorunlu | Açıklama                                           |
|--------------------|---------|----------------------------------------------------|
| `DATABASE_URL`     | Evet    | PostgreSQL bağlantı dizesi                         |
| `GROQ_API_KEY`     | Evet    | Yapay zeka özellikleri için Groq API anahtarı      |
| `GROQ_MODEL`       | Hayır   | Groq model adı (varsayılan: `openai/gpt-oss-120b`) |
| `PROJECT_ID`       | Evet    | Auth servisine kayıtlı proje ID'si                 |
| `API_KEY`          | Evet    | Projenin API anahtarı, auth servisine gönderilir   |
| `AUTH_SERVICE_URL` | Evet    | Auth mikroservisinin temel URL'si                  |
| `PORT`             | Hayır   | Sunucu portu (varsayılan: `3002`)                  |
| `CLIENT_URL`       | Hayır   | CORS için frontend URL'si                          |
| `CORS_ORIGIN`      | Hayır   | Ek CORS origin'i                                   |

Backend, zorunlu değişkenlerden biri eksikse başlamayı reddeder. `API_KEY` ve `PROJECT_ID` asla frontend'e gönderilmez.

### Frontend

| Değişken       | Zorunlu | Açıklama                |
|----------------|---------|-------------------------|
| `VITE_API_URL` | Evet    | Backend'in temel URL'si |

---

## API

### Auth Rotaları (auth servisine iletilir)

| Metot  | Yol                         | Açıklama                                        |
|--------|-----------------------------|-------------------------------------------------|
| `POST` | `/api/auth/login`           | E-posta ve şifre ile giriş                      |
| `POST` | `/api/auth/register`        | Yeni kullanıcı kaydı                            |
| `POST` | `/api/auth/refresh`         | Access token'ı yenile                           |
| `POST` | `/api/auth/logout`          | Cookie'leri temizle ve refresh token'ı iptal et |
| `GET`  | `/api/auth/verify`          | Aktif token'ı doğrula                           |
| `PUT`  | `/api/auth/email`           | E-posta güncelle                                |
| `PUT`  | `/api/auth/change-password` | Şifre değiştir                                  |

### Snippet Rotaları

| Metot   | Yol                        | Açıklama                                                |
|----------|---------------------------|---------------------------------------------------------|
| `GET`    | `/api/snippets`           | Arama, dil ve etiket filtreleriyle snippet'leri listele |
| `GET`    | `/api/snippets/:id`       | Tek bir snippet getir                                   |
| `POST`   | `/api/snippets`           | Snippet oluştur                                         |
| `PUT`    | `/api/snippets/:id`       | Snippet güncelle                                        |
| `DELETE` | `/api/snippets/:id`       | Snippet sil                                             |
| `GET`    | `/api/snippets/languages` | Dilleri getir                                           |
| `GET`    | `/api/snippets/tags`      | Etiketleri getir                                        |
| `GET`    | `/api/snippets/categories`| Kategorileri getir                                      |

### Yapay Zeka Rotaları

| Metot  | Yol                | Açıklama                                      |
|--------|--------------------|-----------------------------------------------|
| `POST` | `/api/ai/generate` | Prompt'tan snippet üret                       |
| `POST` | `/api/ai/improve`  | Var olan snippet'i optimize et                |
| `POST` | `/api/ai/explain`  | Snippet'in ne yaptığını açıkla                |
| `POST` | `/api/ai/chat`     | Yapay zeka asistanıyla sohbet et              |
| `GET`  | `/api/ai/health`   | Yapay zeka sağlayıcısının durumunu kontrol et |

### Sağlık Kontrolü

| Metot | Yol       | Açıklama                                  |
|-------|-----------|-------------------------------------------|
| `GET` | `/health` | Temel sağlık kontrolü                     |
| `GET` | `/ping`   | Veritabanı bağlantısı ile sağlık kontrolü |

---

## Mimari Notları

### Kimlik bilgileri nerede tutulur

Frontend, backend'e yalnızca kullanıcı kimlik bilgilerini gönderir. Backend, auth servisine iletmeden önce kendi `API_KEY` ve `PROJECT_ID` değerlerini ekler. Tarayıcı bu değerleri hiçbir zaman görmez.

Eski akış:

    frontend + LogReg → auth service

Yeni akış:

    frontend + LogReg → backend → auth service

Bu değişiklik özellikle `apiKey` ve `projectId` değerlerinin DevTools'ta görünmesini engellemek için yapıldı.

### Oturumlar nerede tutulur

Backend, başarılı bir giriş veya kayıttan sonra HTTP-only cookie'ler ayarlar. Frontend, access token veya refresh token'a doğrudan dokunmaz. Bir istek 401 döndürdüğünde frontend bir kez `/api/auth/refresh` çağırır ve orijinal isteği tekrarlar. Refresh başarısız olursa kullanıcı `/login` sayfasına yönlendirilir.

### Yapay zeka özellikleri nerede çalışır

Yapay zeka istekleri, Groq API anahtarını elinde tutan backend üzerinden geçer. Frontend, Groq anahtarını hiçbir zaman görmez.

---

## Karşılaşılan Sorunlar ve Çözümleri

Bu projeyi geliştirirken ve deploy ederken karşılaştığım sorunlar ve bunlara bulduğum çözümler.

### Deploy edilmiş bir ortam için yapay zeka sağlayıcısı seçmek

**Sorun:** Ollama yerelde çalışıyordu ama deploy edilmiş bir sunucuda çalışmıyordu. Yapay zeka özellikleri Render'da daha başlamadan ölü olacaktı.

**Çözümüm:** Yapay zeka sağlayıcısı olarak Groq'a geçtim. Groq'un barındırılan bir API'si var ve hem yerelde hem de üretimde çalışıyor, böylece her yerde aynı model kullanılıyor.

---

### Groq modelinin kullanımdan kaldırılması

**Sorun:** 2026 yılının Ağustos ayı civarında, kullandığım Groq modeli olan `llama-3.3-70b-versatile` kullanımdan kaldırıldı ve kapatıldı. Yapay zeka özellikleri benim tarafımda hiçbir kod değişikliği olmadan çalışmayı bıraktı.

**Çözümüm:** Şu anda kullanılan `openai/gpt-oss-120b` modeline geçtim. Model adı bir ortam değişkeninden okunuyor, bu yüzden gelecekteki geçişler yalnızca bir konfigürasyon değişikliği gerektiriyor.

---

### Yapay zekadan ham kod geliyordu, biçimlendirme yoktu

**Sorun:** Yapay zeka üzerinden bir snippet ürettiğimde, yanıt yapısız ham kod olarak geliyordu. Okunması ve kopyalanması zordu, ve yapay zeka asistanının cevaplarında da aynı sorun vardı.

**Çözümüm:** İki markdown renderer bileşeni yazdım; biri kod gösterimi için, biri yapay zeka asistanı sohbeti için. İkisi de `react-markdown`, `remark-gfm` ve `react-syntax-highlighter` kullanıyor. Bunları ayırmak, tek bir bileşenin iki işi birden yapmaya çalışması yerine her birini kendi kullanım durumuna göre ayarlamama olanak sağladı.

---

### Markdown kuralları yapay zeka asistanı sohbetine sızıyordu

**Sorun:** Aynı markdown renderer hem yapay zeka asistanı hem de kod üretimi için kullanılıyordu. Asistanda bazı düz metin yanıtları markdown kurallarıyla sarılıyordu, bu da görsel bozukluklara, garip boşluklara ve aslında markdown olmaması gereken mesajlarda bozuk biçimlendirmeye yol açıyordu.

**Çözümüm:** Renderer'ları ayırdım ve asistan renderer'ını daha akıllı hale getirdim. Mesajın gerçekten markdown sözdizimi (kalın yazı, başlıklar, listeler, alıntı blokları, tablolar, kod blokları) içerip içermediğini kontrol ediyor. İçermiyorsa içeriği boşlukları koruyarak düz metin olarak render ediyor. Açılış karşılama mesajı da ID'sinden tanınıp her zaman düz metin olarak render ediliyor.

---

### Markdown kod üzerine birden fazla kez uygulanıyordu

**Sorun:** Kod üretimi akışında, markdown kuralları zaten markdown ile sarılmış kod üzerine uygulanıyordu. Açıkla veya iyileştir özelliklerini her kullandığımda kod yeniden sarılıyor ve kod blokları üst üste birikiyordu.

**Çözümüm:** Herhangi bir yapay zeka çağrısından önce çalışan bir `stripCodeBlock` yardımcı fonksiyonu ekledim. Bu fonksiyon, kodu yapay zekaya göndermeden önce herhangi bir üçlü ters tırnak veya satır içi kod sarmalayıcısından çıkarıyor. Bu hem backend controller'larında hem de frontend `useAI` hook'unda yapılıyor, böylece kod açıklanmadan veya optimize edilmeden önce temiz oluyor.

---

### API anahtarları ve proje ID'leri DevTools'ta görünüyordu

**Sorun:** `apiKey` ve `projectId`, frontend'den LogReg paketi üzerinden doğrudan auth servisine gönderiliyordu. Bu, değerlerin ağ sekmesinde ve bakmak isteyen her yerde görünmesi anlamına geliyordu.

**Çözümüm:** Veri akışını tersine çevirdim. Frontend artık yalnızca kendi backend'imle konuşuyor, backend de auth servisine iletmeden önce kendi kimlik bilgilerini ekliyor. LogReg buna göre güncellendi ve `apiKey` ile `projectId` prop olarak tamamen kaldırıldı.

Bu değişikliği yakalayan commit şuydu: "corrected the authentication flow by changing direction of authorization from frontend to auth-service, to frontend to backend to auth-service, to prevent apiKey and projectID leak."

---

### OAuth ve şifre sıfırlama, production da CSP problemi

**Sorun:** OAuth2 girişi ve şifremi unuttum/şifre sıfırlama sayfaları yerelde çalışıyor ama canlı deployment'ta başarısız oluyor. Canlı sunucudaki CSP header'ları yönlendirmeleri blokluyor. Bu, auth servisinde takip edilen aynı CSP sorunudur.

**Çözümüm:** OAuth ve şifre sıfırlama özellikleri şimdilik canlı deployment'ta devre dışı bırakıldı. Yerelde hala çalışıyorlar. Düzeltme auth servisinde üzerinde çalışılıyor, o çözüldüğünde frontend değişiklik yapmadan bunu alacak.

---

### Kullanıcılara ham hata mesajları gösterilmesi

**Sorun:** Bir şeyler ters gittiğinde kullanıcılar "Unauthorized" veya "Refresh token is invalid" gibi ham metinler görüyordu. Bunlar hata ayıklama için faydalı ama normal bir kullanıcı için anlamsız.

**Çözümüm:** Backend'deki hata yanıtlarını insan tarafından okunabilir mesajlarla sardım. Frontend, ham backend metni yerine bu mesajları gösteriyor. Örneğin girişte 401, "Unauthorized" yerine "Invalid email or password" oluyor. Auth servisinden gelen 429, bekleyip tekrar denemeyi söyleyen dostane bir mesaja dönüşüyor.

---

### İlk deploy'da ortam değişkenleri ve CORS problemi

**Sorun:** Render'a ilk kez deploy ettiğimde ortam değişkenleri ayarlanmamıştı çünkü GitHub'a hiç commit edilmemişlerdi (`.gitignore` içindeler, ki bu doğru). Servis boş değerlerle başladı ve çalışmayı reddetti. Üstüne üstlük, CORS origin listesi hala `localhost` URL'leriyle doluydu, bu yüzden deploy edilen frontend backend tarafından reddediliyordu.

**Çözümüm:** Gerekli her değişkeni Render paneline ekledim ve CORS izin listesini Render'ın verdiği deploy edilmiş URL'leri kullanacak şekilde değiştirdim. Şimdi origin'ler mümkün olduğunca ortam değişkenlerinden okunuyor, böylece gelecekteki deployment'lar yeni bir URL eklemek için kod değişikliği gerektirmiyor.

---

## Docker

### Backend

    docker build -t snippet-backend ./backend
    docker run -p 3002:3002 --env-file ./backend/.env snippet-backend

Backend Dockerfile'ı başlangıçta `prisma migrate deploy` çalıştırır, böylece migration'lar otomatik uygulanır.

### Frontend

    docker build \
      --build-arg VITE_API_URL=https://your-backend-url \
      -t snippet-frontend ./frontend
    docker run -p 3000:3000 snippet-frontend

Frontend imajı, yenilemede istemci taraflı yönlendirmenin çalışması için `try_files` fallback'i ile Nginx tarafından sunulur.

---

## Veritabanı Şeması

| Model     | Amaç                                                                                                          |
|-----------|---------------------------------------------------------------------------------------------------------------|
| `Snippet` | Başlık, açıklama, kod, dil, etiketler, kategori, yapay zeka meta verileri ve sahibiyle birlikte kod snippet'i |

Hızlı filtreleme için `userId`, `language` ve `tags` üzerinde indekslenmiştir.

---

## Lisans

MIT
