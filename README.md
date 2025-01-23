# Kantor

Aplikacja desktopowa służąca do obsługi wymiany walut, zbudowana w React jako PWA. Projekt pozwala na przeglądanie kursów walut, dokonywanie wpłat, wypłat oraz wymianę walut.

---

## Link do aplikacji

Aplikacja została wdrożona na Firebase Hosting i jest dostępna pod adresem:  
👉 **[https://kantor-9243d.web.app](https://kantor-9243d.web.app)**

---

## Funkcjonalności

- **Rejestracja i logowanie użytkowników** z wykorzystaniem Firebase Authentication.
- **Wpłaty i wypłaty walut** dla zalogowanych użytkowników, z zapisaniem danych w Firebase Firestore.
- **Przegląd portfela walut**: pokazuje aktualne saldo użytkownika w różnych walutach.
- **Historia kursów walut**: średnie roczne kursy z ostatnich 10 lat oraz średnia 20-letnia.
- **Obsługa offline**: aplikacja działa w trybie offline dzięki PWA i Service Worker.
- **Instalator dla Windows**: aplikacja dostępna jako plik `.exe`.

---

## Instalacja

### **Dla użytkowników końcowych**

1. https://kantor-9243d.web.app
2. Dodaj aplikacje i ją zainstaluj

### **Dla programistów**

1. Sklonuj repozytorium:
   git clone https://github.com/Terbuh/my-app.git
   cd my-app
   npm start
