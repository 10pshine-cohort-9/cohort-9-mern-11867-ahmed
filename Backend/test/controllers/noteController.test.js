import * as chai from "chai";
import sinon from "sinon";
import Note from "../../src/models/Note.js";
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
} from "../../src/controllers/noteController.js";

const expect = chai.expect;

describe("Note Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      userId: "testUserId",
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("createNote", () => {
    it("should create a note and return 201 status", async () => {
      req.body = { title: "Test Title", content: "Test Content" };

      const saveStub = sinon.stub(Note.prototype, "save").resolves({
        _id: "mockId",
        title: "Test Title",
        content: "Test Content",
        userId: req.userId,
      });

      await createNote(req, res, next);

      expect(saveStub.calledOnce).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property("title", "Test Title");
    });

    it("should call next with error on failure", async () => {
      const error = new Error("Database error");
      sinon.stub(Note.prototype, "save").rejects(error);

      await createNote(req, res, next);

      expect(next.calledWith(error)).to.be.true;
    });
  });

  describe("getNotes", () => {
    it("should return a list of notes for the user", async () => {
      const mockNotes = [{ title: "Note 1" }, { title: "Note 2" }];
      
      const sortStub = sinon.stub().resolves(mockNotes);
      sinon.stub(Note, "find").returns({ sort: sortStub });

      await getNotes(req, res, next);

      expect(Note.find.calledWith({ userId: req.userId })).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockNotes)).to.be.true;
    });

    it("should call next with error on failure", async () => {
      const error = new Error("Database error");
      const sortStub = sinon.stub().rejects(error);
      sinon.stub(Note, "find").returns({ sort: sortStub });

      await getNotes(req, res, next);

      expect(next.calledWith(error)).to.be.true;
    });
  });

  describe("getNoteById", () => {
    it("should return a note if found", async () => {
      req.params.id = "mockNoteId";
      const mockNote = { _id: "mockNoteId", title: "Test" };
      sinon.stub(Note, "findOne").resolves(mockNote);

      await getNoteById(req, res, next);

      expect(Note.findOne.calledWith({ _id: "mockNoteId", userId: req.userId })).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockNote)).to.be.true;
    });

    it("should return 404 if note not found", async () => {
      req.params.id = "mockNoteId";
      sinon.stub(Note, "findOne").resolves(null);

      await getNoteById(req, res, next);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ error: "Note not found" })).to.be.true;
    });

    it("should call next with error on failure", async () => {
      const error = new Error("Database error");
      sinon.stub(Note, "findOne").rejects(error);

      await getNoteById(req, res, next);

      expect(next.calledWith(error)).to.be.true;
    });
  });

  describe("updateNote", () => {
    it("should update and return the note", async () => {
      req.params.id = "mockNoteId";
      req.body = { title: "Updated Title", content: "Updated Content" };
      const updatedNote = { _id: "mockNoteId", ...req.body };
      
      sinon.stub(Note, "findOneAndUpdate").resolves(updatedNote);

      await updateNote(req, res, next);

      expect(Note.findOneAndUpdate.calledWith(
        { _id: "mockNoteId", userId: req.userId },
        req.body,
        { new: true, runValidators: true }
      )).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(updatedNote)).to.be.true;
    });

    it("should return 404 if note to update is not found", async () => {
      req.params.id = "mockNoteId";
      sinon.stub(Note, "findOneAndUpdate").resolves(null);

      await updateNote(req, res, next);

      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should call next with error on failure", async () => {
      const error = new Error("Database error");
      sinon.stub(Note, "findOneAndUpdate").rejects(error);

      await updateNote(req, res, next);

      expect(next.calledWith(error)).to.be.true;
    });
  });

  describe("deleteNote", () => {
    it("should delete the note and return success message", async () => {
      req.params.id = "mockNoteId";
      sinon.stub(Note, "findOneAndDelete").resolves({ _id: "mockNoteId" });

      await deleteNote(req, res, next);

      expect(Note.findOneAndDelete.calledWith({ _id: "mockNoteId", userId: req.userId })).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ message: "Note deleted successfully" })).to.be.true;
    });

    it("should return 404 if note to delete is not found", async () => {
      req.params.id = "mockNoteId";
      sinon.stub(Note, "findOneAndDelete").resolves(null);

      await deleteNote(req, res, next);

      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should call next with error on failure", async () => {
      const error = new Error("Database error");
      sinon.stub(Note, "findOneAndDelete").rejects(error);

      await deleteNote(req, res, next);

      expect(next.calledWith(error)).to.be.true;
    });
  });
});
