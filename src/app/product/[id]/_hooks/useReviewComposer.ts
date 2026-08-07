"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useSubmitReview, useUploadReviewPhoto } from "@/hooks/api/useReviews";
import type { ListingId, OrderId, ResourceId } from "@/api/generated/types.gen";

/** What the API accepts and what a review is capped at. Both are the server's numbers. */
export const MAX_ATTACHMENTS = 10;
export const MAX_BODY = 2000;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp"];

/** A photo that has reached storage, held with its local preview until the form is sent. */
export interface StagedPhoto {
  resourceId: ResourceId;
  previewUrl: string;
}

/**
 * The review form's state and the two round trips behind it.
 *
 * Photos are uploaded as they are picked rather than on submit: an upload is three steps
 * and the middle one leaves this API, so failing one photo has to leave the other four
 * and the typed body alone. The submit then carries resource ids that are already real.
 */
export function useReviewComposer(listingId: ListingId) {
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<StagedPhoto[]>([]);

  const upload = useUploadReviewPhoto();
  const submit = useSubmitReview();

  const addPhotos = async (files: File[]) => {
    const room = MAX_ATTACHMENTS - photos.length;
    if (room <= 0) {
      toast.error(`Tối đa ${MAX_ATTACHMENTS} ảnh cho một đánh giá.`);
      return;
    }

    for (const file of files.slice(0, room)) {
      if (!ACCEPTED_MIME.includes(file.type)) {
        toast.error(`${file.name}: chỉ nhận ảnh JPG, PNG hoặc WEBP.`);
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        toast.error(`${file.name}: ảnh vượt quá 10 MB.`);
        continue;
      }
      try {
        const resourceId = await upload.mutateAsync(file);
        setPhotos((current) => [...current, { resourceId, previewUrl: URL.createObjectURL(file) }]);
      } catch {
        // The global handler already raised the toast; the loop keeps the rest of the batch.
      }
    }
  };

  const removePhoto = (resourceId: ResourceId) => {
    setPhotos((current) => {
      const dropped = current.find((photo) => photo.resourceId === resourceId);
      if (dropped) URL.revokeObjectURL(dropped.previewUrl);
      return current.filter((photo) => photo.resourceId !== resourceId);
    });
  };

  const reset = () => {
    photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setPhotos([]);
    setRating(0);
    setBody("");
  };

  const send = (orderId: OrderId, onDone: () => void) => {
    if (rating < 1) {
      toast.error("Vui lòng chọn số sao.");
      return;
    }
    submit.mutate(
      {
        listingId,
        order_id: orderId,
        rating,
        body: body.trim(),
        attachments: photos.map((photo) => photo.resourceId),
      },
      {
        onSuccess: () => {
          toast.success("Đã gửi đánh giá. Cảm ơn bạn!");
          reset();
          onDone();
        },
      },
    );
  };

  return {
    rating,
    setRating,
    body,
    setBody,
    photos,
    addPhotos,
    removePhoto,
    reset,
    send,
    isUploading: upload.isPending,
    isSending: submit.isPending,
  };
}
