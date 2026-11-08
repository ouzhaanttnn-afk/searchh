# TETİK (Global adı: *Trigger Point*): özgün oyun fikri

> Tarih: 8 Kasım 2026 · Durum: fikir ve araştırma aşaması. Kod yok.

## 1. Tek cümlede

Ekranda durmuş bir **zincirleme reaksiyon düzeneği** var: domino taşları, rampalar, sarkaçlar, toplar. Düzenekte **tek bir parçaya dokunma hakkın** var. Doğru parçayı seçersen düzenek çalışır ve top hedefe ulaşır. Oyunun özü fizik refleksi değil, **"bu düzenekte hangi parça her şeyi başlatır?" tahmini**.

## 2. Neden diğer oyunlarından farklı

Mevcut portföyünde (Son Ocak, Little Stove, Ebru, Sparkle Fleet, TradeUp, Mihenk, Street Striker, Revit oyunu) tekrar eden kalıplar ve TETİK'in farkı:

| Portföyde tekrar eden | TETİK'te |
|---|---|
| Dükkân, pazarlık, ticaret simülasyonu (TradeUp, Mihenk) | Ekonomi ve pazarlık yok |
| "%100'e kadar temizle veya doldur" (Sparkle Fleet) | Tek hamle var, süreç yok |
| Ateş ve ışık halkası etrafında sürü hayatta kalma (Son Ocak, Little Stove) | Düşman veya sürü yok |
| Renk sıralama bulmacası (Ebru) | Sıralama yok. Fizik **tahmini** var |
| Neredeyse hepsinde Türk kültürel teması | Soyut, dil gerektirmeyen, evrensel görsel dil |
| Hepsi tek kişilik ve çevrimdışı | **Günün Düzeneği**: herkes aynı bölümü oynar, dünya geneli istatistik görür |
| Pazarlama mağaza sayfasına dayanıyor | Oyun kendi **9:16 tekrar videosunu** üretir; KINETROVE kanalıyla doğrudan sinerji |

## 3. Araştırma bulguları (Kasım 2026)

