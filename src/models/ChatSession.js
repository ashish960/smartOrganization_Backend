import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    sources: [{ document_id: String, page: Number, relevance: Number }],
    createdAt: { type: Date, default: Date.now },
});

const chatSessionSchema = new mongoose.Schema(
    {
        // Ownership
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
        department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },

        // Session info
        title: { type: String, default: "New Conversation" },
        messages: [messageSchema],

        // Status
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Auto-generate title from first user message
chatSessionSchema.pre("save", function (next) {
    if (this.isModified("messages") && this.messages.length === 1 && this.messages[0].role === "user") {
        const firstMsg = this.messages[0].content;
        this.title = firstMsg.length > 50 ? firstMsg.substring(0, 50) + "..." : firstMsg;
    }
    next();
});

export default mongoose.model("ChatSession", chatSessionSchema);