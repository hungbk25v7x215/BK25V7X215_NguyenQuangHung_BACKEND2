import app from "./app.js";
import config from "./app/config/index.js";
import MongoDB from "./app/utils/mongodb.util.js";
import ContactService from "./app/services/contact.service.js";

async function startServer() {
  try {
    await MongoDB.connect(config.db.uri);
    await new ContactService(MongoDB.client).ensureIndexes();
    console.log("Đã kết nối MongoDB.");

    const port = config.app.port;
    app.listen(port, (error) => {
      if (error) throw error;
      console.log(`Máy chủ đang chạy trên cổng ${port}.`);
    });
  } catch (error) {
    console.error("Không thể kết nối MongoDB:", error);
    process.exit(1);
  }
}

startServer();
