# ÖztürkBank Akıllı ATM Simülatörü

ÖztürkBank Akıllı ATM Simülatörü; ATM ekranı, kart/PIN akışı ve temel bankacılık senaryolarını etkileşimli bir arayüzde gösteren React ve TypeScript tabanlı bir eğitim demosudur.

> **Önemli:** Bu proje gerçek bir banka veya ödeme hizmeti değildir. Banka, müşteri, kart, hesap ve işlem bilgileri yalnızca örnek amaçlıdır. Uygulama gerçek kart/PIN doğrulaması, bankacılık işlemi, biyometrik kontrol, EMV sertifikasyonu, sunucu bağlantısı veya güvenlik/fraud koruması sağlamaz. Gerçek kişisel ya da finansal bilgileri girmeyin.

## Özellikler

- Kart seçimi, PIN girişi ve örnek hatalı giriş/bloke senaryoları
- Bakiye görüntüleme, para çekme ve yatırma akışlarının simülasyonu
- Fatura ödeme ve hesaplar arası transfer senaryoları
- Dekont ve gün sonu (EOD) raporu önizleme/indirme
- Örnek işlem ve güvenlik kayıtlarını inceleme
- ATM tuş takımı, ses efektleri ve nakit haznesi gösterimi

## Teknolojiler

- React 19 ve TypeScript
- Vite
- Tailwind CSS
- Lucide React

## Gereksinimler

- Node.js 20.19+ veya 22.12+
- npm

## Kurulum ve çalıştırma

```bash
npm install
npm run dev
```

Geliştirme sunucusu varsayılan olarak `http://localhost:3000` adresinde açılır.

## Denetim ve derleme

```bash
npm run lint
npm run build
npm run preview
```

`npm run lint`, TypeScript denetimini; `npm run build`, üretim derlemesini çalıştırır. `npm run preview`, derleme çıktısını yerel olarak sunar.

## Demo kullanımı

Başlangıç ekranındaki kayıtlı örnek kartlardan birini seçin. Demo PIN'i kart seçiminin yanında gösterilir. İşlemler yalnızca tarayıcı belleğinde simüle edilir; sayfa yenilendiğinde örnek başlangıç durumuna dönülür. Dekont ve EOD dışa aktarma, dosyaları kullanıcının tarayıcısı üzerinden yerel olarak kaydeder.

## Proje yapısı

```text
src/
  components/   ATM ekranı, kart/tuş takımı ve rapor bileşenleri
  data/         Örnek kullanıcı, işlem ve kasa verileri
  types/        TypeScript veri türleri
  utils/        Ses ve dosya işlemleri
  App.tsx       Uygulama akışı ve ATM simülasyonu
```

## Lisans ve kullanım

Depo herkese açık olsa da bu durum içeriğin serbestçe yeniden kullanılabileceği anlamına gelmez. Projede ayrıca bir açık kaynak lisansı bulunmuyor; tüm haklar saklıdır.
