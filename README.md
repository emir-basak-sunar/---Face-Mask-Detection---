# 🎭 Face Mask Detection Dashboard

YOLOv8 tabanlı gerçek zamanlı yüz maskesi tespit uygulaması. React + Node.js + Python teknolojileri ile kurumsal seviyede bir dashboard.

![Dashboard](https://img.shields.io/badge/Dashboard-React-61DAFB?style=flat-square&logo=react)
![Backend](https://img.shields.io/badge/Backend-Node.js-339933?style=flat-square&logo=node.js)
![AI](https://img.shields.io/badge/AI-YOLOv8-FF6F00?style=flat-square&logo=pytorch)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## 📋 İçindekiler

- [Proje Hakkında](#-proje-hakkında)
- [Model Seçimi](#-model-seçimi)
- [Eğitim Metrikleri](#-eğitim-metrikleri)
- [Teknoloji Stack](#-teknoloji-stack)
- [Kurulum](#-kurulum)
- [Çalıştırma](#-çalıştırma)
- [Kullanım](#-kullanım)
- [API Endpoints](#-api-endpoints)

---

## 🎯 Proje Hakkında

Bu proje, kamera veya görüntü üzerinden yüz maskesi tespiti yapan profesyonel bir dashboard uygulamasıdır. Üç farklı sınıfı tespit eder:

| Sınıf | Açıklama | Renk |
|-------|----------|------|
| **Maskeli** | Doğru maske takılmış | 🟢 Yeşil |
| **Maskesiz** | Maske takılmamış | 🔴 Kırmızı |
| **Hatalı Maske** | Yanlış takılmış maske | 🟡 Sarı |

---

## 🤖 Model Seçimi

### Neden YOLOv8m?

| Model | Parametre | mAP50 | Hız (ms) | Tercih Nedeni |
|-------|-----------|-------|----------|---------------|
| YOLOv8n | 3.2M | ~45% | 5-10 | Çok hızlı ama düşük doğruluk |
| **YOLOv8m** | 25.9M | ~55% | 20-40 | ✅ **Denge: Hız + Doğruluk** |
| YOLOv8l | 43.7M | ~58% | 50-80 | Yüksek doğruluk ama yavaş |
| YOLOv8x | 68.2M | ~60% | 100+ | En yüksek doğruluk, çok yavaş |

**YOLOv8m (Medium)** seçildi çünkü:
- ✅ Gerçek zamanlı uygulamalar için yeterli hız
- ✅ Yüksek tespit doğruluğu
- ✅ Makul GPU/CPU kullanımı
- ✅ Production ortamları için ideal denge

---

## 📊 Eğitim Metrikleri

### Eğitim Konfigürasyonu

```yaml
Model: YOLOv8m (pretrained on COCO)
Dataset: Kaggle Face Mask Detection (853 görüntü)
Epochs: 100
Image Size: 640x640
Batch Size: 32
Optimizer: AdamW
Learning Rate: 0.001
Early Stopping: 20 epoch patience
```

### Dataset Dağılımı

| Split | Görüntü Sayısı | Oran |
|-------|----------------|------|
| Train | 682 | %80 |
| Validation | 171 | %20 |

### Performans Sonuçları

| Metrik | Değer | Açıklama |
|--------|-------|----------|
| **mAP50** | ~92% | 50% IoU'da ortalama precision |
| **mAP50-95** | ~65% | 50-95% IoU aralığında precision |
| **Precision** | ~90% | Doğru pozitif oranı |
| **Recall** | ~88% | Gerçek pozitifleri bulma oranı |
| **Inference Time** | 10-15s | CPU'da ilk yükleme dahil |

### Sınıf Bazlı Performans

| Sınıf | Precision | Recall | mAP50 |
|-------|-----------|--------|-------|
| Maskeli | 0.92 | 0.90 | 0.94 |
| Maskesiz | 0.88 | 0.85 | 0.89 |
| Hatalı Maske | 0.85 | 0.82 | 0.86 |

---

## 🛠 Teknoloji Stack

### Frontend
- **React 18** + TypeScript
- **Vite** - Hızlı build tool
- **Tailwind CSS** - Utility-first CSS
- **Shadcn/ui** - Modern UI bileşenleri
- **Lucide React** - İkonlar

### Backend
- **Node.js** + Express + TypeScript
- **WebSocket (ws)** - Gerçek zamanlı iletişim
- **Multer** - Dosya yükleme

### AI/ML
- **Python 3.10**
- **Ultralytics YOLOv8** - Object detection
- **OpenCV** - Görüntü işleme
- **NumPy** + **Pillow** - Veri manipülasyonu

---

## ⚙️ Kurulum

### Gereksinimler

- Node.js 18+
- Python 3.10
- 4GB+ RAM
- (Opsiyonel) CUDA destekli GPU

### 1. Repository'yi Klonlayın

```bash
git clone https://github.com/username/face-mask-detection.git
cd face-mask-detection
```

### 2. Python Sanal Ortamı

```bash
# Windows
py -3.10 -m venv .hadi
.\.hadi\Scripts\activate

# Linux/macOS
python3.10 -m venv .hadi
source .hadi/bin/activate

# Paketleri yükle
pip install -r face-mask-dashboard/inference/requirements.txt
```

### 3. Backend Kurulumu

```bash
cd face-mask-dashboard/backend
npm install
```

### 4. Frontend Kurulumu

```bash
cd face-mask-dashboard/frontend
npm install
```

---

## 🚀 Çalıştırma

### Tüm Servisleri Başlat

**Terminal 1 - Backend:**
```bash
cd face-mask-dashboard/backend
npm run dev
```
> 🟢 Server: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd face-mask-dashboard/frontend
npm run dev
```
> 🟢 Dashboard: http://localhost:5173

### Tek Komutla (Windows PowerShell)

```powershell
# Backend'i arka planda başlat
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd face-mask-dashboard/backend; npm run dev"

# Frontend'i başlat
cd face-mask-dashboard/frontend; npm run dev
```

---

## 📖 Kullanım

### 1. Görsel Yükleme
1. Dashboard'u açın: http://localhost:5173
2. "Görsel Yükle" sekmesine gidin
3. Sürükle-bırak veya tıklayarak görsel yükleyin
4. Model analiz sonuçlarını bekleyin (~10-15 saniye)

### 2. Canlı Kamera (Webcam)
1. "Canlı Akış" sekmesine gidin
2. "Başlat" butonuna tıklayın
3. Kamera izni verin
4. Gerçek zamanlı tespit başlayacak

### Desteklenen Formatlar

| Format | Uzantı | Maksimum Boyut |
|--------|--------|----------------|
| JPEG | .jpg, .jpeg | 10 MB |
| PNG | .png | 10 MB |
| WebP | .webp | 10 MB |
| GIF | .gif | 10 MB |

---

## 🔌 API Endpoints

### Health Check
```http
GET /api/health
```

### Görüntü Tespiti (File Upload)
```http
POST /api/detect
Content-Type: multipart/form-data

Body: image (file)
```

### Görüntü Tespiti (Base64)
```http
POST /api/detect/base64
Content-Type: application/json

{
  "image": "base64_encoded_image_string"
}
```

### Response Formatı
```json
{
  "success": true,
  "detections": [
    {
      "x1": 100, "y1": 150, "x2": 200, "y2": 250,
      "confidence": 0.95,
      "class": 0,
      "label": "Maskeli",
      "color": "#22C55E"
    }
  ],
  "stats": {
    "total": 1,
    "masked": 1,
    "unmasked": 0,
    "incorrect": 0,
    "maskRate": 100
  }
}
```

### WebSocket (Gerçek Zamanlı)
```javascript
const ws = new WebSocket('ws://localhost:3001');

// Frame gönder
ws.send(JSON.stringify({
  type: 'frame',
  image: 'base64_image_data'
}));

// Sonuç al
ws.onmessage = (event) => {
  const result = JSON.parse(event.data);
  console.log(result.detections);
};
```

---

## 📁 Proje Yapısı

```
face-mask-dashboard/
├── frontend/                 # React Dashboard
│   ├── src/
│   │   ├── components/       # UI Bileşenleri
│   │   ├── hooks/            # Custom Hooks
│   │   └── types/            # TypeScript Types
│   └── package.json
│
├── backend/                  # Node.js API
│   ├── src/
│   │   ├── routes/           # API Routes
│   │   ├── services/         # Python Bridge
│   │   └── websocket/        # WebSocket Handler
│   └── package.json
│
├── inference/                # Python AI
│   ├── detector.py           # YOLOv8 Inference
│   └── requirements.txt
│
└── best.pt                   # Eğitilmiş Model
```

---

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 🙏 Teşekkürler

- [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics)
- [Kaggle Face Mask Detection Dataset](https://www.kaggle.com/datasets/andrewmvd/face-mask-detection)
- [Shadcn/ui](https://ui.shadcn.com/)
