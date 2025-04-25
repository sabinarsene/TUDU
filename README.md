# TUDU - Aplicație de schimb de servicii

TUDU este o platformă completă pentru schimbul de servicii și gestionarea cererilor. Aplicația permite utilizatorilor să publice servicii pe care le pot oferi, să posteze cereri pentru servicii de care au nevoie și să comunice cu alți utilizatori.

## Caracteristici principale

- **Autentificare & Gestionare utilizatori**
  - Înregistrare și autentificare utilizatori
  - Configurare și gestionare profil
  - Autentificare bazată pe JWT
  - Imagini de profil și date utilizator

- **Servicii & Cereri**
  - Utilizatorii pot posta servicii pe care le oferă
  - Utilizatorii pot posta cereri pentru servicii de care au nevoie
  - Pagini detaliate pentru servicii și cereri
  - Sistem de rezervare pentru servicii

- **Evaluări Utilizatori**
  - Utilizatorii se pot evalua reciproc după finalizarea unui serviciu
  - Sistem de evaluare cu stele și comentarii
  - Calcularea și afișarea evaluării medii pe profiluri
  - Gestionarea evaluărilor (adăugare, actualizare, ștergere)

- **Sistem de Mesagerie**
  - Chat în timp real între utilizatori
  - Gestionarea conversațiilor
  - Notificări pentru mesaje
  - Integrare Socket.IO pentru comunicare instantanee

- **Notificări**
  - Notificări de sistem pentru diverse evenimente
  - Gestionarea notificărilor

## Tehnologii folosite

### Frontend
- React.js
- Chakra UI
- React Context API
- React Router
- Module CSS

### Backend
- Node.js cu Express.js
- Supabase (PostgreSQL)
- JWT (JSON Web Tokens)
- Socket.IO

## Structura proiectului și relațiile dintre componente

### Frontend (/frontend)
- **/src**
  - **/components**: Componente UI reutilizabile
    - **Header.jsx**: Bara de navigare principală, conține logica pentru autentificare/deconectare
    - **Chat.jsx**: Componenta principală de chat folosită în ChatPage
    - **UserRating.jsx**: Afișează și permite adăugarea evaluărilor utilizatorilor
    - **RatingStars.jsx**: Componentă reutilizabilă pentru afișarea stelelor de evaluare
    - **ServiceCard.jsx/RequestCard.jsx**: Carduri pentru afișarea serviciilor/cererilor în liste
    - **LoginForm.jsx/SignUpForm.jsx**: Formulare pentru autentificare și înregistrare
    - **ProtectedRoute.jsx**: Wrapper pentru rutele protejate care necesită autentificare
  
  - **/pages**: Paginile aplicației
    - **HomePage.jsx**: Pagina principală cu lista de servicii și cereri recente
    - **ProfilePage.jsx**: Pagina de profil a utilizatorului cu detalii și servicii oferite
    - **ChatPage.jsx**: Pagina de chat cu listă de conversații și mesaje
    - **ServiceDetailsPage.jsx**: Pagină detaliată pentru un serviciu specific
    - **RequestDetailsPage.jsx**: Pagină detaliată pentru o cerere specifică
    - **BookingPage.jsx**: Pagină pentru rezervarea unui serviciu
    - **PostServicePage.jsx/PostRequestPage.jsx**: Pagini pentru crearea de servicii/cereri
    - **SettingsPage.jsx**: Pagină pentru setările utilizatorului
    - **NotificationsPage.jsx**: Pagină pentru gestionarea notificărilor
  
  - **/contexts**: Provideri de context React
    - **AuthContext.jsx**: Gestionarea stării de autentificare la nivel global
    - **SocketContext.jsx**: Gestionarea conexiunii Socket.IO pentru chat și notificări
    - **MessageContext.jsx**: Context pentru gestionarea mesajelor și conversațiilor
  
  - **/services**: Module de servicii API
    - **authService.js**: Funcții pentru autentificare și gestionarea token-urilor
    - **serviceApi.js**: Funcții pentru interacțiunea cu API-ul de servicii
    - **requestApi.js**: Funcții pentru interacțiunea cu API-ul de cereri
    - **messageApi.js**: Funcții pentru interacțiunea cu API-ul de mesaje
    - **EncryptionService.js**: Funcții pentru criptarea datelor sensibile
    - **E2EEncryptionService.js**: Implementare End-to-End Encryption pentru mesaje
    - **SecureFileService.js**: Gestionarea securizată a încărcării fișierelor
    - **ChunkedFileService.js**: Încărcarea fișierelor mari în segmente
  
  - **/utils**: Funcții utilitare
  - **/assets**: Resurse statice
  - **/config**: Fișiere de configurare

