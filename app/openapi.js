const contact = {
  type: "object",
  required: ["_id", "name", "favorite"],
  properties: {
    _id: { type: "string", example: "507f1f77bcf86cd799439011" },
    name: { type: "string", example: "Long Tran" },
    email: { type: "string", example: "longtran@example.com" },
    address: { type: "string", example: "Vinh Long" },
    phone: { type: "string", example: "0962788877" },
    favorite: { type: "boolean", example: false },
  },
};

const input = {
  type: "object",
  properties: Object.fromEntries(
    Object.entries(contact.properties).filter(([key]) => key !== "_id"),
  ),
};

const content = (schema) => ({ "application/json": { schema } });
const error = (description) => ({
  description,
  content: content({ $ref: "#/components/schemas/Error" }),
});

export default {
  openapi: "3.0.3",
  info: {
    title: "Contactbook API",
    version: "1.0.0",
    description: "API JSON quản lý danh bạ với MongoDB.",
  },
  servers: [{ url: "/" }],
  components: {
    schemas: {
      Contact: contact,
      CreateContact: { ...input, required: ["name"] },
      UpdateContact: { ...input, minProperties: 1 },
      Message: { type: "object", required: ["message"], properties: { message: { type: "string" } } },
      Error: { type: "object", required: ["message"], properties: { message: { type: "string" } } },
    },
    parameters: {
      id: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
        description: "MongoDB ObjectId của liên hệ",
      },
    },
  },
  paths: {
    "/api/contacts": {
      get: {
        summary: "Liệt kê liên hệ",
        parameters: [
          { name: "name", in: "query", schema: { type: "string" }, description: "Tìm tên không phân biệt hoa thường; ưu tiên hơn header name" },
          { name: "name", in: "header", schema: { type: "string" }, description: "Lọc theo tên khi không có query name" },
        ],
        responses: { 200: { description: "Danh sách liên hệ", content: content({ type: "array", items: { $ref: "#/components/schemas/Contact" } }) } },
      },
      post: {
        summary: "Tạo liên hệ mới",
        requestBody: { required: true, content: content({ $ref: "#/components/schemas/CreateContact" }) },
        responses: {
          200: { description: "Liên hệ đã tạo", content: content({ $ref: "#/components/schemas/Contact" }) },
          400: error("Thiếu tên hoặc sai kiểu dữ liệu"),
          409: error("Email hoặc số điện thoại đã tồn tại"),
        },
      },
      delete: {
        summary: "Xóa tất cả liên hệ",
        responses: { 200: { description: "Số liên hệ đã xóa", content: content({ $ref: "#/components/schemas/Message" }) } },
      },
    },
    "/api/contacts/favorite": {
      get: {
        summary: "Liệt kê liên hệ yêu thích",
        responses: { 200: { description: "Các liên hệ yêu thích", content: content({ type: "array", items: { $ref: "#/components/schemas/Contact" } }) } },
      },
    },
    "/api/contacts/{id}": {
      get: {
        summary: "Lấy một liên hệ",
        parameters: [{ $ref: "#/components/parameters/id" }],
        responses: {
          200: { description: "Liên hệ tìm được", content: content({ $ref: "#/components/schemas/Contact" }) },
          404: error("Không tìm thấy liên hệ"),
        },
      },
      put: {
        summary: "Cập nhật một liên hệ",
        parameters: [{ $ref: "#/components/parameters/id" }],
        requestBody: { required: true, content: content({ $ref: "#/components/schemas/UpdateContact" }) },
        responses: {
          200: { description: "Cập nhật thành công", content: content({ $ref: "#/components/schemas/Message" }) },
          400: error("Không có trường hợp lệ hoặc sai kiểu dữ liệu"),
          409: error("Email hoặc số điện thoại đã tồn tại"),
          404: error("Không tìm thấy liên hệ"),
        },
      },
      delete: {
        summary: "Xóa một liên hệ",
        parameters: [{ $ref: "#/components/parameters/id" }],
        responses: {
          200: { description: "Xóa thành công", content: content({ $ref: "#/components/schemas/Message" }) },
          404: error("Không tìm thấy liên hệ"),
        },
      },
    },
  },
};
