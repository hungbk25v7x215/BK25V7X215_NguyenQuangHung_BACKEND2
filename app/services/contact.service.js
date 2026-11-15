import { ObjectId } from "mongodb";

export default class ContactService {
  constructor(client) {
    this.Contact = client.db().collection("contacts");
  }

  async ensureIndexes() {
    await this.Contact.createIndex(
      { email: 1 },
      { name: "unique_email", unique: true, partialFilterExpression: { email: { $type: "string" } }, collation: { locale: "en", strength: 2 } },
    );
    await this.Contact.createIndex(
      { phone: 1 },
      { name: "unique_phone", unique: true, partialFilterExpression: { phone: { $type: "string" } } },
    );
  }

  async create(contact) {
    const document = { ...contact, favorite: contact.favorite ?? false };
    const result = await this.Contact.insertOne(document);
    return { ...document, _id: result.insertedId };
  }

  async find(filter = {}) {
    return this.Contact.find(filter).toArray();
  }

  async findByName(name) {
    const literal = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return this.find({ name: { $regex: literal, $options: "i" } });
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return this.Contact.findOne({ _id: new ObjectId(id) });
  }

  async update(id, contact) {
    if (!ObjectId.isValid(id)) return null;
    return this.Contact.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: contact },
      { returnDocument: "after" },
    );
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) return null;
    return this.Contact.findOneAndDelete({ _id: new ObjectId(id) });
  }

  async findFavorite() {
    return this.find({ favorite: true });
  }

  async deleteAll() {
    const result = await this.Contact.deleteMany({});
    return result.deletedCount;
  }
}
