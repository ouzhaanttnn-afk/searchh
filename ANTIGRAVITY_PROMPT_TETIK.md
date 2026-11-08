# ANTIGRAVITY PROMPT — TETİK / Trigger Point

> Bu dosyanın tamamını tek prompt olarak Antigravity'ye ver. Kaynaklar ve gerekçeler en altta (§12), onlar da prompta dahil; Antigravity kararların nedenini bilsin.

---

Sen kıdemli bir mobil oyun ekibisin: oyun tasarımcısı, fizik programcısı, görsel yönetmen, monetizasyon ve LiveOps uzmanı aynı anda. Aşağıdaki spesifikasyona göre **TETİK** (global mağaza adı: **Trigger Point**) adlı mobil bulmaca oyununu sıfırdan üret. Bu belge dışında hiçbir önceki projeye, hafızaya veya varsayıma dayanma. Belirsiz bir nokta varsa önce bana sor, sonra üret.

## 0. Çalışma kuralları

- Önce **M0** kilometre taşını üret, onayımı al, sonra devam et. Kilometre taşları §11'de.
- Her kilometre taşında: çalışan derleme, kısa bir CHANGELOG, bilinen sorunlar listesi.
- Kod dili TypeScript. Hiçbir yerde `any` kullanma. Testler Vitest.
- Mağaza metinleri ve oyun içi metinler İngilizce yazılır, Türkçe çevirisi eklenir. Oyun arayüzü metinsiz çalışacak şekilde tasarlanır; metin yalnızca menü ve mağazada.
- Telif korumalı hiçbir oyunun adını, karakterini, sesini veya görsel dilini kopyalama.

## 1. Oyun tek cümlede

Ekranda donmuş bir zincirleme reaksiyon düzeneği var (domino, rampa, sarkaç, makara, top). Oyuncunun **tek bir dokunuş hakkı** var. Doğru parçaya doğru etkiyi uygularsa düzenek çalışır ve top hedefe ulaşır. Oyunun özü refleks değil, **fizik tahmini**: "Bu düzenekte hangi parça her şeyi başlatır?"

Bu oyunu farklı kılan dört şey, hepsi zorunlu:

1. **Tek tetik, benzersiz çözüm.** Her bölümün tam olarak bir doğru tetiği var; çözücü (§6) bunu garanti eder.
2. **Günün Düzeneği.** Herkese aynı bölüm, tek deneme hakkı, Wordle tarzı paylaşım kartı.
3. **Oyun kendi videosunu üretir.** Her başarılı çözüm, oyun içinden tek dokunuşla 9:16 dikey klip olarak dışa aktarılır (§8).
4. **Zincir melodiye dönüşür.** Her çarpışma bir nota; doğru çözüm akorla biter (§7).

## 2. Platform ve teknoloji

- **Motor:** TypeScript + **Matter.js** (2D fizik) + Canvas/WebGL render (PixiJS v8). Capacitor ile iOS'a sarılır. Android ikinci faz.
- **Deterministik fizik şart:** Matter.js'i sabit zaman adımıyla (1/120 sn) çalıştır, `Matter.Engine.update` çağrılarını `requestAnimationFrame`'den ayır, rastgelelik için kendi seed'li PRNG'ini kullan (Matter.Common.random'ı seed'le). Aynı bölüm + aynı tetik her cihazda aynı sonucu vermeli. Bunu bir testle doğrula: 50 bölümü 3 farklı zaman çarpanıyla çalıştır, sonuçlar birebir aynı olmalı.
- **Ekran:** Dikey (portrait), 9:16 güvenli alan; iPhone SE'den iPad'e kadar.
- **Çevrimdışı çalışır.** Yolculuk modu tamamen yerel. Günün Düzeneği için bölüm verisi 30 gün önceden paketlenir, sunucu yalnızca istatistik toplar.
- **Backend (minimum):** Cloudflare Workers + KV/D1. Yalnızca iki uç nokta: `POST /daily/result` (anonim, cihaz başı günde bir) ve `GET /daily/stats/:id`. Hesap, giriş, kişisel veri yok.
- **Analitik:** Kendi event şemanla (anonim), bir ücretsiz katman (örn. PostHog veya Firebase Analytics). ATT izni istenmeyecek şekilde kur (IDFA kullanma).
- **Reklam:** AppLovin MAX **veya** Google AdMob mediasyon (tek SDK seç, ikisini birden ekleme). Gelir mantığını `AdService` arayüzü arkasına soyutla; test derlemelerinde sahte servis.
- **IAP:** StoreKit 2 (Capacitor eklentisiyle). Tüm ürünler **consumable olmayan**; abonelik yok.

