import app from "./app.js";
import config from "./app/config/index.js";

// khởi động máy chủ

const PORT = config.app.port;

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`Máy chủ đang chạy trên cổng ${PORT}.`);
});
