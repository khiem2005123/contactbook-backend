const { ObjectId } = require("mongodb");

class ContactService {
    constructor(client) {
        this.Contact = client.db().collection("contacts");
    }

    // Định nghĩa phương thức trích xuất dữ liệu từ payload [cite: 451-464]
    extractContactData(payload) {
        const contact = {
            name: payload.name,
            email: payload.email,
            address: payload.address,
            phone: payload.phone,
            favorite: payload.favorite,
        };
        // Loại bỏ các trường không được định nghĩa [cite: 459-463]
        Object.keys(contact).forEach(
            (key) => contact[key] === undefined && delete contact[key]
        );
        return contact;
    }

    async create(payload) {
        const contact = this.extractContactData(payload);
        const result = await this.Contact.findOneAndUpdate(
            contact,
            { $set: { favorite: contact.favorite === true } },
            { returnDocument: "after", upsert: true }
        );
        return result;
    }

    async find(filter) {
    const cursor = await this.Contact.find(filter);
    return await cursor.toArray();
    }

    async findByName(name) {
    return await this.find({
        name: { $regex: new RegExp(name), $options: "i" },
    });
    }

    async findById(id) {
    return await this.Contact.findOne({
        _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
}

    async update(id, payload) {
    const filter = {
        _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractContactData(payload);
    const result = await this.Contact.findOneAndUpdate(
        filter,
        { $set: update },
        { returnDocument: "after" }
    );
    return result; // Hoặc result.value tùy phiên bản driver
}

    async delete(id) {
    const result = await this.Contact.findOneAndDelete({
        _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result; // Trả về tài liệu đã xóa (hoặc result.value tùy driver) [cite: 637]
}

    async findFavorite() {
    return await this.find({ favorite: true });
}

    async deleteAll() {
    const result = await this.Contact.deleteMany({});
    return result.deletedCount; // Trả về số lượng bản ghi đã bị xóa
}
}

module.exports = ContactService;