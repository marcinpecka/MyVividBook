# Wdrażanie MyVividBook na Google Cloud Platform (GCP) przez GitHub

Ponieważ masz już kod na GitHubie, najprostszym i najbardziej profesjonalnym sposobem (Continuous Deployment) jest podłączenie repozytorium bezpośrednio do Cloud Run.

## Krok 1: Otwórz konsolę Google Cloud

1.  Wejdź na stronę: [https://console.cloud.google.com/run](https://console.cloud.google.com/run)
2.  Upewnij się, że masz wybrany odpowiedni projekt w górnym menu.

## Krok 2: Utwórz nową usługę

1.  Kliknij przycisk **"UTWÓRZ USŁUGĘ"** (Create Service).
2.  Wyświetli się formularz konfiguracji.

### Sekcja 1: Wdrażanie z repozytorium (Continuous Deployment)

1.  Zaznacz opcję: **"Wdróż w sposób ciągły nową wersję z repozytorium kodu źródłowego"** (Continuously deploy new revisions from a source repository).
2.  Kliknij przycisk **"SKONFIGURUJ CLOUD BUILD"** (Set up Cloud Build).
    *   **Dostawca (Provider)**: Wybierz **GitHub**.
    *   **Repozytorium (Repository)**: Wybierz `marcinpecka/MyVividBook`. (Może wymagać autoryzacji Twojego konta GitHub).
    *   **Gałąź (Branch)**: Wpisz `^main$`.
    *   **Typ kompilacji (Build Type)**: Wybierz **Dockerfile**. (Ścieżka źródłowa automatycznie ustawi się na `/Dockerfile`, to jest OK).
    *   Kliknij **Zapisz** (Save).

### Sekcja 2: Ustawienia usługi

1.  **Nazwa usługi**: Wpisz `my-vivid-book`.
2.  **Region**: Wybierz `europe-central2` (Warszawa) dla najniższych opóźnień w Polsce.

### Sekcja 3: Uwierzytelnianie (Authentication)

1.  Zaznacz: **"Zezwalaj na wywoływanie nieuwierzytelnione"** (Allow unauthenticated invocations).
    *   Jest to kluczowe, aby Twoja strona była publicznie dostępna w Internecie.

### Sekcja 4: Rozwiń "Zmienne i klucze tajne" (Variables & Secrets) -> Kontener

1.  Kliknij zakładkę **ZMIENNE** (Variables) lub **ZMIENNE ŚRODOWISKOWE**.
2.  Kliknij "Dodaj zmienną" (Add Variable). Musisz dodać tutaj wszystkie klucze z pliku `.env.local`:
    *   **Nazwa**: `NEXT_PUBLIC_FIREBASE_API_KEY`, **Wartość**: `(skopiuj z pliku)`
    *   **Nazwa**: `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, **Wartość**: `...`
    *   **Nazwa**: `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, **Wartość**: `...`
    *   **Nazwa**: `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, **Wartość**: `...`
    *   **Nazwa**: `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, **Wartość**: `...`
    *   **Nazwa**: `NEXT_PUBLIC_FIREBASE_APP_ID`, **Wartość**: `...`
    *   **Nazwa**: `GEMINI_API_KEY`, **Wartość**: `...`

### Sekcja 5: Urządzenie (Resources) - Opcjonalnie

1.  Możesz zmniejszyć pamięć do **512 MiB** jeśli chcesz oszczędzić (dla małego ruchu wystarczy), lub zostawić 1 GB/2 GB domyślnie.
2.  CPU: 1 CPU wystarczy.

## Krok 3: Utwórz (Create)

1.  Kliknij przycisk **"UTWÓRZ"** (Create) na dole strony.

Google Cloud rozpocznie teraz proces:
1.  Pobierze kod z GitHuba.
2.  Zbuduje obraz Dockera w chmurze (to może potrwać 2-5 minut).
3.  Uruchomi usługę pod publicznym adresem URL (z końcówką `.a.run.app`).

## Jak aktualizować aplikację?

Od teraz, za każdym razem gdy zrobisz `git push origin main` na swoim komputerze, Google Cloud **automatycznie** wykryje zmianę, zbuduje nową wersję i zaktualizuje stronę po kilku minutach. To jest pełne CI/CD!