1. **Bulmaca büyüyen tek büyük tür.** AppMagic verisine göre H1 2026'da bulmaca harcaması %20 arttı ($7,6 milyar). Strateji %4, RPG %14 düştü. En hızlı büyüyen tür parti oyunları (%29). ([PocketGamer.biz](https://www.pocketgamer.biz/h1-2026-genre-analysis-strategy-stumbles-rpgs-fall-and-puzzle-revenue-ramps-up/))
2. **Yeni mekanik kazanıyor, kalabalık türde kopya kaybediyor.** H1 2026'da çıkan 120 yeni Match-3 oyununun hiçbiri aylık $100K'yı geçemedi. Buna karşılık yeni bir konveyör mekaniği getiren *Pixel Flow!* bir yıldan kısa sürede $125M+ kazandı ve ~$1 milyar değerlemeyle satın alındı. ([AppMagic H1 2026](https://appmagic.rocks/research/casual-report-H12026))
3. **Pixel Flow'un dersleri:** pasif değil, dikkat isteyen bir döngü; reklamı kendiliğinden güzel görünen bölümler ("bölüm = reklam kreatifi"); reklamdan uygulama içi satın almaya kayış. ([Deconstructor of Fun](https://www.deconstructoroffun.com/blog/2026/2/13/pixel-flow-the-publishers-dream), [AppSamurai](https://appsamurai.com/blog/pixel-flow-an-analysis-of-its-rapid-rise/))
4. **Sosyal bileşen viral etki yaratıyor.** 2026'nın en çok satan indie oyunu Meccha Chameleon sosyal bir saklambaç mekaniğiyle bir ayda 15M+ kopya sattı. Sensor Tower'a göre indie çıkışların payı %24'ten %43'e çıktı. ([Sensor Tower](https://sensortower.com/blog/indie-and-new-ip-break-out-without-denting-aaa), [PC Gamer](https://www.pcgamer.com/gaming-industry/indies-and-non-sequels-have-exploded-in-the-last-year-and-its-not-all-friendslop/))
5. **Bulmacanın riski içerik açlığı.** Oyuncular bölümleri çok hızlı bitiriyor. ([PocketGamer.biz](https://www.pocketgamer.biz/puzzle-games-rise-as-mobile-genres-compete-for-attention-in-2026/)) TETİK bunu **prosedürel üretim ve otomatik çözücüyle** çözüyor (bkz. §6).
6. **KINETROVE verisi:** Shell Breaker formatı %111 ortalama izlenme oranıyla en iyi formatın. Ama Shorts akışında izleyicinin yalnızca %39'u kalıyor, yani asıl sorun ilk 1-2 saniye. "Hangi parçaya dokunursun?" sorusu tam bu ilk saniye için tasarlanmış bir kanca.

### En yakın rakipler (App Store taraması)

| Oyun | Benzerlik | Fark |
|---|---|---|
| [Rescue Brick](https://apps.apple.com/us/app/-/id6744133146) | Dokununca blok kaldırma, zincirleme etki | Hedef anahtar bloğu kurtarmak. Çok hamleli, düzenek fiziği yok |
| [Chain Bump!](https://apps.apple.com/us/app/id1246691071) | Topu hedef kaba düşürme | Nesneleri yeniden konumlandırıyorsun. Tek tetik mantığı yok |
| Tumball | Tek dokunuşla topu hedefe yönlendirme | Dokunuş nesneyi döndürüyor. Gerçek zamanlı beceri oyunu |
| Brain It On! | Fizik bulmacası | Çizim tabanlı, serbest çözüm |

Bu taramada **"donmuş düzenek + tek tetik + benzersiz çözüm + günlük ortak bölüm"** birleşimini sunan bir oyun bulamadım. Bu kesin bir boşluk kanıtı değil: §9'daki doğrulama adımları gerekli.

## 4. Oyun döngüsü

1. **Gözle (3-15 sn):** Düzenek donmuş halde. Parmağını parçaların üzerinde gezdirince, dokunacağın parça ve o parçaya uygulanacak etkinin türü vurgulanıyor. Simülasyon önizlemesi **yok**; zaten tahmin etmek oyunun kendisi.
2. **Tetikle (tek dokunuş):** Dokunuş türleri zamanla açılıyor:
   - **Çek:** parçayı yok et (ilk bölümler)
   - **İt:** küçük bir itme (yön, parçanın üzerindeki okla belli)
   - **Çevir:** rampa veya kapağı 90° döndür
   - **Kilitle:** bir parçayı yerine sabitle (ileri seviye; "ne olmamalı" düşüncesi)
3. **İzle (5-12 sn):** Fizik oynuyor. Tatmin edici bir zincirleme reaksiyon, ağır çekim final ve hedefe girişte parçacık patlaması.
4. **Puan:**
   - Bölüm geçildi veya geçilmedi
   - **İlk denemede çözme** yıldızı
   - "Bu bölümü oyuncuların %23'ü ilk denemede çözdü" istatistiği
5. **Yanlış tetik:** Düzenek yanlış çalışır; komik bir başarısızlık animasyonu oynar ("Neredeyse!" anı). Sonra **geri sar** düğmesi gelir. Ceza yok, sadece ilk deneme yıldızı gider.

### Neden bağımlılık yapar

- **"Bir tane daha"**: Bir bölüm 20-40 saniye sürer.
- **"Aha!" anı**: Doğru parça genelde en göze batmayan parçadır. Sudoku hissi verir, refleks değil.
- **Kendi kendini paylaşan an**: Her başarılı çözüm otomatik olarak 9:16 bir klip olur.

## 5. Modlar

| Mod | İçerik | Amaç |
|---|---|---|
| **Yolculuk** | 12 dünya × 30 bölüm. Her dünya yeni bir parça ailesi getiriyor (domino, sarkaç, makara, su, mıknatıs, portal…) | Ana ilerleme |
| **Günün Düzeneği** | Herkese aynı bölüm. Tek deneme hakkı var, sonuçlar ertesi gün açıklanıyor | Sosyal ve günlük geri dönüş; **Wordle tarzı paylaşım kartı** |
| **Usta Düzenekleri** | 2 tetikli zor bölümler (sıra önemli) | Mid-core oyuncular, ücretli paket |
| **Atölye** (v2) | Oyuncu düzenek kurar, çözücü "tek çözümlü mü" diye onaylar, paylaşılır | Kullanıcı üretimi içerik, uzun ömür |

Paylaşım kartı örneği (yalnızca emoji ve metin, spoiler içermez):
```
TETİK · Günün Düzeneği #142
🟩 İlk denemede · ⏱ 9 sn düşünme
Oyuncuların %31'i çözdü
```

## 6. Teknik çekirdek: otomatik bölüm üreticisi ve çözücü

Bulmacanın içerik açlığı sorununu çözen ve rakiplerden ayıran kısım bu.

1. **Üretici:** Parça ailelerinden rastgele ama kurallı (şablon gramerli) düzenekler üretir.
2. **Çözücü:** Her olası tetiği (N parça × dokunuş türü) deterministik fizikte (sabit zaman adımı) simüle eder.
3. **Kabul kriteri:**
   - **Tam olarak 1** tetik başarılı olmalı (ya da Usta modunda tek bir sıra).
   - **Sağlamlık testi:** Doğru tetik, küçük rastgele sapmalarla (±%1 konum ve hız) 20 denemenin 20'sinde başarılı olmalı. Yanlış tetikler 20'nin 20'sinde başarısız olmalı. Böylece farklı cihazlardaki küçük kayan nokta farkları çözümü bozmaz.
4. **Zorluk puanı:** Doğru parçanın "göze batmazlığı" (topa mesafe, zincirdeki sırası), yanlış tetiklerden kaçının "neredeyse" başardığı ve zincirin uzunluğu.
5. **Kürasyon:** Üretilen 10.000 aday içinden en iyi ~%3 seçilir. Claude API ile her bölüme isim ve ipucu metni üretilebilir.

**Teknoloji önerisi:** TypeScript + **Matter.js** + Capacitor (iOS önce, Android sonra).
- motorv2/KINETROVE zaten Matter.js kullanıyor; fizik bilgisi ve görsel dil yeniden kullanılır.
- TradeUp ve Street Striker'daki web + Capacitor + Codemagic hattı hazır.
- Çözücü Node'da toplu çalışır; bölümler JSON olarak oyuna gömülür.

## 7. Görsel ve ses kimliği

- **Soyut, temiz, dokunsal:** Koyu arka plan, mat pastel parçalar, tek vurgu rengi (hedef). KINETROVE'un estetiğiyle akraba ama ondan ayrı bir marka.
- Her dünyanın kendi malzemesi var: ahşap domino, cam, metal, kâğıt, jöle.
- **Ses:** Her çarpışma notaya bağlı. Zincir ilerledikçe bir melodi kendiliğinden kurulur ve doğru çözüm akorla biter. Yanlış tetikte melodi "falsolu" kalır.
- Dil gerektirmeyen arayüz. Yerelleştirme maliyeti neredeyse sıfır.

## 8. Gelir modeli

Senin tercih ettiğin modelle uyumlu:

- **Ücretsiz + reklam:** Her 3 bölümde bir geçiş reklamı. **Ödüllü reklam** ise ipucu verir: "doğru parça bu bölgede" (parçayı söylemez, alanı daraltır).
- **Reklamsız paket:** $3,99, tek seferlik.
- **Usta Düzenekleri paketleri:** $1,99. Bunlar 2 tetikli zor bölümler.
- **Kozmetik:** Malzeme ve ses temaları.
- Abonelik yok.

## 9. Doğrulama planı (kod yazmadan önce, ucuz)

1. **Shorts testi (en değerli adım):** KINETROVE üzerinden 3-5 adet *"Sadece BİR parçaya dokunabilirsin. Hangisi? 👇"* Short'u yayınla; cevap videonun sonunda gösterilsin.
   - Ölçüt: Shorts akışında kalma oranı mevcut %39 ortalamasını geçiyor mu, yorumlara tahmin yazılıyor mu?
   - Bunu **15 Kasım analizinden sonra** yapmak, takvim kararına ("kalsın") uyar.
2. **İsim kontrolü:** "TETİK / Trigger Point" adının App Store ve Google Play'de çakışma kontrolü. Not: App Store'da "Kinetrix" adlı bir oyun var; benzer isimlerden kaçınılmalı.
3. **Prototip:** Tek ekran, 15 elle yapılmış bölüm ve basit üretici. Hedef: 5 kişiyle oyun testi ve "ilk denemede çözme" oranının %20-50 aralığında olması.

## 10. Riskler

| Risk | Önlem |
|---|---|
| Cihazlar arası fizik farkı çözümü bozar | §6'daki sağlamlık testi. Gerekirse tamsayı veya sabit noktalı basit fizik |
| Oyuncu deneme-yanılmayla çözer | Deneme sınırsız ama "ilk deneme" yıldızı ve günlük modda tek hak |
| "Rescue Brick" ve benzerlerine benzer görünmesi | Reklam kreatiflerinde zincirleme reaksiyon ve tahmin anı öne çıkar, blok kaldırma değil |
| Bölümler sıkıcılaşır | Her dünyada yeni parça ailesi. Atölye modu |

## 11. Neden bu fikir sana uygun

- **Altyapın hazır:** Matter.js (motorv2), web + Capacitor + Codemagic (TradeUp, Street Striker), Kling ile görsel.
- **Hazır bir pazarlama kanalın var:** KINETROVE zaten fizik zincirleme reaksiyon Shorts'u üretiyor. Oyun bu kanalın doğal ürünü olur; ayrıca oyun içi her çözüm yeni Shorts içeriği olur.
- **Portföyünü genişletir:** İlk sosyal, ilk dil-bağımsız, ilk "tahmin" mekanikli oyunun olur.
