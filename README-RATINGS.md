# Sistem de evaluări pentru utilizatori TUDU

Acest document explică cum să rulați și să utilizați sistemul de evaluări pentru utilizatori în aplicația TUDU.

## Structura sistemului de evaluări

Sistemul de evaluări pentru utilizatori constă din:

1. **Backend**:
   - Tabelul `user_ratings` în baza de date Supabase
   - Modelul `UserRating.js` pentru gestionarea evaluărilor
   - Rutele API în `routes/users.js` pentru operațiile CRUD pe evaluări

2. **Frontend**:
   - Componenta `UserRating.jsx` pentru afișarea și adăugarea evaluărilor
   - Funcțiile API în `services/serviceApi.js` pentru comunicarea cu backend-ul

## Cum să rulați aplicația

### Opțiunea 1: Rulare automată (recomandat)

Executați scriptul `start-all.ps1` din directorul principal:

```powershell
./start-all.ps1
```

Acest script va porni atât backend-ul cât și frontend-ul.

### Opțiunea 2: Rulare manuală

1. **Pornirea backend-ului**:
   ```powershell
   cd tudu-backend
   ./start-server.ps1
   ```

2. **Pornirea frontend-ului** (într-o altă fereastră de terminal):
   ```powershell
   ./start-frontend.ps1
   ```

## Funcționalități ale sistemului de evaluări

Sistemul de evaluări permite:

1. **Vizualizarea evaluărilor** pentru un utilizator
2. **Adăugarea unei evaluări** pentru un utilizator (trebuie să fiți autentificat)
3. **Actualizarea unei evaluări** existente
4. **Ștergerea unei evaluări** (doar evaluările proprii)

## Endpoint-uri API

Sistemul de evaluări expune următoarele endpoint-uri API:

- `GET /api/users/:userId/ratings` - Obține toate evaluările pentru un utilizator
- `POST /api/users/:userId/ratings` - Adaugă sau actualizează o evaluare pentru un utilizator
- `DELETE /api/users/:userId/ratings/:ratingId` - Șterge o evaluare

## Depanare

Dacă întâmpinați probleme cu sistemul de evaluări, verificați:

1. **Consola browserului** pentru erori frontend
2. **Consola backend-ului** pentru erori server
3. **Baza de date** pentru a verifica dacă tabelul `user_ratings` a fost creat corect

## Limitări cunoscute

- Un utilizator nu își poate evalua propriul profil
- Evaluările pot fi între 1 și 5 stele
- Comentariile sunt opționale

## Accesarea aplicației de pe alte dispozitive

Pentru a accesa aplicația de pe alte dispozitive (cum ar fi telefonul) din aceeași rețea:

1. **Află adresa IP a computerului** pe care rulează aplicația:
   - În Windows: Deschide Command Prompt și rulează `ipconfig`
   - În macOS/Linux: Deschide Terminal și rulează `ifconfig` sau `ip addr`

2. **Accesează aplicația** de pe celălalt dispozitiv folosind adresa IP:
   ```
   http://IP_COMPUTER:3000
   ```
   De exemplu: `http://192.168.1.5:3000`

3. **Important**: Asigură-te că:
   - Ambele dispozitive sunt conectate la aceeași rețea
   - Firewall-ul computerului permite conexiuni pe porturile 3000 și 5000
   - Aplicația backend rulează pe computerul tău

Notă: Aplicația a fost actualizată pentru a funcționa automat cu adresa IP a computerului, fără a fi nevoie de configurări suplimentare 