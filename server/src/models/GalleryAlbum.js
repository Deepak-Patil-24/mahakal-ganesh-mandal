const mongoose = require("mongoose");

const galleryAlbumSchema = new mongoose.Schema(
  {
    festivalYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FestivalYear",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please provide album name"],
      trim: true,
      maxlength: [100, "Album name cannot be more than 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    event: {
      type: String,
      maxlength: [100, "Event name cannot be more than 100 characters"],
    },
    coverImage: {
      type: String,
    },
    photos: [
      {
        url: {
          type: String,
          required: true,
        },
        caption: {
          type: String,
          maxlength: [200, "Caption cannot be more than 200 characters"],
        },
        order: {
          type: Number,
          default: 0,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

galleryAlbumSchema.index({ festivalYear: 1, isPublished: 1 });

module.exports = mongoose.model("GalleryAlbum", galleryAlbumSchema);
