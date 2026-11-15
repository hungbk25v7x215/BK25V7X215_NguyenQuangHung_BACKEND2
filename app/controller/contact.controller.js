import ApiError from "../api_error.js";
import ContactService from "../services/contact.service.js";
import MongoDB from "../utils/mongodb.util.js";

function contactData(body = {}) {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new ApiError(400, "Contact data must be an object");
  }
  if (body._id !== undefined) throw new ApiError(400, "_id cannot be supplied");
  const allowed = ["name", "email", "address", "phone", "favorite"];
  const unknown = Object.keys(body).find((field) => !allowed.includes(field));
  if (unknown) throw new ApiError(400, `${unknown} is not a contact field`);

  const contact = {};
  for (const field of ["name", "email", "address", "phone"]) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "string") {
        throw new ApiError(400, `${field} must be a string`);
      }
      contact[field] = field === "email" ? body[field].trim().toLowerCase() : body[field].trim();
      if (field !== "address" && !contact[field]) {
        throw new ApiError(400, field === "name" ? "Name can not be empty" : `${field} can not be empty`);
      }
    }
  }
  if (body.favorite !== undefined) {
    if (typeof body.favorite !== "boolean") {
      throw new ApiError(400, "favorite must be a boolean");
    }
    contact.favorite = body.favorite;
  }
  return contact;
}

export async function create(req, res) {
  const contact = contactData(req.body);
  if (!contact.name) throw new ApiError(400, "Name can not be empty");
  res.json(await new ContactService(MongoDB.client).create(contact));
}

export async function findAll(req, res) {
  const service = new ContactService(MongoDB.client);
  const name = req.query.name ?? req.get("name");
  if (name !== undefined && typeof name !== "string") {
    throw new ApiError(400, "name must be a string");
  }
  res.json(name ? await service.findByName(name) : await service.find());
}

export async function findOne(req, res) {
  const contact = await new ContactService(MongoDB.client).findById(req.params.id);
  if (!contact) throw new ApiError(404, "Contact not found");
  res.json(contact);
}

export async function update(req, res) {
  const contact = contactData(req.body);
  if (!Object.keys(contact).length) {
    throw new ApiError(400, "Data to update can not be empty");
  }
  const updated = await new ContactService(MongoDB.client).update(req.params.id, contact);
  if (!updated) throw new ApiError(404, "Contact not found");
  res.json({ message: "Contact was updated successfully" });
}

export async function remove(req, res) {
  const deleted = await new ContactService(MongoDB.client).delete(req.params.id);
  if (!deleted) throw new ApiError(404, "Contact not found");
  res.json({ message: "Contact was deleted successfully" });
}

export async function deleteAll(_req, res) {
  const count = await new ContactService(MongoDB.client).deleteAll();
  res.json({ message: `${count} contacts were deleted successfully` });
}

export async function findAllFavorite(_req, res) {
  res.json(await new ContactService(MongoDB.client).findFavorite());
}