## 3. Çekirdek döngü

1. **Gözle (3-15 sn):** Düzenek donmuş. Parmağını parçaların üstünde gezdirince parça vurgulanır ve uygulanacak etki ikonu belirir. **Simülasyon önizlemesi yok**; tahmin etmek oyunun kendisi.
2. **Tetikle (tek dokunuş):** Dört etki türü, dünyalar ilerledikçe açılır:
   - **ÇEK** — parçayı yok et (Dünya 1'den itibaren)
   - **İT** — parçaya tek yönlü küçük itki; yön, parça üzerindeki okla sabit (Dünya 2)
   - **ÇEVİR** — rampa/kapağı 90° döndür (Dünya 4)
   - **KİLİTLE** — hareketli bir parçayı sabitle; "ne olmamalı" düşüncesi (Dünya 7)
   Her parça yalnızca **bir** etki türünü kabul eder; bu, parçanın malzeme/şekliyle görsel olarak bellidir (ör. çatlak parçalar ÇEK'ilir, oklu parçalar İT'ilir).
3. **İzle (5-12 sn):** Fizik oynar. Son 1,5 saniye otomatik ağır çekim. Top hedefe girince parçacık patlaması ve akor.
4. **Sonuç ekranı:** Yıldız (ilk denemede çözüm), "Oyuncuların %NN'i ilk denemede çözdü", **Paylaş** ve **Klip Kaydet** düğmeleri.
5. **Yanlış tetik:** Düzenek yanlış çalışır; komik "neredeyse" animasyonu. **Geri Sar** düğmesi. Can/enerji sistemi **yok**, deneme sınırsız; yalnızca ilk deneme yıldızı gider. (Gerekçe: §12-C.)

Hedef bölüm süresi 20-40 sn. Oturum hedefi 6-10 bölüm.

## 4. Modlar

| Mod | İçerik | Rol |
|---|---|---|
| **Yolculuk** | 12 dünya × 30 bölüm = 360 bölüm. Her dünya yeni parça ailesi getirir (sırasıyla: Ahşap domino → Cam ve rampa → Sarkaç → Makara ve ip → Su ve yüzme → Mıknatıs → Dişli → Jöle/yumuşak cisim → Rüzgâr → Portal → Ayna/lazer → Hepsi karışık) | Ana ilerleme, reklam ve "ipucu" ekonomisi |
| **Günün Düzeneği** | Herkese aynı bölüm (UTC 00:00). **Tek deneme.** Sonuç ertesi güne kadar gizli; paylaşım kartı anında | Günlük geri dönüş, sosyal yayılım |
| **Usta Düzenekleri** | 2 tetikli bölümler, sıra önemli. 6 paket × 20 bölüm | Mid-core, ücretli |
| **Atölye** (v1.2) | Oyuncu düzenek kurar, çözücü "tek çözümlü mü" onaylar, kodla paylaşılır | Kullanıcı üretimi içerik, içerik açlığına karşı |

Paylaşım kartı (yalnızca emoji ve metin, spoiler vermez):
```
TRIGGER POINT · Daily #142
🟩 First try · ⏱ 9s thinking
31% of players solved it
triggerpoint.app/d/142
```

## 5. Zorluk eğrisi ve içerik hızı

- Yolculuk'ta ilk 20 bölümde ilk deneme başarı oranı hedefi %70-85, Dünya 3'ten sonra %35-55, Usta'da %15-30. Bu oranları analitikle ölç ve sınırların dışına çıkan bölümleri otomatik olarak işaretle.
- Her dünyanın 10., 20. ve 30. bölümü "imza bölüm": uzun zincir, belirgin tema, klip için tasarlanmış.
- Bulmaca oyunlarının bilinen riski içeriğin hızla tükenmesi (§12-A). Çözüm: üretici + çözücü (§6) ile her ay 1 yeni dünya ve 30 Günün Düzeneği bölümü, insan kürasyonu yalnızca son %3 için.

## 6. Bölüm üreticisi ve çözücü (teknik çekirdek)

Ayrı bir Node paketi: `packages/forge`.

1. **Üretici:** Şablon gramerli prosedürel üretim. Her şablon: parça aileleri, giriş noktası (topun başlangıcı), hedef, 5-14 parça, 1 doğru tetik adayı + 3-8 çeldirici.
2. **Çözücü:** Her olası (parça × etki) tetiğini deterministik fizikte simüle eder, en fazla 15 sn oyun zamanı.
3. **Kabul kriterleri (hepsi zorunlu):**
   - Tam olarak **1** tetik başarılı (Usta'da tam olarak 1 sıralı çift).
   - **Sağlamlık:** Doğru tetik ±%1 konum ve ±%1 kütle sapmasıyla 20/20 başarılı; her yanlış tetik 20/20 başarısız. Kayan nokta farkları çözümü asla değiştirmemeli.
   - **"Neredeyse" skoru:** En az 2 yanlış tetik, topu hedefin 1,5 top çapı yakınına getirmeli (komik başarısızlık için).
   - **Göze batmazlık:** Doğru parça topa en yakın parça olmamalı (Dünya 1 hariç).
4. **Zorluk puanı:** doğru parçanın topa uzaklığı + zincirdeki sırası + "neredeyse" çeldirici sayısı + zincir uzunluğu. 0-100 arası normalize et.
5. **Çıktı:** `levels/*.json` (parçalar, tetik, zorluk, imza klip zamanlaması). Oyuna gömülür.
6. **Kürasyon aracı:** Basit bir web sayfası: üretilen bölümü oynat, kabul/ret, etiket. Claude API ile isteğe bağlı bölüm adı ve ipucu metni üretimi (ayarlardan kapatılabilir; API anahtarı yalnızca `.env`'de).

## 7. Görsel ve ses kimliği (nasıl üretileceğiyle birlikte)

**Yön:** "Karanlık atölye masası." Koyu füme arka plan (#14161B), mat pastel parçalar, tek vurgu rengi hedef için (sıcak amber #FFB347). Soyut, dil gerektirmez, tüm ülkelerde aynı okunur. Minimal ama **dokunsal**: her malzeme kendi gölge, kenar ve ses karakteriyle fark edilir.

**Nasıl üretilecek (zorunlu iş akışı):**
1. **Parçalar vektör, el yapımı:** Tüm parçalar kodda çizilen vektör şekiller veya SVG. Bitmap sprite kullanma; böylece her ekran yoğunluğunda keskin ve dosya boyutu küçük kalır. Her malzeme için bir **stil tokeni** dosyası (`materials.ts`): dolgu, kenar, gölge yumuşaklığı, çarpışma parçacık rengi, ses ailesi.
2. **Malzeme paleti (12 dünya için 12 malzeme):** ahşap (sıcak bej), cam (buzlu açık mavi, %30 saydam), çelik (gri-mavi, parlak kenar), halat (kirli sarı, kesikli çizgi), su (yarı saydam turkuaz, dalga shader'ı), mıknatıs (kırmızı/mavi kutup), dişli (bakır), jöle (pembe, yumuşak cisim deformasyonu), rüzgâr (görünmez, parçacık izi), portal (mor halka), ayna (gümüş çizgi), lazer (kırmızı ışın).
3. **Hareket dili:** Dokunuş anında 80 ms'lik "nefes" ölçeği (1.0 → 1.06 → 1.0). Çarpışmada 2-5 parçacık, asla daha fazla. Hedefe giriş: 400 ms ağır çekim, 12 parçacık, hafif ekran titremesi (ayardan kapatılabilir, `prefers-reduced-motion`'a saygı).
4. **Arayüz:** Tek yazı tipi (Inter veya benzeri açık lisanslı, değişken ağırlık). Düğmeler ikon öncelikli. Renk körlüğü için parçaların malzeme farkı yalnızca renge değil şekil ve dokuya da bağlı olmalı.
5. **İkon ve mağaza görselleri:** Uygulama ikonu: koyu zeminde tek amber top ve ona değmek üzere olan bir parmak izi silueti. Ekran görüntüleri: ilk görsel bir düzenek ve "Only ONE tap. Which piece?" metni. Görsel üretim aracı (Kling/Midjourney vb.) yalnızca **referans ve mağaza arka planı** için; oyun içi varlıklar vektör ve koddan.
6. **Ses:** Her malzemenin kendi nota ailesi (ahşap: marimba, cam: çan, çelik: titreşimli plaka, halat: pizzicato…). Zincir ilerledikçe notalar **bölüme özgü bir pentatonik diziden** seçilir; böylece her çözüm kulağa doğru gelen bir melodi olur. Doğru çözüm majör akorla, yanlış tetik çözümsüz (eksik) bir akorla biter. Sesleri Web Audio ile sentezle (örnekleme dosyası yok, boyut küçük kalır); 12 malzeme × 5 nota = 60 kısa sentez preset'i.

## 8. Klip dışa aktarma (büyüme motoru)

Her başarılı çözümde oyuncu **Klip Kaydet**'e basınca oyun, çözümü aynı deterministik fizikle yeniden oynatır ve 9:16, 1080×1920, 8-14 sn'lik bir MP4 üretir (Capacitor native kayıt veya `MediaRecorder`). Klip yapısı:
- 0-2 sn: donmuş düzenek, üstte "Only ONE tap. Which piece?" ve yanıp sönen `?`
- 2-3 sn: parmağın parçaya değişi
- 3-11 sn: zincir, son 1,5 sn ağır çekim
- Son kare: oyun logosu, bölüm numarası, "Daily #142"
Paylaşım sayfasına yönlendiren kısa link filigranı. Bu klipler oyuncu için paylaşım aracı, geliştirici için ise sıfır maliyetli Shorts/Reels içeriği.

## 9. Gelir modeli (araştırmaya dayalı, §12'de gerekçeler)

Hedef: **kendi kendini finanse eden** oyun. Ücretsiz indirme; reklam + tek seferlik satın almalar; abonelik yok.

### 9.1 Reklamlar
- **Geçiş reklamı (interstitial):** Yalnızca bölüm **sonuç ekranından sonra**, asla çözüm sırasında. Sıklık: ilk 10 bölüm hiç; sonra en fazla her 3 bölümde bir ve en az 120 sn aralıkla. Yanlış tetikten sonra gösterilmez (oyuncu zaten kaybetti; ikinci ceza kayıp yaratır).
- **Ödüllü reklam (rewarded) — "Daralt":** İpucu, doğru parçayı söylemez; ekranı dörde bölüp doğru parçanın olduğu çeyreği aydınlatır. Bölüm başına en fazla 1 "Daralt", 60 sn bekleme. Reklam dolmazsa ipucu yine verilir (güven için).
- **Ödüllü reklam — "Çift yıldız":** Günün Düzeneği'nde değil, yalnızca Yolculuk'ta; kozmetik para kazancını ikiye katlar.
- Reklam yükü ölçümü: oyuncu başına günlük reklam gösterimini kaydet; D1/D7 bağlılığını reklam maruziyetine göre kohortla. %43 bulmaca oyuncusu aşırı reklamda bırakıyor (§12-C); reklam sıklığı uzaktan yapılandırılabilir olsun.
- **Banner yok.** Görsel kimliği bozar, geliri düşük.

### 9.2 Satın almalar (hepsi tek seferlik, Apple/Google küçük işletme oranıyla %15 komisyon — §12-D)
| Ürün | Fiyat (US) | İçerik |
|---|---|---|
| **Reklamsız** | $3.99 | Tüm geçiş reklamları kalkar; ödüllü reklamlar isteğe bağlı kalır; +3 "Daralt" hakkı hediye |
| **Usta Paketi 1-6** | $1.99 her biri | 20 adet 2 tetikli bölüm + o dünyanın ses teması |
| **Atölye Paketi** | $9.99 | Reklamsız + Usta 1-6 + tüm temalar (en iyi değer rozeti; araştırma: tek başına "reklam kaldır"dan çok paket satar, §12-B) |
| **Malzeme temaları** | $0.99 | Alternatif malzeme paletleri (neon, kâğıt, retro) |

Reklamsız teklifi **ilk geçiş reklamından hemen sonra** bir kez gösterilir, sonra yalnızca mağazada. Agresif pop-up yok; güven ve yorum puanı organik büyümenin temeli.

### 9.3 Günün Düzeneği gelir kuralı
Günün Düzeneği'nde **hiç reklam ve ipucu yok.** Bu modun değeri eşitlik ve paylaşılabilirlik. Tek istisna: "Dünkü düzeneğin çözümünü izle" ödüllü reklamla açılır.

### 9.4 Hedef metrikler ve kapılar (yumuşak çıkıştan sonra)
- D1 ≥ %35, D7 ≥ %12, D30 ≥ %4 (bulmaca türü kıyasları §12-E).
- ARPDAU hedefi $0.08-0.15 (hibrit casual bulmaca aralığı, §12-A).
- Günün Düzeneği katılımı DAU'nun ≥ %40'ı.
- Klip kaydetme oranı başarılı çözüm başına ≥ %3.
Kapılar: D1 < %30 ise ilk 10 bölüm yeniden tasarlanır; reklam maruziyeti kohortunda D7 farkı > 3 puan ise sıklık düşürülür.

## 10. Finansman ve pazarlama planı (sıfır UA bütçesiyle)

- **Kendi kendine yayın.** Yayıncı anlaşmaları 2026'da zorlaştı ve UA geri ödemesi öncelikli sözleşmeler küçük stüdyo için dezavantajlı (§12-F). Yayıncıya ancak organik çekiş kanıtlandıktan sonra, şartlar güçlüyken gidilir.
- **Organik kanal 1: Shorts/Reels/TikTok.** Oyun zaten her çözümü 9:16 klip yapıyor. Günde 1-3 klip, "Only ONE tap. Which piece?" kancası. İlk 2 saniye soruyla açılır (kanalda kalma problemi için).
- **Organik kanal 2: Günün Düzeneği paylaşım kartı.** Link, web'de o günün düzeneğini tarayıcıda oynatan hafif bir sayfaya gider (oyunun web derlemesi), oradan mağazaya.
- **Organik kanal 3: Yaratıcı tohumlama.** 10-20 küçük bulmaca yaratıcısına erken erişim ve "ilk deneme" meydan okuması; ücretsiz. (Puzzlit örneği §12-G.)
- **Yumuşak çıkış:** Önce 2-3 küçük İngilizce konuşan pazarda (Kanada, Yeni Zelanda, İrlanda), 4 hafta metrik toplanır, sonra global.
- **Mağaza optimizasyonu:** Anahtar kelimeler: physics puzzle, chain reaction, one tap, daily puzzle, brain teaser. İsim: "Trigger Point: One-Tap Puzzle".
- **Maliyet disiplini:** Backend ücretsiz katmanlarda kalmalı (Cloudflare). Reklam SDK'sı tek. Ses sentezli, görsel vektör; indirme boyutu < 60 MB.

## 11. Kilometre taşları

- **M0 — Oynanabilir çekirdek (hedef 2 hafta):** Deterministik Matter.js döngüsü, 4 etki türünden ÇEK ve İT, Dünya 1-2 malzemeleri, elle yapılmış 15 bölüm, sonuç ekranı, geri sar. Determinizm testi geçer. **Burada dur, onay al.**
- **M1 — Forge:** Üretici + çözücü + kürasyon aracı; 90 kabul edilmiş bölüm (Dünya 1-3). Ses sentezi. Paylaşım kartı.
- **M2 — Günün Düzeneği + klip:** Cloudflare uç noktaları, günlük mod, klip dışa aktarma, web oynatıcı sayfası.
- **M3 — Gelir ve ölçüm:** AdService (MAX veya AdMob), StoreKit 2, analitik, uzaktan yapılandırma, reklam kohortları.
- **M4 — İçerik ve cila:** Dünya 4-6, Usta Paketi 1-2, mağaza görselleri, 6 dil (EN, TR, DE, ES, FR, PT-BR), erişilebilirlik (renk körlüğü, azaltılmış hareket). TestFlight.
- **M5 — Yumuşak çıkış:** 3 ülke, 4 hafta, §9.4 kapıları.
- **v1.1+:** Dünya 7-12, Usta 3-6, Android. **v1.2:** Atölye.

## 12. Araştırma gerekçeleri ve kaynaklar (Kasım 2026)

**A. Pazar.** H1 2026'da bulmaca mobil türler içinde %20 büyüyerek $7,6 milyara çıktı; strateji %4, RPG %14 düştü. Hibrit casual bulmaca IAP'si yaklaşık $600M. En çok yeni oyun çıkan alt türlerde (Match-3: 120 yeni oyun, hiçbiri aylık $100K'yı geçemedi) kopyalar tutunamıyor; yeni mekanik getiren Pixel Flow! bir yıldan kısa sürede $125M+ kazandı. Bulmacanın riski oyuncuların içeriği hızla tüketmesi. ARPDAU için hibrit casual bulmaca aralığı $0.08-0.25 (vendor tahmini). Kaynaklar: [PocketGamer.biz tür analizi](https://www.pocketgamer.biz/h1-2026-genre-analysis-strategy-stumbles-rpgs-fall-and-puzzle-revenue-ramps-up/), [AppMagic H1 2026](https://appmagic.rocks/research/casual-report-H12026), [PocketGamer.biz bulmaca 2026](https://www.pocketgamer.biz/puzzle-games-rise-as-mobile-genres-compete-for-attention-in-2026/), [Galaxy4Games monetizasyon trendleri](https://galaxy4games.com/en/knowledgebase/blog/mobile-game-monetization-trends-2026-what-publishers-and-studios-should-track), [Playio hibrit casual](https://blog.playio.co/hybrid-casual-games-monetization).

**B. Pixel Flow dersleri.** Zorluk IAP'yi sürükler; IAP "sert" değer (güç, tekrar), ödüllü reklam "yumuşak" değer (can, çift para) olarak ayrılır; geçiş reklamları Reklamsız satın almayı anlamlı kılar; bölümler reklam kreatifi gibi görünür. Üst gelirli oyunların çoğu "reklam kaldır"ı tek başına değil paketle satıyor. Kaynaklar: [Deconstructor of Fun](https://www.deconstructoroffun.com/blog/2026/2/13/pixel-flow-the-publishers-dream), [AppSamurai](https://appsamurai.com/blog/pixel-flow-an-analysis-of-its-rapid-rise/), [PocketGamer.biz sort monetizasyonu](https://www.pocketgamer.biz/one-genre-three-strategies-how-magic-sort-knit-out-and-pixel-flow-are-redefining-sort-puzzle-monetisation/), [PocketGamer.biz top-100 interstitial/IAP](https://www.pocketgamer.biz/the-key-to-success-how-top-100-downloaded-games-implement-interstitial-ads-and-related-in-app-purchases).

**C. Reklam ve ipucu tasarımı.** Bulmaca oyuncularının %33'ü reklama olumlu, %43'ü aşırıysa bırakıyor. Öneriler: çözüm sırasında kesinti yok, ipucu için ödüllü reklamda bekleme süresi ve günlük sınır, reklam dolmazsa ödül yine verilir, bağlılık reklam maruziyetine göre ölçülür. ABD iOS ödüllü video eCPM'i 2026'da yaklaşık $13-30 arası (kaynağa göre değişir). Kaynaklar: [PocketGamer.biz anket](https://www.pocketgamer.biz/33-of-puzzle-gamers-view-ads-positively-but-43-will-quit-if-theyre-too-prevalent-how-can-game-makers-hit-the-sweet-spot), [CrazyGames rewarded rehberi](https://docs.crazygames.com/resources/rewarded-ads-deep-dive/), [Unity rewarded temelleri](https://unity.com/blog/the-fundamentals-of-rewarded-video-ad-placements), [Playio eCPM 2026](https://blog.playio.co/mobile-game-ecpm-benchmarks-2026), [Applixir rewarded kıyasları](https://www.applixir.com/blog/rewarded-video-quality-benchmarks-2026-completion-rates-viewability-user-engagement/).

**D. Komisyon.** Apple App Store Small Business Program ve Google Play 15% katmanı: yıllık $1M altı gelirde komisyon %15 (kayıt gerekli; Apple önceki yıl, Google cari yıl gelirine bakar). Kaynaklar: [Google Play destek](https://support.google.com/googleplay/android-developer/answer/10632485), [Apple duyurusu](https://www.businesswire.com/news/home/20201118005376/en/Apple-Announces-App-Store-Small-Business-Program), [2026 rehber](https://magora-systems.com/app-store-small-business-program/).

**E. Bağlılık kıyasları.** Bulmaca D1 yaklaşık %28-32, D7 %9-12, D30 %3,5-5 (kaynaklar çelişiyor; genel medyan D30 %1'in altına kadar iniyor). Üst çeyrek hedefi D1 %40+, D7 %20+. Kaynaklar: [Segwise bağlılık 2026](https://segwise.ai/blog/mobile-gaming-app-user-retention-strategies), [GameAnalytics 2026 kıyasları](https://gameindustrylibrary.com/documents/gameanalytics-mobile-and-pc-game-benchmarks-in-2026-sponsored-by-pwn-games/insights), [GameGrowthAdvisor KPI 2026](https://gamegrowthadvisor.com/blog/2026-03-17-mobile-game-kpis-benchmarks-2026/).

**F. Finansman.** GDC 2026 anketinde geliştiricilerin %35'i kendi kaynağıyla, yalnızca %20'si yayıncıyla finanse ediyor; yayıncı anlaşmaları zorlaştı, mobilde yayıncı önce UA harcamasını geri alıyor. Kaynaklar: [Steam Page Analyzer özeti](https://www.steampageanalyzer.com/blog/indie-game-publisher-vs-self-publishing), [Playio yayıncı vs kendi yayın](https://blog.playio.co/game-publishing-deal-vs-self-publishing), [Fungies finansman rehberi 2026](https://fungies.io/indie-game-funding/).

**G. Organik büyüme.** Puzzlit (2026) bulmaca yaratıcılarıyla "POV/tepki" videoları üreterek App Store ilk 10'a girdi; Apple Worm kısa video klipleriyle büyüdü; Meccha Chameleon sosyal mekanikle 2026'nın en çok satan indie'si oldu (15M+). Indie çıkış payı %24'ten %43'e çıktı. Kaynaklar: [Puzzlit analizi](https://mwm.ai/articles/puzzlit-puzzles-made-social-explodes-2026-04-13), [Sensor Tower indie](https://sensortower.com/blog/indie-and-new-ip-break-out-without-denting-aaa), [GamesRadar TikTok bulmaca](https://gamesradar.com/games/puzzle/indie-dev-thought-their-puzzle-game-would-just-die-out-but-a-weird-sales-curve-and-tiktok-virality-led-to-great-success-a-year-after-launch), [Indie-Games.eu kısa video](https://www.indie-games.eu/?p=40375).

**H. Rakipler (App Store taraması).** Rescue Brick (dokununca blok kaldır, çok hamleli), Chain Bump! (nesne konumlandırarak topu kaba düşür), Tumball (dokunuş nesneyi döndürür, gerçek zamanlı), Brain It On! (çizim tabanlı). "Donmuş düzenek + tek tetik + benzersiz çözüm + günlük ortak bölüm" birleşimi bulunamadı; bu kesin boşluk kanıtı değil, yumuşak çıkışta doğrulanacak. [Rescue Brick](https://apps.apple.com/us/app/-/id6744133146), [Chain Bump!](https://apps.apple.com/us/app/id1246691071).

## 13. Alınmış kararlar (sorma, uygula)

1. **Reklam:** Google AdMob, `@capacitor-community/admob` eklentisiyle. Tek SDK. MAX yok.
2. **Mağaza:** Apple geliştirici hesabı mevcut; iOS önce, TestFlight üzerinden. Android v1.1.
3. **Kürasyon aracında Claude API:** Var ama isteğe bağlı; anahtar yalnızca `.env`'de, ayarlardan kapatılabilir. Varsayılan kapalı.
4. **Apple Small Business Program ve Google Play %15 katmanı:** Geliştirici kaydolacak; fiyatlandırma %15 komisyona göre.
5. **Render:** PixiJS değil, düz Canvas 2D. Prototipte yeterli ve bağımlılık azaltıyor.
6. **Analitik:** Firebase Analytics değil, PostHog ücretsiz katman (ATT gerektirmez, self-host seçeneği var).
7. **Yumuşak çıkış pazarları:** Kanada, Yeni Zelanda, İrlanda. 4 hafta.
8. **Oyun kodlamaya başlamadan önce** §10'daki Shorts testi yapılacak; test geçmezse proje durur.

## 14. Prototipten öğrenilenler (M0 denemesi, 8 Kasım 2026)

Bu belgeyi yazarken çekirdek bir kez prototiplendi (TypeScript + Matter.js, 2 bölüm, çözücü). Şu bulgular doğrulandı ve uygulamada zorunlu:

- **Deterministik sim çalışıyor:** sabit 1/120 sn adım, `enableSleeping=false`, seed'li PRNG. Çözücü 20/20 sağlamlık testini geçti.
- **Top eğimde kaymıyor:** Matter.js'te top hafif eğimde (<0.2 rad) sürtünme yüzünden duruyor. Çözüm: top `friction=0.05`, `frictionStatic=0`, rampalar ≥0.24 rad.
- **Tutucu parçalar statik olmalı:** Dinamik bir "kapı" topla birlikte kayıyor ve bölüm kendiliğinden çözülüyor. ÇEK parçaları (peg) statik; dinamik parçalar yalnızca İT için.
- **Huni şart:** Hedef kabın üstüne iki açılı kılavuz koyulunca bölümler sapmaya karşı dayanıklı oluyor; "exactly one solution" testi ancak böyle tutarlı geçiyor.
- **Parça yerleşimi için yardımcılar gerekli:** `surfaceY`, `onShelf`, `ballOn` gibi fonksiyonlar olmadan elle koordinat vermek hatalı (havada kalan parça) oluyor.
- **Çözücü süresi:** bölüm başına ~0,2-0,5 sn (Node). 10.000 aday üretimi dakikalar mertebesinde; pratik.
