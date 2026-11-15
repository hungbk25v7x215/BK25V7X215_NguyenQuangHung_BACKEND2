# Contactbook Backend

API quản lý danh bạ viết bằng Express 5, chạy với Bun và lưu dữ liệu trong MongoDB. API trao đổi dữ liệu JSON.

## Cài đặt nhanh

Cần có [Bun](https://bun.com/docs/installation) và một MongoDB Server đang chạy trên máy. Không cần cài `mongosh` hay MongoDB Compass để chạy API.

```bash
cd contactbook_backend
bun install
cp .env.example .env
```

Mặc định ứng dụng dùng `mongodb://127.0.0.1:27017/contactbook` và cổng API `3000`. Nếu hai giá trị này phù hợp, không cần sửa `.env`. Bun tự đọc `.env` khi chạy ứng dụng. File `.env` đã được bỏ qua bởi Git.

### Chạy MongoDB: chọn một cách

**Cách 1 — chạy trực tiếp trên macOS:** Nếu đã tải và giải nén gói MongoDB Community `.tgz`, tạo thư mục dữ liệu rồi chạy `mongod` trong một Terminal riêng. Đổi đường dẫn bên dưới theo thư mục bạn đã giải nén:

```bash
mkdir -p ~/data/db
~/Downloads/mongodb-macos-aarch64--9.0.8/bin/mongod --dbpath ~/data/db --bind_ip 127.0.0.1 --port 27017
```

Giữ Terminal này mở trong khi dùng ứng dụng. Nhấn `Ctrl+C` để dừng MongoDB; dữ liệu vẫn nằm trong `~/data/db`. Nếu đã cài `mongod` vào `PATH`, thay đường dẫn dài bằng `mongod`.

**Cách 2 — chạy container bằng OrbStack hoặc Docker:** Mở OrbStack trước, rồi chạy:

```bash
docker run -d --name contactbook-mongo -p 127.0.0.1:27017:27017 -v contactbook-mongo-data:/data/db mongo:9.0.8
```

Ở những lần sau, dùng `docker start contactbook-mongo`; dừng bằng `docker stop contactbook-mongo`. Volume `contactbook-mongo-data` giữ dữ liệu khi container dừng. Chỉ chạy một trong hai cách trên tại cùng thời điểm vì cả hai dùng cổng `27017`.

Kiểm tra MongoDB đã nghe kết nối:

```bash
lsof -nP -iTCP:27017 -sTCP:LISTEN
```

### Chạy API

Mở Terminal khác tại thư mục dự án:

```bash
bun start
```

Để tự khởi động lại khi sửa mã, dùng `bun dev`. Khi kết nối thành công, Terminal sẽ báo `Đã kết nối MongoDB` và cổng API. Kiểm tra nhanh:

```bash
curl http://127.0.0.1:3000/
curl http://127.0.0.1:3000/api/contacts
```

Mở `http://127.0.0.1:3000/api-docs/` trong trình duyệt để xem và thử API bằng Swagger UI. Đặc tả OpenAPI dạng JSON ở `http://127.0.0.1:3000/openapi.json`.

Swagger và API chạy **trên cùng server và cùng cổng**. Trong Postman, import `http://127.0.0.1:3000/openapi.json`, rồi đặt biến `baseUrl` của collection thành `http://127.0.0.1:3000` (cả Initial Value và Current Value nếu Postman hiển thị hai cột). Sau đó dùng `{{baseUrl}}/api/contacts` cho mọi request; không cần tạo Environment riêng. Giữ Terminal chạy `bun start` mở trong lúc thử API. Nếu đổi `PORT`, cập nhật cả URL Swagger/OpenAPI và `baseUrl` sang cổng mới.

Database `contactbook` và collection `contacts` được MongoDB tạo khi ứng dụng ghi liên hệ đầu tiên. Có thể mở [MongoDB Compass](https://www.mongodb.com/docs/compass/) và kết nối bằng URI trong `.env` để xem dữ liệu.

### Tạo dữ liệu mẫu

Khi MongoDB đang chạy, dùng lệnh sau để thêm 150 liên hệ giả vào database trong `MONGODB_URI`:

```bash
bun run seed
```

Script không xóa hoặc sửa liên hệ có sẵn. Email mẫu có dạng `seed001@example.test` đến `seed150@example.test`; chạy lại chỉ thêm bản ghi mẫu còn thiếu. Có 30 liên hệ được đánh dấu yêu thích. Sau đó mở Swagger UI hoặc gửi `GET /api/contacts` trong Postman để xem kết quả.

## Cấu hình

| Biến môi trường | Mặc định                               | Ý nghĩa                       |
| ------------------- | ----------------------------------------- | ------------------------------- |
| `PORT`            | `3000`                                  | Cổng HTTP của API             |
| `MONGODB_URI`     | `mongodb://127.0.0.1:27017/contactbook` | URI MongoDB, gồm tên database |

Sửa `.env` để đổi cấu hình. Ví dụ, nếu cổng `3000` đã được dùng, đặt `PORT=3001`. Với MongoDB trên máy khác, đặt `MONGODB_URI` thành URI có thể truy cập từ máy chạy API; cấu hình xác thực và mạng riêng trước khi cho phép kết nối từ xa.

## API

Một liên hệ có `name`, `email`, `address`, `phone` là chuỗi và `favorite` là boolean. `name` là bắt buộc khi tạo; các trường khác tùy chọn và `favorite` mặc định là `false`. Khi cập nhật, chỉ các trường được gửi sẽ thay đổi. API cắt khoảng trắng ở các chuỗi và chuyển email thành chữ thường; email và phone (nếu có) phải duy nhất. `_id` do MongoDB tự tạo, không được gửi trong body. MongoDB trả `_id` dưới dạng chuỗi hex trong JSON.

| Phương thức | Đường dẫn              | Kết quả                                                                                             |
| -------------- | -------------------------- | ----------------------------------------------------------------------------------------------------- |
| `POST`       | `/api/contacts`          | Tạo một liên hệ mới, trả về liên hệ đã tạo                                                |
| `GET`        | `/api/contacts`          | Trả về tất cả liên hệ; thêm `?name=Mai` hoặc header `name: Mai` để lọc tên, không phân biệt hoa thường. Query được ưu tiên nếu có cả hai |
| `DELETE`     | `/api/contacts`          | Xóa **toàn bộ** liên hệ, trả về số lượng đã xóa                                    |
| `GET`        | `/api/contacts/favorite` | Trả về các liên hệ có `favorite: true`                                                        |
| `GET`        | `/api/contacts/:id`      | Trả về liên hệ theo `_id`                                                                       |
| `PUT`        | `/api/contacts/:id`      | Cập nhật liên hệ theo `_id`                                                                     |
| `DELETE`     | `/api/contacts/:id`      | Xóa liên hệ theo `_id`                                                                           |

Ví dụ tạo một liên hệ:

```bash
curl -X POST http://127.0.0.1:3000/api/contacts \
  -H 'Content-Type: application/json' \
  -d '{"name":"Nguyen Van A","email":"a@example.com","phone":"0123456789","favorite":true}'
```

Lấy `_id` từ kết quả POST, rồi thay `REPLACE_WITH_ID` trong lệnh sau:

```bash
curl http://127.0.0.1:3000/api/contacts/REPLACE_WITH_ID
```

Trong Postman, mở **Params** và điền `name` / `Mai` để gửi query; hoặc mở **Headers**, điền `name` / `Mai` và **bật checkbox** ở đầu hàng để gửi header. Header `Accept: application/json` chỉ khai báo định dạng phản hồi, không dùng để lọc. Nếu dùng bản collection import từ `/openapi.json` trước khi cập nhật, hãy import lại để thấy header `name`.

MongoDB tự bảo đảm `_id` duy nhất. API tạo unique index cho `email` (không phân biệt hoa thường) và `phone` lúc khởi động. Dữ liệu cũ từng trùng đã được xử lý bằng `bun scripts/repair-duplicate-contacts.js`; bản gốc của hai liên hệ bị sửa nằm trong collection `contact_duplicate_repair_backup_20261115`. Script chỉ dành cho database `contactbook` và các ID được ghi sẵn trong script. Nếu nhập dữ liệu khác có giá trị trùng, hãy sửa các bản ghi đó trước khi khởi động API.

Yêu cầu thiếu `name`, sai kiểu dữ liệu hoặc cập nhật không có trường hợp lệ trả lỗi `400`. Email/phone trùng trả `409` với thông báo `email already exists` hoặc `phone already exists`. ID không tồn tại hoặc không hợp lệ trả `404 Contact not found`. URL không được định nghĩa trả `404 Resource not found`. Phản hồi lỗi có dạng `{ "message": "..." }`.

## Kiểm thử

Khi MongoDB cục bộ đang chạy ở `127.0.0.1:27017`:

```bash
bun test
```

Kiểm thử dùng các database riêng có tên `contactbook_test_<mã ngẫu nhiên>` và `contactbook_seed_test_<mã ngẫu nhiên>`, rồi xóa chúng sau khi chạy; dữ liệu `contactbook` của bạn không bị xóa.

## Lỗi thường gặp

- **Không kết nối được MongoDB:** Kiểm tra Terminal chạy `mongod` hoặc `docker ps`, rồi kiểm tra `lsof -nP -iTCP:27017 -sTCP:LISTEN` và `MONGODB_URI`.
- **`EADDRINUSE` ở cổng 3000:** Đổi `PORT` trong `.env` hoặc dừng tiến trình đang dùng cổng đó.
- **Không thấy `contactbook` trong Compass:** Tạo ít nhất một liên hệ bằng POST rồi làm mới danh sách database.
- **macOS chặn `mongod`:** Vào **System Settings → Privacy & Security → Open Anyway**, sau đó chạy lại lệnh.