### Backend (/backend)
- **/routes**: Endpoint-uri API grupate pe funcționalități
  - **auth.js**: Rute pentru autentificare și înregistrare
  - **users.js**: Rute pentru informații și evaluări utilizator
  - **services.js**: Rute pentru gestionarea serviciilor
  - **requests.js**: Rute pentru gestionarea cererilor
  - **profile.js**: Rute pentru gestionarea profilului
  - **messages.js**: Rute pentru sistemul de mesagerie
  
- **/models**: Modele de date și logică de business
  - **UserRating.js**: Model pentru gestionarea evaluărilor utilizatorilor
  
- **/middleware**: Middleware Express
  - **auth.js**: Middleware pentru verificarea token-urilor JWT
  
- **/services**: Servicii de logică de business
  - **socketService.js**: Gestionarea conexiunilor Socket.IO pentru chat
  
- **/public**: Fișiere statice
- **server.js**: Configurare și inițializare server
- **db.js**: Conexiune la baza de date și funcții utilitare

## Fluxuri de date și interacțiuni între componente

### Autentificare
1. Utilizatorul completează **LoginForm.jsx**
2. **authService.js** trimite cererea către `/api/auth/login`
3. Backend-ul verifică credențialele și returnează un JWT
4. **AuthContext.jsx** stochează token-ul și informațiile utilizatorului
5. **Header.jsx** și alte componente se actualizează pentru a reflecta starea de autentificare

### Postare serviciu
1. Utilizatorul completează formularul din **PostServicePage.jsx**
2. Imaginile sunt procesate prin **SecureFileService.js** pentru încărcare securizată
3. **serviceApi.js** trimite datele către `/api/services`
4. Backend-ul salvează serviciul în baza de date
5. Utilizatorul este redirecționat către pagina de detalii a serviciului

### Comunicare prin chat
1. Utilizatorul accesează **ChatPage.jsx**
2. **SocketContext.jsx** stabilește o conexiune Socket.IO cu serverul
3. Mesajele anterioare sunt încărcate prin **messageApi.js** de la `/api/messages/:userId`
4. Mesajele noi sunt trimise prin Socket.IO și criptate prin **E2EEncryptionService.js**
5. **MessageContext.jsx** actualizează interfața în timp real când sosesc mesaje noi

### Sistemul de evaluări
1. Utilizatorul vizualizează un profil în **ProfilePage.jsx**
2. **UserRating.jsx** încarcă evaluările existente prin `/api/users/:userId/ratings`
3. Utilizatorul poate adăuga o evaluare care este trimisă la backend
4. Backend-ul actualizează ratingul mediu al utilizatorului
5. Interfața se actualizează pentru a reflecta noua evaluare

## Cum să rulezi aplicația

### Opțiunea 1: Pornire automată (Recomandată)
```powershell
./start-all.ps1
```
Acest script pornește atât backend-ul cât și frontend-ul.

### Opțiunea 2: Pornire manuală

1. **Pornirea backend-ului**:
```powershell
cd backend
./start-server.ps1
```

2. **Pornirea frontend-ului** (într-o fereastră de terminal separată):
```powershell
cd frontend
npm start
```

## Endpoint-uri API Backend

### Autentificare
- `POST /api/auth/register` - Înregistrare utilizator nou
- `POST /api/auth/login` - Autentificare utilizator
- `GET /api/auth/verify` - Verificare token JWT

### Utilizatori și Profiluri
- `GET /api/users/:userId` - Obținere informații utilizator
- `GET /api/users/:userId/ratings` - Obținere evaluări utilizator
- `POST /api/users/:userId/ratings` - Adăugare/actualizare evaluare
- `DELETE /api/users/:userId/ratings/:ratingId` - Ștergere evaluare
- `GET /api/profile` - Obținere profil utilizator curent
- `PUT /api/profile` - Actualizare profil

### Servicii
- `GET /api/services` - Obținere toate serviciile
- `GET /api/services/:serviceId` - Obținere serviciu specific
- `POST /api/services` - Creare serviciu nou
- `PUT /api/services/:serviceId` - Actualizare serviciu
- `DELETE /api/services/:serviceId` - Ștergere serviciu

