import config from "../app/config/index.js";
import MongoDB from "../app/utils/mongodb.util.js";

const familyNames = ["Nguyen", "Tran", "Le", "Pham", "Hoang", "Vo", "Dang", "Bui", "Do", "Huynh"];
const givenNames = ["An", "Binh", "Chi", "Dung", "Giang", "Hanh", "Khanh", "Lan", "Minh", "Phuong", "Quang", "Trang"];
const cities = ["Can Tho", "Vinh Long", "Ho Chi Minh", "Da Nang", "Ha Noi", "An Giang"];

const client = await MongoDB.connect(config.db.uri);
try {
  const contacts = client.db().collection("contacts");
  const operations = Array.from({ length: 150 }, (_, index) => {
    const number = String(index + 1).padStart(3, "0");
    const email = `seed${number}@example.test`;
    return {
      updateOne: {
        filter: { email },
        update: {
          $setOnInsert: {
            name: `${familyNames[Math.floor(index / givenNames.length) % familyNames.length]} ${givenNames[index % givenNames.length]} ${number}`,
            email,
            address: cities[index % cities.length],
            phone: `09${String(index + 1).padStart(8, "0")}`,
            favorite: index % 5 === 0,
          },
        },
        upsert: true,
      },
    };
  });
  const result = await contacts.bulkWrite(operations);
  console.log(`Đã thêm ${result.upsertedCount} liên hệ mẫu vào ${client.db().databaseName}.`);
} finally {
  await client.close();
}
