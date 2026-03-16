# TOERP - Hệ thống ERP Tiến Oanh

Dự án này được thiết kế theo kiến trúc Monorepo, quản lý bằng Turborepo.
Bao gồm:
- Thiết kế Core Framework (Event-driven, AI-ready)
- Backend (NestJS) tại `apps/api`
- Frontend (Next.js) tại `apps/web`
- Database (PostgreSQL + Prisma) tại `packages/database`

## Hướng dẫn chạy dự án trên GitHub Codespaces (Không cần cài đặt trên máy cá nhân)

Để có thể code và xem giao diện ở bất cứ đâu (trên mây), bạn làm theo các bước sau:

**Bước 1: Đưa code này lên GitHub**
1. Đăng nhập vào [GitHub.com](https://github.com/) 
2. Tạo một Repository mới tên là `toerp` (để Private).
3. Mở Terminal trên máy Mac của bạn, trỏ vào thư mục `/Users/chienhoang/.gemini/antigravity/scratch/TOERP` và chạy các lệnh sau:
   ```bash
   git init
   git add .
   git commit -m "Init TOERP project structure and Database schema"
   git branch -M main
   git remote add origin https://github.com/TaikhoanCuaBan/toerp.git
   git push -u origin main
   ```

**Bước 2: Mở dự án bằng Codespaces**
1. Vào trang GitHub của dự án bạn vừa tạo.
2. Bấm nút màu xanh lá cây **"<> Code"**.
3. Chọn tab **"Codespaces"**.
4. Bấm **"Create codespace on main"**.

**Bước 3: Code và Test trên trình duyệt**
Ngay khi Codespace mở ra (giao diện y hệt VS Code), máy chủ ảo của GitHub đã tự động có sẵn Node.js.
Bạn mở Terminal (ẩn dưới cùng) và gõ:
```bash
npm install
npm run dev
```
Hệ thống sẽ chạy ứng dụng và tự động cung cấp cho bạn một đường link web để bạn xem giao diện thực tế (cả trên điện thoại hay máy tính)!

---
*Lưu ý: Mọi database (PostgreSQL) sẽ được kết nối thông qua dịch vụ Cloud DB (như Neon.tech) mà mình sẽ thiết lập cùng bạn ở file `.env` trên Codespaces.*
