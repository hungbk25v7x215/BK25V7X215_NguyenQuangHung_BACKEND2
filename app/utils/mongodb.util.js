import { MongoClient } from "mongodb";

export default class MongoDB {
  static async connect(uri) {
    if (!this.client) this.client = await MongoClient.connect(uri);
    return this.client;
  }
}
