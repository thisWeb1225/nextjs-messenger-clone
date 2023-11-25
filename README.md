# Messenger Clone

## 使用技術 & 套件
1. Next.js -> app router
2. Tailwind 刻 UI
3. prisma + mongodb 資料庫
4. bcrypt 加密
5. react-hook-form 製作、驗證表單
6. NextAuth 第三方登陸
7. next-cloudinary 處理圖片上傳

## 筆記
如果要讓 Next 載入其他網域的圖片，需要到 `next.config.js` 配置，如下
```js
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com', // 指定 Cloudinary 網域的圖片可以被載入和顯示
      'avatars.githubusercontent.com', // 指定 GitHub 使用者頭像的網域的圖片可以被載入和顯示
      'lh3.googleusercontent.com', // 指定 Google 使用者頭像的網域的圖片可以被載入和顯示
    ],
  },
};

module.exports = nextConfig;
```