### Cereri
- `GET /api/requests` - Obținere toate cererile
- `GET /api/requests/:requestId` - Obținere cerere specifică
- `POST /api/requests` - Creare cerere nouă
- `PUT /api/requests/:requestId` - Actualizare cerere
- `DELETE /api/requests/:requestId` - Ștergere cerere

### Mesaje
- `GET /api/messages` - Obținere toate conversațiile
- `GET /api/messages/:userId` - Obținere mesaje cu un utilizator specific
- `POST /api/messages/:userId` - Trimitere mesaj

## Diagrama bazei de date și relații

Principalele tabele din baza de date și relațiile lor:

- **users** - Informații utilizator
  - Relații: one-to-many cu services, requests, messages, user_ratings

- **services** - Servicii oferite de utilizatori
  - Relații: many-to-one cu users

- **requests** - Cereri pentru servicii
  - Relații: many-to-one cu users

- **messages** - Mesaje între utilizatori
  - Relații: many-to-one cu users (sender și receiver)

- **user_ratings** - Evaluări pentru utilizatori
  - Relații: many-to-one cu users (user_id și rated_by)

## Direcții de dezvoltare viitoare

### Caracteristici planificate
1. **Sistem de plăți integrat**
   - Integrare cu Stripe sau PayPal pentru plăți securizate
   - Implementarea portofelului electronic pentru tranzacții în aplicație
   - Sistem de facturare și receipturi

2. **Îmbunătățiri de securitate**
   - Autentificare în doi factori (2FA)
   - Analiza avansată a comportamentului de autentificare
   - Detecția automată a activității suspecte

3. **Extinderea sistemului de notificări**
   - Notificări push pentru dispozitive mobile
   - Notificări prin email pentru evenimente importante
   - Setări avansate de personalizare a notificărilor

4. **Îmbunătățiri ale chat-ului**
   - Trimiterea de fișiere și imagini în chat
   - Apeluri audio/video între utilizatori
   - Mesaje programate și mesaje template

5. **Analytics și insights**
   - Dashboard pentru utilizatori cu statistici personale
   - Recomandări inteligente de servicii bazate pe istoricul utilizatorului
   - Analiza tendințelor și popularității serviciilor

### Probleme tehnice de rezolvat
1. **Optimizare de performanță**
   - Implementarea de caching pentru reducerea timpilor de încărcare
   - Optimizarea interogărilor SQL pentru tabelele cu multe înregistrări
   - Implementarea lazy loading pentru imagini și componente

2. **Responsive design**
   - Îmbunătățirea experienței pe dispozitive mobile
   - Implementarea unei versiuni progressive web app (PWA)

3. **Testare**
   - Implementarea testelor unitare pentru componentele frontend
   - Testare automată end-to-end cu Cypress sau Playwright
   - Testarea de securitate și audit

## Acces de pe alte dispozitive

Pentru a accesa aplicația de pe alte dispozitive din aceeași rețea:

1. **Află adresa IP a computerului** pe care rulează aplicația
2. **Accesează aplicația** de pe celălalt dispozitiv folosind adresa:
   ```
   http://IP_COMPUTER:3000
   ```
3. **Important**: Asigură-te că:
   - Ambele dispozitive sunt conectate la aceeași rețea
   - Firewall-ul computerului permite conexiuni pe porturile 3000 și 5000
   - Aplicația backend rulează pe computerul tău

## Dezvoltare

### Baza de date
- Aplicația folosește Supabase (PostgreSQL) pentru stocarea datelor
- Tabele principale: users, services, requests, user_ratings, messages
- Fișierul `schema.sql` conține structura completă a bazei de date
- Fișierul `user_ratings.sql` conține comenzile pentru crearea tabelului de evaluări

### Securitate
- Folosește JWT pentru autentificare cu o durată de expirare configurabilă
- Include servicii de securitate precum EncryptionService și E2EEncryptionService pentru protecția datelor
- Gestionare securizată a fișierelor prin SecureFileService cu verificarea tipurilor MIME
- Validarea și sanitizarea input-urilor utilizatorilor pentru prevenirea atacurilor XSS și SQL Injection

### Deployment
- Pentru deploy în producție, configurează setările CORS în server.js
- Setează variabilele de mediu corespunzătoare în fișierele .env
- Consideră utilizarea Docker pentru containerizare și deployment consistent 