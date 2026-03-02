# دليل النشر على Vercel (Deployment Guide)

لكي يعمل التطبيق بشكل صحيح على Vercel، يجب عليك إضافة المتغيرات البيئية (Environment Variables) التالية في لوحة تحكم Vercel.

## 1. إعداد قاعدة البيانات (Database)
التطبيق يحتاج إلى قاعدة بيانات MongoDB تعمل على الإنترنت (Cloud).
- إذا لم يكن لديك واحدة، قم بإنشاء حساب مجاني على [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- قم بإنشاء Cluster جديد.
- احصل على رابط الاتصال (Connection String) الذي يبدو هكذا:
  `mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/loveconnect`

## 2. إضافة المتغيرات في Vercel
1. اذهب إلى مشروعك في Vercel Dashboard.
2. انتقل إلى **Settings** > **Environment Variables**.
3. أضف المتغيرات التالية:

| الاسم (Key) | القيمة (Value) | الوصف |
| :--- | :--- | :--- |
| **`MONGODB_URI`** | `mongodb+srv://...` | رابط قاعدة بيانات MongoDB Atlas الخاصة بك |
| **`JWT_SECRET`** | `any-long-random-string` | نص سري لتشفير الجلسات (اكتب أي نص طويل ومعقد) |
| **`NEXT_PUBLIC_VAPID_PUBLIC_KEY`** | `BEQRmeN2Ae3Nktv7dR1dfdU4JcfCYG9dYAUlbbGbbswC1TOEDT5yMPjebsm8hvHqDUOuZNa0iVdSZRjjBKWCj1g` | المفتاح العام للإشعارات (موجود في الكود) |
| **`VAPID_PRIVATE_KEY`** | `E52IQbhOcKniKEdc02cSKcRFXgdnby5L6bujIWyRP5s` | المفتاح الخاص للإشعارات (موجود في الكود) |
| **`VAPID_SUBJECT`** | `mailto:admin@loveconnect.com` | بريد إلكتروني للتواصل بخصوص الإشعارات |

## 3. إعادة النشر (Redeploy)
بعد إضافة المتغيرات:
1. اذهب إلى تبويب **Deployments**.
2. اختر آخر Deployment واضغط على **Redeploy**.
3. سيعمل التطبيق الآن بنجاح! 🚀
