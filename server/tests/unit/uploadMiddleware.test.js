import { upload } from "../../middleware/uploadMiddleware.js";
import path from "path";

describe("uploadMiddleware storage config", () => {
    const storage = upload.storage;

    it("sets destination to uploads/", done => {
        storage.getDestination({}, {}, (err, destination) => {
            expect(destination).toBe("uploads/");
            done();
        });
    });

    it("generates filename with unique suffix and correct extension", done => {
        const file = { originalname: "avatar.png" };
        storage.getFilename({}, file, (err, filename) => {
            const ext = path.extname(file.originalname);
            expect(filename).toMatch(new RegExp(`${ext}$`)); // ends with .png
            expect(filename).toMatch(/^\d+-\d+\.png$/); // timestamp-random.png
            done();
        });
    });
});
