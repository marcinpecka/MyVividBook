# Jak uruchomić aplikację MyVividBook w Google Cloud Platform (GCP)

Najlepszym sposobem na uruchomienie tej aplikacji Next.js w GCP jest użycie usługi **Cloud Run**. Jest to usługa serverless, która automatycznie skaluje kontenery.

## Wymagania wstępne

1.  Posiadanie projektu w Google Cloud Platform.
2.  Zainstalowane narzędzie `gcloud` CLI (lub używanie Cloud Shell w przeglądarce).
3.  Włączone API:
    *   Cloud Run API
    *   Cloud Build API
    *   Artifact Registry API

## Krok 1: Przygotowanie

Aplikacja ma już przygotowany `Dockerfile` oraz konfigurację `output: 'standalone'` w `next.config.ts`.

## Krok 2: Konfiguracja zmiennych środowiskowych

Musisz zebrać swoje zmienne środowiskowe z pliku `.env.local`:
*   `NEXT_PUBLIC_FIREBASE_API_KEY`
*   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
*   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
*   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
*   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
*   `NEXT_PUBLIC_FIREBASE_APP_ID`
*   `GEMINI_API_KEY`

## Krok 3: Wdrażanie (Deployment)

Możesz wdrożyć aplikację bezpośrednio z kodu źródłowego za pomocą jednej komendy. Uruchom to w folderze projektu:

```bash
gcloud run deploy my-vivid-book \
  --source . \
  --platform managed \
  --region europe-central2 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_FIREBASE_API_KEY="TWOJ_KLUCZ",NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="twoj-projekt.firebaseapp.com",GEMINI_API_KEY="TWOJ_KLUCZ_GEMINI"
  # (Kon pamiętaj aby dodać wszystkie zmienne!)
```

**Uwaga:** Powyższa komenda automatycznie:
1.  Spakuje Twój kod.
2.  Wyśle go do Cloud Build.
3.  Stworzy obraz Dockera.
4.  Wdroży go na Cloud Run.

## Alternatywa: Użycie GitHub Actions (CI/CD)

Jeśli kod jest na GitHubie, możesz w konsoli GCP Cloud Run ustawić "Continuos Deployment" (Ciągłe wdrażanie), wskazując swoje repozytorium. Google sam skonfiguruje proces budowania przy każdym `git push`.
